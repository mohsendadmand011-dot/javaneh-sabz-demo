import { Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { publicProduct } from "../../../../lib/products";

const input = z
  .object({
    images: z
      .array(
        z.object({
          mediaId: z.string().min(1),
          alt: z.string().max(300).nullable().optional(),
          order: z.number().int().min(0),
          isPrimary: z.boolean(),
        }),
      )
      .max(30),
    videos: z
      .array(
        z.object({
          mediaId: z.string().min(1),
          order: z.number().int().min(0),
        }),
      )
      .max(5)
      .default([]),
  })
  .refine((data) => data.images.filter((item) => item.isPrimary).length <= 1, {
    message: "Only one primary image is allowed.",
  });

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      {
        error: "چیدمان رسانه محصول نامعتبر است.",
        details: parsed.error.flatten(),
      },
      { status: 400 },
    );
  const { id } = await context.params;
  const mediaIds = [
    ...parsed.data.images.map((item) => item.mediaId),
    ...parsed.data.videos.map((item) => item.mediaId),
  ];
  const media = await prisma.media.findMany({
    where: { id: { in: mediaIds } },
  });
  if (media.length !== new Set(mediaIds).size)
    return Response.json(
      { error: "یک یا چند رسانه پیدا نشد." },
      { status: 400 },
    );
  const byId = new Map(media.map((item) => [item.id, item]));
  if (
    parsed.data.images.some(
      (item) => byId.get(item.mediaId)?.fileType !== "IMAGE",
    ) ||
    parsed.data.videos.some(
      (item) => byId.get(item.mediaId)?.fileType !== "VIDEO",
    )
  )
    return Response.json(
      { error: "نوع رسانه با جایگاه انتخابی سازگار نیست." },
      { status: 400 },
    );
  const product = await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productVideo.deleteMany({ where: { productId: id } });
    if (parsed.data.images.length)
      await tx.productImage.createMany({
        data: parsed.data.images.map((item, index) => ({
          productId: id,
          mediaId: item.mediaId,
          url: byId.get(item.mediaId)!.url,
          alt: item.alt || byId.get(item.mediaId)!.alt,
          order: item.order,
          isPrimary:
            item.isPrimary ||
            (!parsed.data.images.some((image) => image.isPrimary) &&
              index === 0),
        })),
      });
    if (parsed.data.videos.length)
      await tx.productVideo.createMany({
        data: parsed.data.videos.map((item) => ({
          productId: id,
          mediaId: item.mediaId,
          order: item.order,
        })),
      });
    await tx.auditLog.create({
      data: {
        userId: auth.user.id,
        action: "UPDATE_MEDIA",
        entity: "Product",
        entityId: id,
      },
    });
    return tx.product.findUniqueOrThrow({
      where: { id },
      include: {
        category: true,
        images: true,
        videos: { include: { media: true } },
      },
    });
  });
  return Response.json({ product: publicProduct(product) });
}

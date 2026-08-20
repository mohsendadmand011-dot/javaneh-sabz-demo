import { Role } from "@prisma/client";
import { requireRole } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { publicProduct } from "../../../lib/products";
import { productInput } from "../route";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      category: true,
      images: true,
      videos: { include: { media: true } },
    },
  });
  return product
    ? Response.json({ product: publicProduct(product) })
    : Response.json({ error: "محصول پیدا نشد" }, { status: 404 });
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const parsed = productInput
    .partial()
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      {
        error: "اطلاعات محصول نامعتبر است",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  const { id } = await context.params;
  const { image, ...data } = parsed.data;
  const product = await prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data });
    if (image) {
      const media = await tx.media.findFirst({ where: { url: image } });
      await tx.productImage.updateMany({
        where: { productId: id, isPrimary: true },
        data: { isPrimary: false },
      });
      await tx.productImage.create({
        data: {
          productId: id,
          mediaId: media?.id,
          url: image,
          alt: data.name,
          isPrimary: true,
        },
      });
    }
    await tx.auditLog.create({
      data: {
        userId: auth.user.id,
        action: "UPDATE",
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

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN]);
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  await prisma.$transaction([
    prisma.product.update({ where: { id }, data: { status: "ARCHIVED" } }),
    prisma.auditLog.create({
      data: {
        userId: auth.user.id,
        action: "ARCHIVE",
        entity: "Product",
        entityId: id,
      },
    }),
  ]);
  return Response.json({ ok: true });
}

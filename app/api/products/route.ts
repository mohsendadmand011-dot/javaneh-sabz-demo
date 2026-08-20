import { PublishStatus, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { publicProduct } from "../../lib/products";

export const productInput = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .max(160),
  sku: z.string().trim().min(2).max(80),
  description: z.string().trim().min(10).max(20000),
  shortDescription: z.string().trim().max(500).nullable().optional(),
  price: z.coerce
    .number()
    .int()
    .min(0)
    .max(999_999_999_999)
    .nullable()
    .optional(),
  previousPrice: z.coerce
    .number()
    .int()
    .min(0)
    .max(999_999_999_999)
    .nullable()
    .optional(),
  stock: z.coerce.number().int().min(0).max(10_000_000),
  categoryId: z.string().min(1),
  featured: z.boolean().optional().default(false),
  popular: z.boolean().optional().default(false),
  status: z.nativeEnum(PublishStatus).optional().default(PublishStatus.DRAFT),
  image: z.string().trim().max(2048).optional(),
  seoTitle: z.string().trim().max(160).nullable().optional(),
  metaDescription: z.string().trim().max(320).nullable().optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const includeDrafts = url.searchParams.get("admin") === "1";
  if (includeDrafts) {
    const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
    if ("error" in auth) return auth.error;
  }
  const products = await prisma.product.findMany({
    where: includeDrafts ? {} : { status: PublishStatus.PUBLISHED },
    include: {
      category: true,
      images: true,
      videos: { include: { media: true } },
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });
  return Response.json(
    { products: products.map(publicProduct) },
    { headers: { "cache-control": "no-store" } },
  );
}

export async function POST(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const parsed = productInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      {
        error: "اطلاعات محصول نامعتبر است",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  const { image, ...data } = parsed.data;
  const product = await prisma.$transaction(async (tx) => {
    const created = await tx.product.create({ data });
    if (image)
      await tx.productImage.create({
        data: {
          productId: created.id,
          url: image,
          alt: created.name,
          isPrimary: true,
        },
      });
    await tx.auditLog.create({
      data: {
        userId: auth.user.id,
        action: "CREATE",
        entity: "Product",
        entityId: created.id,
      },
    });
    return tx.product.findUniqueOrThrow({
      where: { id: created.id },
      include: {
        category: true,
        images: true,
        videos: { include: { media: true } },
      },
    });
  });
  return Response.json({ product: publicProduct(product) }, { status: 201 });
}

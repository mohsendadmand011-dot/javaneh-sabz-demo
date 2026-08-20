import { Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const input = z.object({ productId: z.string().min(1) });

async function wishlistFor(userId: string) {
  const customer = await prisma.customer.findUnique({ where: { userId } });
  if (!customer) return null;
  return prisma.wishlist.upsert({
    where: { customerId: customer.id },
    update: {},
    create: { customerId: customer.id },
  });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, [Role.CUSTOMER]);
  if ("error" in auth) return auth.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "محصول معتبر نیست" }, { status: 400 });
  const wishlist = await wishlistFor(auth.user.id);
  if (!wishlist)
    return Response.json({ error: "حساب مشتری پیدا نشد" }, { status: 404 });
  await prisma.wishlistItem.upsert({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId: parsed.data.productId,
      },
    },
    update: {},
    create: { wishlistId: wishlist.id, productId: parsed.data.productId },
  });
  return Response.json({ ok: true }, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireRole(request, [Role.CUSTOMER]);
  if ("error" in auth) return auth.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "محصول معتبر نیست" }, { status: 400 });
  const wishlist = await wishlistFor(auth.user.id);
  if (!wishlist)
    return Response.json({ error: "حساب مشتری پیدا نشد" }, { status: 404 });
  await prisma.wishlistItem.deleteMany({
    where: { wishlistId: wishlist.id, productId: parsed.data.productId },
  });
  return Response.json({ ok: true });
}

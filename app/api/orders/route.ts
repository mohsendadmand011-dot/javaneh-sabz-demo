import { Role } from "@prisma/client";
import { z } from "zod";
import { getRequestUser, requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const orderInput = z.object({
  firstName: z.string().trim().min(2).max(80),
  lastName: z.string().trim().min(2).max(100),
  mobile: z.string().trim().min(10).max(20),
  email: z.string().email().nullable().optional(),
  province: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(8).max(1000),
  postalCode: z.string().trim().min(5).max(20),
  notes: z.string().trim().max(2000).nullable().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.coerce.number().int().min(1).max(1000),
      }),
    )
    .min(1)
    .max(100),
});

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  if (!user)
    return Response.json({ error: "ورود الزامی است" }, { status: 401 });
  const where =
    user.role === Role.CUSTOMER ? { customer: { userId: user.id } } : {};
  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return Response.json({
    orders: orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    })),
  });
}

export async function POST(request: Request) {
  const parsed = orderInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      {
        error: "اطلاعات سفارش نامعتبر است",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  const user = await getRequestUser(request);
  const ids = parsed.data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: ids }, status: "PUBLISHED" },
  });
  if (products.length !== new Set(ids).size)
    return Response.json(
      { error: "یک یا چند محصول معتبر نیست" },
      { status: 400 },
    );
  const byId = new Map(products.map((product) => [product.id, product]));
  for (const item of parsed.data.items)
    if ((byId.get(item.productId)?.stock ?? 0) < item.quantity)
      return Response.json(
        { error: "موجودی یکی از محصولات کافی نیست" },
        { status: 409 },
      );
  const subtotal = parsed.data.items.reduce(
    (sum, item) =>
      sum + Number(byId.get(item.productId)!.price ?? 0) * item.quantity,
    0,
  );
  const number = `JS-${Date.now().toString().slice(-8)}`;
  const order = await prisma.$transaction(async (tx) => {
    for (const item of parsed.data.items)
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    let customerId: string | undefined;
    if (user?.role === Role.CUSTOMER)
      customerId = (
        await tx.customer.findUnique({ where: { userId: user.id } })
      )?.id;
    return tx.order.create({
      data: {
        number,
        customerId,
        ...parsed.data,
        items: {
          create: parsed.data.items.map((item) => {
            const product = byId.get(item.productId)!;
            return {
              productId: product.id,
              productName: product.name,
              sku: product.sku,
              price: product.price ?? 0,
              quantity: item.quantity,
              imageUrl: null,
            };
          }),
        },
        subtotal,
        shipping: 0,
        total: subtotal,
      },
      include: { items: true },
    });
  });
  return Response.json(
    {
      order: {
        id: order.id,
        number: order.number,
        total: Number(order.total),
        status: order.status,
      },
    },
    { status: 201 },
  );
}

export async function PATCH(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  return Response.json({ error: "شناسه سفارش الزامی است" }, { status: 400 });
}

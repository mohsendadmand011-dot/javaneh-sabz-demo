import { Role } from "@prisma/client";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { publicProduct } from "../../lib/products";

export async function GET(request: Request) {
  const auth = await requireRole(request, [Role.CUSTOMER]);
  if ("error" in auth) return auth.error;
  const customer = await prisma.customer.findUnique({
    where: { userId: auth.user.id },
    include: {
      addresses: { orderBy: { createdAt: "desc" } },
      orders: { include: { items: true }, orderBy: { createdAt: "desc" } },
      wishlist: {
        include: {
          items: {
            include: {
              product: {
                include: {
                  category: true,
                  images: true,
                  videos: { include: { media: true } },
                },
              },
            },
          },
        },
      },
    },
  });
  if (!customer)
    return Response.json({ error: "حساب مشتری پیدا نشد" }, { status: 404 });
  return Response.json({
    user: auth.user,
    mobile: customer.mobile,
    addresses: customer.addresses,
    orders: customer.orders.map((order) => ({
      ...order,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      items: order.items.map((item) => ({
        ...item,
        price: Number(item.price),
      })),
    })),
    wishlist: (customer.wishlist?.items || []).map((item) =>
      publicProduct(item.product),
    ),
  });
}

import { Role } from "@prisma/client";
import { requireRole } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const [
    products,
    customers,
    orders,
    pending,
    revenue,
    lowInventory,
    recentArticles,
    recentEvents,
  ] = await Promise.all([
    prisma.product.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.customer.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.product.count({ where: { status: "PUBLISHED", stock: { lte: 5 } } }),
    prisma.article.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
    }),
    prisma.event.count({ where: { startsAt: { gte: new Date() } } }),
  ]);
  return Response.json({
    products,
    customers,
    orders,
    pending,
    revenue: Number(revenue._sum.total ?? 0),
    lowInventory,
    recentArticles,
    recentEvents,
  });
}

import { OrderStatus, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const input = z.object({ status: z.nativeEnum(OrderStatus) });
export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "وضعیت نامعتبر است" }, { status: 400 });
  const { id } = await context.params;
  const order = await prisma.order.update({ where: { id }, data: parsed.data });
  return Response.json({
    order: {
      ...order,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
    },
  });
}

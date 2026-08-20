import { Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const input = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  order: z.coerce.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "دسته‌بندی نامعتبر است" }, { status: 400 });
  const { id } = await context.params;
  return Response.json({
    category: await prisma.category.update({
      where: { id },
      data: parsed.data,
    }),
  });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN]);
  if ("error" in auth) return auth.error;
  const { id } = await context.params;
  if (await prisma.product.count({ where: { categoryId: id } }))
    return Response.json({ error: "دسته دارای محصول است" }, { status: 409 });
  await prisma.category.delete({ where: { id } });
  return Response.json({ ok: true });
}

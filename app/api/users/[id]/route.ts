import { Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await requireRole(request, [Role.ADMIN]);
  if ("error" in auth) return auth.error;
  const parsed = z
    .object({ role: z.nativeEnum(Role) })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "نقش نامعتبر است" }, { status: 400 });
  const { id } = await context.params;
  if (id === auth.user.id && parsed.data.role !== Role.ADMIN)
    return Response.json(
      { error: "نمی‌توانید نقش مدیر فعلی را حذف کنید" },
      { status: 409 },
    );
  return Response.json({
    user: await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: { id: true, email: true, name: true, role: true },
    }),
  });
}

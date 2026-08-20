import { Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const input = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  order: z.coerce.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

export async function GET() {
  return Response.json({
    categories: await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    }),
  });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "دسته‌بندی نامعتبر است" }, { status: 400 });
  return Response.json(
    { category: await prisma.category.create({ data: parsed.data }) },
    { status: 201 },
  );
}

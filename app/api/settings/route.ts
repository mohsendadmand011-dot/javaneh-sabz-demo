import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export async function GET() {
  const rows = await prisma.siteSetting.findMany();
  return Response.json({
    settings: Object.fromEntries(rows.map((row) => [row.key, row.value])),
  });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const parsed = z
    .object({
      key: z.enum(["homepage", "contact", "footer", "seo"]),
      value: z.record(z.string(), z.unknown()),
    })
    .safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "تنظیمات نامعتبر است" }, { status: 400 });
  const setting = await prisma.siteSetting.upsert({
    where: { key: parsed.data.key },
    update: { value: parsed.data.value as Prisma.InputJsonValue },
    create: {
      key: parsed.data.key,
      value: parsed.data.value as Prisma.InputJsonValue,
    },
  });
  return Response.json({ setting });
}

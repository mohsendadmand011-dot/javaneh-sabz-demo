import { Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const themes = ["natural", "pistachio", "olive", "earth", "premium"] as const;
const input = z.object({ theme: z.enum(themes) });

export async function GET() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: "activeTheme" },
  });
  const theme =
    typeof setting?.value === "string" &&
    themes.includes(setting.value as (typeof themes)[number])
      ? setting.value
      : "natural";
  return Response.json({ theme }, { headers: { "cache-control": "no-store" } });
}

export async function POST(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN, Role.EDITOR]);
  if ("error" in auth) return auth.error;
  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json({ error: "تم نامعتبر است" }, { status: 400 });
  await prisma.siteSetting.upsert({
    where: { key: "activeTheme" },
    update: { value: parsed.data.theme },
    create: { key: "activeTheme", value: parsed.data.theme },
  });
  return Response.json(parsed.data);
}

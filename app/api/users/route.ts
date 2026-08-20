import { Role } from "@prisma/client";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

export async function GET(request: Request) {
  const auth = await requireRole(request, [Role.ADMIN]);
  if ("error" in auth) return auth.error;
  return Response.json({
    users: await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  });
}

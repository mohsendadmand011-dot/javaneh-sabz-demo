import { compare } from "bcryptjs";
import { z } from "zod";
import { createSession, sessionCookie } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const credentials = z.object({
  email: z.string().email().max(254),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const parsed = credentials.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      { error: "اطلاعات ورود نامعتبر است" },
      { status: 400 },
    );
  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email.toLowerCase() },
  });
  if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
    return Response.json(
      { error: "ایمیل یا رمز عبور نادرست است" },
      { status: 401 },
    );
  }
  const { token, expiresAt } = await createSession(user.id);
  return Response.json(
    {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
    {
      headers: {
        "set-cookie": sessionCookie(token, expiresAt),
        "cache-control": "no-store",
      },
    },
  );
}

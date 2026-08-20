import { hash } from "bcryptjs";
import { z } from "zod";
import { createSession, sessionCookie } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

const registration = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  mobile: z.string().trim().min(10).max(20).optional(),
  password: z.string().min(8).max(200),
});

export async function POST(request: Request) {
  const parsed = registration.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      {
        error: "اطلاعات ثبت‌نام معتبر نیست",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );

  const email = parsed.data.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } }))
    return Response.json(
      { error: "این ایمیل قبلاً ثبت شده است" },
      { status: 409 },
    );

  const passwordHash = await hash(parsed.data.password, 12);
  const user = await prisma.user.create({
    data: {
      email,
      name: parsed.data.name,
      passwordHash,
      role: "CUSTOMER",
      customer: {
        create: {
          mobile: parsed.data.mobile || null,
          wishlist: { create: {} },
        },
      },
    },
    select: { id: true, email: true, name: true, role: true },
  });
  const { token, expiresAt } = await createSession(user.id);
  return Response.json(
    { user },
    {
      status: 201,
      headers: {
        "set-cookie": sessionCookie(token, expiresAt),
        "cache-control": "no-store",
      },
    },
  );
}

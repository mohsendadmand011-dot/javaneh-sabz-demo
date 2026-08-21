import { createHash, randomBytes } from "node:crypto";
import type { Role } from "@prisma/client";
import { prisma } from "./prisma";

export const SESSION_COOKIE = "javaneh_session";
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7;

const hashToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_AGE_SECONDS * 1000);
  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  return { token, expiresAt };
}

export function sessionCookie(token: string, expiresAt: Date) {
  const secure = process.env.NEXT_PUBLIC_APP_URL?.startsWith("https://")
    ? "; Secure"
    : "";
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}${secure}`;
}

export function expiredSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function readCookie(header: string | null, name = SESSION_COOKIE) {
  const item = header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return item ? decodeURIComponent(item.slice(name.length + 1)) : null;
}

export async function getSessionUserFromToken(token: string | null) {
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: { select: { id: true, email: true, name: true, role: true } },
    },
  });
  if (!session || session.expiresAt <= new Date()) {
    if (session)
      await prisma.session
        .delete({ where: { id: session.id } })
        .catch(() => undefined);
    return null;
  }
  return session.user;
}

export async function getRequestUser(request: Request) {
  return getSessionUserFromToken(readCookie(request.headers.get("cookie")));
}

export async function requireRole(request: Request, allowed: Role[]) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return {
      error: Response.json(
        { error: "درخواست بین‌سایتی رد شد" },
        { status: 403 },
      ),
    } as const;
  }
  const user = await getRequestUser(request);
  if (!user)
    return {
      error: Response.json(
        { error: "ورود به حساب الزامی است" },
        { status: 401 },
      ),
    } as const;
  if (!allowed.includes(user.role))
    return {
      error: Response.json({ error: "دسترسی کافی ندارید" }, { status: 403 }),
    } as const;
  return { user } as const;
}

export async function revokeRequestSession(request: Request) {
  const token = readCookie(request.headers.get("cookie"));
  if (token)
    await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}

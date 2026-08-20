import { expiredSessionCookie, revokeRequestSession } from "../../../lib/auth";

export async function POST(request: Request) {
  await revokeRequestSession(request);
  return Response.json(
    { ok: true },
    { headers: { "set-cookie": expiredSessionCookie() } },
  );
}

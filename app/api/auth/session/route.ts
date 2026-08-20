import { getRequestUser } from "../../../lib/auth";

export async function GET(request: Request) {
  const user = await getRequestUser(request);
  return Response.json({ user }, { headers: { "cache-control": "no-store" } });
}

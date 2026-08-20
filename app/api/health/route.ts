import { prisma } from "../../lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    return Response.json(
      {
        status: "unavailable",
        service: "javaneh-sabz",
        database: "unavailable",
      },
      { status: 503, headers: { "cache-control": "no-store" } },
    );
  }
  return Response.json(
    {
      status: "ok",
      service: "javaneh-sabz",
      database: "ok",
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        "cache-control": "no-store",
      },
    },
  );
}

import { Role } from "@prisma/client";
import { z } from "zod";
import { requireRole } from "../../lib/auth";
import { prisma } from "../../lib/prisma";

const addressInput = z.object({
  province: z.string().trim().min(2).max(80),
  city: z.string().trim().min(2).max(80),
  address: z.string().trim().min(8).max(1000),
  postalCode: z.string().trim().min(5).max(20),
});

export async function POST(request: Request) {
  const auth = await requireRole(request, [Role.CUSTOMER]);
  if ("error" in auth) return auth.error;
  const parsed = addressInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return Response.json(
      {
        error: "نشانی معتبر نیست",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  const customer = await prisma.customer.findUnique({
    where: { userId: auth.user.id },
  });
  if (!customer)
    return Response.json({ error: "حساب مشتری پیدا نشد" }, { status: 404 });
  const address = await prisma.address.create({
    data: { customerId: customer.id, ...parsed.data },
  });
  return Response.json({ address }, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requireRole(request, [Role.CUSTOMER]);
  if ("error" in auth) return auth.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id)
    return Response.json({ error: "شناسه نشانی الزامی است" }, { status: 400 });
  const deleted = await prisma.address.deleteMany({
    where: { id, customer: { userId: auth.user.id } },
  });
  return deleted.count
    ? Response.json({ ok: true })
    : Response.json({ error: "نشانی پیدا نشد" }, { status: 404 });
}

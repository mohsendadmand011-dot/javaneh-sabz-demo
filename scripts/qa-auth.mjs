import assert from "node:assert/strict";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const base = process.env.APP_URL || "http://127.0.0.1:3100";
const email = `qa-customer-${Date.now()}@javaneh.local`;
const password = "QA-Customer-2026!";
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

try {
  let response = await fetch(base + "/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: "مشتری آزمون",
      email,
      mobile: "09120000000",
      password,
    }),
  });
  assert.equal(response.status, 201);
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie?.startsWith("javaneh_session="));

  response = await fetch(base + "/api/account", { headers: { cookie } });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).user.role, "CUSTOMER");

  response = await fetch(base + "/api/addresses", {
    method: "POST",
    headers: { cookie, "content-type": "application/json", origin: base },
    body: JSON.stringify({
      province: "تهران",
      city: "تهران",
      address: "نشانی موقت آزمون کیفیت جوانه سبز",
      postalCode: "1234567890",
    }),
  });
  assert.equal(response.status, 201);

  response = await fetch(base + "/api/auth/logout", {
    method: "POST",
    headers: { cookie, origin: base },
  });
  assert.equal(response.status, 200);
  response = await fetch(base + "/api/account", { headers: { cookie } });
  assert.equal(response.status, 401);

  response = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: "wrong-password" }),
  });
  assert.equal(response.status, 401);
  console.log(
    "QA authentication passed: registration, session, customer account, address, logout, invalid password.",
  );
} finally {
  await prisma.user.deleteMany({ where: { email } });
  await prisma.$disconnect();
}

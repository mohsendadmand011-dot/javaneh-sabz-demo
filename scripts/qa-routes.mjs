import assert from "node:assert/strict";

const base = process.env.APP_URL || "http://127.0.0.1:3100";
const publicRoutes = [
  "/",
  "/shop",
  "/shop/fertilizers",
  "/product/bio-root",
  "/search?q=%DA%A9%D9%88%D8%AF",
  "/cart",
  "/checkout",
  "/login",
  "/magazine",
  "/magazine/soil-test",
  "/events",
  "/training",
  "/representatives",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/shipping",
  "/returns",
];
const protectedRoutes = [
  "/admin",
  "/admin/products",
  "/admin/categories",
  "/admin/orders",
  "/admin/articles",
  "/admin/events",
  "/admin/media",
  "/admin/users",
  "/admin/settings",
  "/account",
  "/favorites",
];

for (const route of publicRoutes) {
  const response = await fetch(base + route, { redirect: "manual" });
  assert.equal(response.status, 200, `${route} returned ${response.status}`);
  assert.match(
    response.headers.get("content-type") || "",
    /text\/html/,
    `${route} is not HTML`,
  );
  assert.ok(
    (await response.text()).length > 1000,
    `${route} returned a blank shell`,
  );
}
for (const route of protectedRoutes) {
  const response = await fetch(base + route, { redirect: "manual" });
  assert.ok(
    [302, 303, 307, 308].includes(response.status),
    `${route} was not protected`,
  );
  assert.match(
    response.headers.get("location") || "",
    /\/login/,
    `${route} did not redirect to login`,
  );
}
for (const route of ["/api/media", "/api/users", "/api/account"]) {
  const response = await fetch(base + route);
  assert.equal(
    response.status,
    401,
    `${route} anonymous status was ${response.status}`,
  );
}
const health = await fetch(base + "/api/health");
assert.equal(health.status, 200);
assert.equal((await health.json()).status, "ok");
console.log(
  `QA route contract passed: ${publicRoutes.length} public, ${protectedRoutes.length} protected, 3 private APIs.`,
);

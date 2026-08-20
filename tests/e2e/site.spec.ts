import { expect, test, type Page } from "@playwright/test";

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
  "/does-not-exist",
];

function monitor(page: Page) {
  const failures: string[] = [];
  page.on("pageerror", (error) => failures.push(`pageerror: ${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon"))
      failures.push(`console: ${message.text()}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 500)
      failures.push(`http ${response.status()}: ${response.url()}`);
  });
  return failures;
}

async function adminLogin(page: Page) {
  const adminEmail = process.env.SEED_ADMIN_EMAIL;
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  expect(adminEmail, "SEED_ADMIN_EMAIL is required for admin QA").toBeTruthy();
  expect(
    adminPassword,
    "SEED_ADMIN_PASSWORD is required for admin QA",
  ).toBeTruthy();
  await page.goto("/login");
  await page.locator('input[type="email"]').fill(adminEmail!);
  await page.locator('input[type="password"]').fill(adminPassword!);
  await page.getByRole("button", { name: "ورود", exact: true }).click();
  await expect(page).toHaveURL(/\/admin/);
}

test("all public routes render RTL content without critical errors", async ({
  page,
}) => {
  const failures = monitor(page);
  for (const route of publicRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBeLessThan(400);
    await expect(page.locator("body"), route).not.toBeEmpty();
    await expect(page.locator("html"), route).toHaveAttribute("dir", "rtl");
    expect(
      (await page.locator("body").innerText()).trim().length,
      route,
    ).toBeGreaterThan(20);
  }
  await expect(page.getByText("این صفحه پیدا نشد")).toBeVisible();
  expect(failures).toEqual([]);
});

test("shop, product gallery, search and cart interactions work", async ({
  page,
}) => {
  const failures = monitor(page);
  await page.goto("/shop");
  const cards = page.locator(".productCard");
  await expect(cards.first()).toBeVisible();
  await cards
    .first()
    .getByRole("button", { name: /افزودن به سبد/ })
    .click();
  await page.goto("/cart");
  await expect(page.locator(".cartLine")).toHaveCount(1);
  await page.locator('.cartLine input[type="number"]').fill("2");
  await expect(page.locator('.cartLine input[type="number"]')).toHaveValue("2");
  await page.locator(".cartLine button").click();
  await expect(page.locator(".cartLine")).toHaveCount(0);
  await page.goto("/product/bio-root");
  await expect(page.locator(".detail")).toBeVisible();
  await expect(page.locator(".galleryThumbs button").first()).toBeVisible();
  await page.goto("/search?q=%DA%A9%D9%88%D8%AF");
  await expect(page.locator(".pageTitle")).toContainText("کود");
  expect(failures).toEqual([]);
});

test("admin authentication, protected routes, editor and logout work", async ({
  page,
  context,
}) => {
  let response = await page.goto("/admin");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/login\?returnTo=/);
  await adminLogin(page);
  await page.reload();
  await expect(page.locator(".admin")).toBeVisible();
  for (const route of [
    "/admin/products",
    "/admin/categories",
    "/admin/orders",
    "/admin/articles",
    "/admin/events",
    "/admin/media",
    "/admin/users",
    "/admin/settings",
  ]) {
    await page.goto(route);
    await expect(page.locator(".admin")).toBeVisible();
  }
  await page.goto("/admin/products");
  await page.getByRole("button", { name: "ویرایش" }).first().click();
  await expect(page.locator(".editor")).toBeVisible();
  await page.getByRole("button", { name: /خروج از حساب/ }).click();
  await expect(page).toHaveURL(/\/login/);
  await context.clearCookies();
  response = await page.goto("/api/media");
  expect(response?.status()).toBe(401);
});

const visualPages = [
  ["home", "/"],
  ["shop", "/shop"],
  ["product", "/product/bio-root"],
  ["magazine", "/magazine"],
  ["article", "/magazine/soil-test"],
  ["cart", "/cart"],
  ["login", "/login"],
] as const;

for (const [name, route] of visualPages) {
  test(`visual ${name}`, async ({ page }) => {
    await page.goto(route);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      Array.from(document.images).every((image) => image.complete),
    );
    if (name === "product") {
      await expect(page.locator("video")).toHaveCount(1);
      await expect(page.locator(".galleryThumbs button")).toHaveCount(3);
      await page.waitForTimeout(300);
    }
    await expect(page).toHaveScreenshot(`${name}.png`, {
      fullPage: true,
      mask: [page.locator("video")],
      maskColor: "#202020",
    });
  });
}

test("visual admin dashboard and product editor", async ({ page }) => {
  await adminLogin(page);
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot("admin-dashboard.png", {
    fullPage: true,
  });
  await page.goto("/admin/products");
  await page.getByRole("button", { name: "ویرایش" }).first().click();
  await expect(page.locator(".editor")).toBeVisible();
  await expect(page).toHaveScreenshot("admin-product-editor.png", {
    fullPage: true,
  });
});

test("mobile menu opens and navigation remains usable", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile-only interaction");
  await page.goto("/");
  await page.getByRole("button", { name: "منو" }).click();
  await expect(page.locator(".mobileMenu")).toBeVisible();
  await page.locator(".mobileMenu button").first().click();
  await expect(page).toHaveURL(/\/shop/);
});

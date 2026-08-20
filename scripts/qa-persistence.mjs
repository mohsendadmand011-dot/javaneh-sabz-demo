import assert from "node:assert/strict";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const mode = process.argv[2] || "create";
const base = process.env.APP_URL || "http://127.0.0.1:3100";
const statePath = new URL("../data/qa-persistence-state.json", import.meta.url);
const videoPath = new URL("../tests/fixtures/qa-video.mp4", import.meta.url);
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const png = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAF/gL+X8W9WQAAAABJRU5ErkJggg==",
  "base64",
);

async function login() {
  const response = await fetch(base + "/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      email: process.env.SEED_ADMIN_EMAIL,
      password: process.env.SEED_ADMIN_PASSWORD,
    }),
  });
  assert.equal(response.status, 200, "admin login failed");
  return response.headers.get("set-cookie")?.split(";")[0];
}

async function expectStatus(response, expected, label) {
  if (response.status !== expected)
    throw new Error(
      `${label} returned ${response.status}: ${await response.text()}`,
    );
}

async function upload(cookie, files) {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  const response = await fetch(base + "/api/media", {
    method: "POST",
    headers: { cookie, origin: base },
    body: form,
  });
  await expectStatus(response, 201, "media upload");
  return (await response.json()).media;
}

try {
  if (mode === "create") {
    assert.ok(existsSync(videoPath), "QA video fixture is missing");
    await prisma.product.deleteMany({
      where: { slug: { startsWith: "qa-persistence-" } },
    });
    const cookie = await login();
    const categories = await (await fetch(base + "/api/categories")).json();
    const stamp = Date.now();
    let response = await fetch(base + "/api/products", {
      method: "POST",
      headers: { cookie, origin: base, "content-type": "application/json" },
      body: JSON.stringify({
        name: "محصول آزمون ماندگاری",
        slug: `qa-persistence-${stamp}`,
        sku: `QA-${stamp}`,
        description: "محصول موقت برای آزمون خودکار ماندگاری کامل داده و رسانه.",
        price: 100000,
        stock: 5,
        categoryId: categories.categories[0].id,
        status: "PUBLISHED",
      }),
    });
    await expectStatus(response, 201, "product creation");
    const product = (await response.json()).product;
    const images = await upload(cookie, [
      new File([png], "qa-one.png", { type: "image/png" }),
      new File([png], "qa-two.png", { type: "image/png" }),
    ]);
    const video = (
      await upload(cookie, [
        new File([await readFile(videoPath)], "qa-video.mp4", {
          type: "video/mp4",
        }),
      ])
    )[0];
    response = await fetch(`${base}/api/products/${product.id}/media`, {
      method: "PUT",
      headers: { cookie, origin: base, "content-type": "application/json" },
      body: JSON.stringify({
        images: images.map((item, order) => ({
          mediaId: item.id,
          order,
          isPrimary: order === 0,
          alt: "تصویر آزمون",
        })),
        videos: [{ mediaId: video.id, order: 0 }],
      }),
    });
    await expectStatus(response, 200, "product media assignment");
    await writeFile(
      statePath,
      JSON.stringify(
        {
          productId: product.id,
          slug: product.slug,
          mediaIds: [...images.map((item) => item.id), video.id],
          mediaUrls: [...images.map((item) => item.url), video.url],
        },
        null,
        2,
      ),
    );
    console.log(
      `QA persistence data created: ${product.slug}. Restart application and database, then run npm run qa:persistence:verify.`,
    );
  } else {
    const state = JSON.parse(await readFile(statePath, "utf8"));
    if (mode === "verify") {
      const products = await (await fetch(base + "/api/products")).json();
      const product = products.products.find(
        (item) => item.id === state.productId,
      );
      assert.ok(product, "persisted product missing");
      assert.equal(product.images.length, 2);
      assert.equal(product.videos.length, 1);
      for (const url of state.mediaUrls)
        assert.equal(
          (await fetch(base + url)).status,
          200,
          `missing persisted media ${url}`,
        );
      assert.equal((await fetch(`${base}/product/${state.slug}`)).status, 200);
      console.log(
        "QA persistence verified: product, two images, video, public page, and files survived restart.",
      );
    } else if (mode === "cleanup") {
      await prisma.product.deleteMany({ where: { id: state.productId } });
      const cookie = await login();
      for (const id of state.mediaIds) {
        const response = await fetch(`${base}/api/media/${id}`, {
          method: "DELETE",
          headers: { cookie, origin: base },
        });
        assert.ok(
          [200, 404].includes(response.status),
          `media cleanup failed: ${response.status}`,
        );
      }
      await unlink(statePath).catch(() => undefined);
      console.log("QA persistence data cleaned up.");
    } else throw new Error(`Unknown mode: ${mode}`);
  }
} finally {
  await prisma.$disconnect();
}

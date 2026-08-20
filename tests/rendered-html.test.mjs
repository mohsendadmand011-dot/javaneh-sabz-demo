import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${path}`, { headers:{accept:"text/html"} }), { ASSETS:{fetch:async()=>new Response("Not found",{status:404})} }, {waitUntil(){},passThroughOnException(){}});
}

test("renders the Persian public storefront", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /lang="fa"/);
  assert.match(html, /dir="rtl"/);
  assert.match(html, /جوانه سبز/);
  assert.match(html, /محصولات برگزیده/);
  assert.doesNotMatch(html, /codex-preview|SkeletonPreview/);
});

test("build includes the dynamic application route", async () => {
  const response = await render("/shop");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /فروشگاه جوانه سبز|جوانه سبز/);
});

test("health endpoint reports application availability", async () => {
  const response = await render("/api/health");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/json/);
  const body = await response.json();
  assert.equal(body.status, "ok");
  assert.equal(body.service, "javaneh-sabz");
});

import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";

const edge =
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const executablePath =
  process.env.QA_BROWSER_EXECUTABLE || (existsSync(edge) ? edge : undefined);

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "./tests/.results",
  fullyParallel: false,
  retries: 0,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.025, animations: "disabled" },
  },
  reporter: [
    ["list"],
    ["html", { outputFolder: "tests/.report", open: "never" }],
  ],
  use: {
    baseURL: process.env.APP_URL || "http://127.0.0.1:3100",
    locale: "fa-IR",
    timezoneId: "Asia/Tehran",
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    launchOptions: executablePath ? { executablePath } : undefined,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 412, height: 915 } },
    },
  ],
});

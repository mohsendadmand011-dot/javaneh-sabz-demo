import { spawn } from "node:child_process";
import { connect } from "node:net";
import process from "node:process";

const node = process.execPath;
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const port = Number(process.env.LOCAL_DB_PORT || 55432);
const appPort = process.env.PORT || "3100";

let database = null;

async function portReady(targetPort) {
  return new Promise((resolve) => {
    const socket = connect({ host: "127.0.0.1", port: targetPort });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("error", () => resolve(false));
  });
}

async function waitForDatabase() {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const ready = await portReady(port);
    if (ready) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Local PostgreSQL did not become ready within 30 seconds.");
}

if (!(await portReady(port))) {
  database = spawn(node, ["--env-file=.env", "scripts/local-db.mjs", "start"], {
    stdio: "inherit",
  });
  await waitForDatabase();
} else {
  console.log(`Using PostgreSQL already running on 127.0.0.1:${port}.`);
}
const application = spawn(
  npm,
  ["run", "start", "--", "--port", appPort, "--hostname", "0.0.0.0"],
  { stdio: "inherit", shell: process.platform === "win32" },
);

console.log("\nLOCAL WEBSITE: http://127.0.0.1:3100");
console.log("ADMIN:         http://127.0.0.1:3100/admin");
console.log("HEALTH:        http://127.0.0.1:3100/api/health\n");

function shutdown() {
  application.kill("SIGTERM");
  database?.kill("SIGTERM");
}
process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
application.once("exit", (code) => {
  database?.kill("SIGTERM");
  process.exitCode = code ?? 1;
});

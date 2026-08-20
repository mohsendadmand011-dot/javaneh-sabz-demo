import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const password = process.env.LOCAL_DB_PASSWORD;
if (!password) {
  console.error("LOCAL_DB_PASSWORD is required.");
  process.exit(1);
}

const database = process.env.LOCAL_DB_NAME || "javaneh_sabz";
const user = process.env.LOCAL_DB_USER || "javaneh";
const port = Number(process.env.LOCAL_DB_PORT || 55432);
const postgres = new EmbeddedPostgres({
  databaseDir: "./data/local-postgres",
  user,
  password,
  port,
  persistent: true,
  authMethod: "scram-sha-256",
  initdbFlags: ["--encoding=UTF8", "--locale=C"],
  onLog: (message) => console.log(`[postgres] ${message}`),
  onError: (message) => console.error(`[postgres] ${message}`),
});

if ((process.argv[2] || "start") === "stop") {
  const pgCtl = path.resolve(
    "node_modules/@embedded-postgres/windows-x64/native/bin/pg_ctl.exe",
  );
  if (
    process.platform === "win32" &&
    existsSync(pgCtl) &&
    existsSync("./data/local-postgres/PG_VERSION")
  ) {
    await new Promise((resolve, reject) => {
      const processHandle = spawn(
        pgCtl,
        ["stop", "-D", "./data/local-postgres", "-m", "fast", "-w"],
        { stdio: "inherit" },
      );
      processHandle.once("exit", (code) =>
        code === 0
          ? resolve()
          : reject(new Error(`pg_ctl stopped with code ${code}`)),
      );
    });
  } else {
    await postgres.stop();
  }
  console.log("Local PostgreSQL stopped.");
  process.exit(0);
}

if (!existsSync("./data/local-postgres/PG_VERSION")) {
  await postgres.initialise();
}
await postgres.start();
try {
  await postgres.createDatabase(database);
  console.log(`Created database ${database}.`);
} catch (error) {
  if (error?.code !== "42P04") throw error;
}

console.log(`Local PostgreSQL is ready on 127.0.0.1:${port}/${database}.`);
await new Promise(() => {});

import pg from "pg";

const database = "javaneh_clean_qa";
const target = new URL(process.env.DATABASE_URL);
target.pathname = "/postgres";
const client = new pg.Client({ connectionString: target.toString() });
await client.connect();
const action = process.argv[2] || "create";
if (action === "drop") {
  await client.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1`,
    [database],
  );
  await client.query(`DROP DATABASE IF EXISTS ${database}`);
} else {
  await client.query(`DROP DATABASE IF EXISTS ${database}`);
  await client.query(`CREATE DATABASE ${database} ENCODING 'UTF8'`);
}
await client.end();

import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("Missing credentials");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function run() {
  try {
    await client.execute(`
      ALTER TABLE "OrderItem" ADD COLUMN "dealTitle" TEXT;
    `);

    console.log("Success altering table in Turso!");
  } catch (err) {
    console.error(err);
  }
}

run();

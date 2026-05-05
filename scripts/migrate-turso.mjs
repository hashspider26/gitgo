/**
 * migrate-turso.mjs
 * Migrates data from your old Turso account to a new one.
 * No Turso CLI required — runs with Node.js.
 *
 * Usage:
 *   node scripts/migrate-turso.mjs
 */

import { createClient } from "@libsql/client";

// ─── STEP 1: Fill in your OLD account credentials ───────────────────────────
const OLD_URL   = "libsql://greenvalleyseeds-hashspider.aws-ap-south-1.turso.io";
const OLD_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Njc1ODQ5NDYsImlkIjoiZTE1ODBkNzYtMjkzYi00NjhiLTk3MWQtNDBhOTVjODc4MmM4IiwicmlkIjoiNWNjMWY2NGItZjU4My00ZDIyLWExMjItYTVjZjc2MGJlNzQ4In0.vU6JeKE8X1pfkidDMHmT6XFRKGY35AwugB-MRIgWMhiRCAtpTyqE6i5Dis2t8pahFFyrCKGyize-wvXYNgI0BQ";

// ─── STEP 2: Fill in your NEW account credentials ───────────────────────────
//   (get these after creating the new DB on the new Turso account via turso.tech)
const NEW_URL   = "libsql://YOUR_NEW_DB_NAME.turso.io";    // ← replace this
const NEW_TOKEN = "YOUR_NEW_AUTH_TOKEN";                    // ← replace this

// ────────────────────────────────────────────────────────────────────────────

async function main() {
  if (NEW_URL.includes("YOUR_NEW") || NEW_TOKEN.includes("YOUR_NEW")) {
    console.error("❌ Please fill in NEW_URL and NEW_TOKEN before running.");
    process.exit(1);
  }

  const oldDb = createClient({ url: OLD_URL, authToken: OLD_TOKEN });
  const newDb = createClient({ url: NEW_URL, authToken: NEW_TOKEN });

  console.log("🔌 Connected to both databases.\n");

  // 1. Get all tables from old DB
  const tablesRes = await oldDb.execute(
    `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name`
  );
  const tables = tablesRes.rows.map((r) => r.name);
  console.log(`📋 Found ${tables.length} tables:`, tables);

  for (const table of tables) {
    console.log(`\n─── Migrating table: ${table} ───`);

    // 2. Get CREATE TABLE statement
    const schemaRes = await oldDb.execute(
      `SELECT sql FROM sqlite_master WHERE type='table' AND name='${table}'`
    );
    const createSQL = schemaRes.rows[0]?.sql;
    if (!createSQL) {
      console.warn(`  ⚠️  Could not get schema for ${table}, skipping.`);
      continue;
    }

    // 3. Create table in new DB (ignore if already exists)
    const safeCreate = createSQL.replace(/^CREATE TABLE/i, "CREATE TABLE IF NOT EXISTS");
    await newDb.execute(safeCreate);
    console.log(`  ✅ Table created in new DB`);

    // 4. Fetch all rows from old DB
    const rowsRes = await oldDb.execute(`SELECT * FROM "${table}"`);
    const rows = rowsRes.rows;
    console.log(`  📦 ${rows.length} rows to migrate`);

    if (rows.length === 0) continue;

    // 5. Insert rows into new DB in batches
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map(() => "?").join(", ");
    const insertSQL = `INSERT OR IGNORE INTO "${table}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${placeholders})`;

    const BATCH_SIZE = 50;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      const statements = batch.map((row) => ({
        sql: insertSQL,
        args: columns.map((col) => row[col] ?? null),
      }));
      await newDb.batch(statements, "write");
      process.stdout.write(`  ⏳ Inserted ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length} rows\r`);
    }
    console.log(`  ✅ Done migrating ${table}`);
  }

  console.log("\n🎉 Migration complete! Update your .env with the new credentials.");
  oldDb.close();
  newDb.close();
}

main().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});

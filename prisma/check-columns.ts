// Script to check which columns exist in the Product table
// Run with: npx tsx prisma/check-columns.ts

import { createClient } from "@libsql/client";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("❌ Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN in .env");
  process.exit(1);
}

const client = createClient({
  url,
  authToken,
});

async function checkColumns() {
  try {
    console.log("🔍 Checking Product table columns...\n");

    const columns = await client.execute(`
      SELECT name, type, "notnull", dflt_value 
      FROM pragma_table_info('Product') 
      ORDER BY cid;
    `);

    console.log("📋 Product table columns:");
    console.log("─".repeat(60));
    columns.rows.forEach((row: any) => {
      console.log(`  ${row.name.padEnd(25)} ${String(row.type).padEnd(15)} ${row.notnull ? 'NOT NULL' : 'NULL'.padEnd(8)} ${row.dflt_value ? `DEFAULT ${row.dflt_value}` : ''}`);
    });
    console.log("─".repeat(60));

    const advanceColumns = columns.rows.filter((row: any) => 
      row.name === "advanceDiscount" || row.name === "advanceDiscountType"
    );

    if (advanceColumns.length === 2) {
      console.log("\n✅ Both advanceDiscount columns exist!");
    } else if (advanceColumns.length === 1) {
      console.log("\n⚠️  Only one advanceDiscount column exists:", advanceColumns[0].name);
    } else {
      console.log("\n❌ advanceDiscount columns are missing!");
    }
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

checkColumns();

// Migration script to add advanceDiscount columns to Product table
// Run with: npx tsx prisma/migrate-advance-discount.ts

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

async function migrate() {
  try {
    console.log("🔄 Running migration to add advanceDiscount columns...");

    // Check if columns already exist
    const checkColumns = await client.execute(`
      SELECT name FROM pragma_table_info('Product') WHERE name IN ('advanceDiscount', 'advanceDiscountType');
    `);

    const existingColumns = checkColumns.rows.map((row: any) => row.name);
    console.log("📋 Existing columns:", existingColumns);

    if (existingColumns.includes("advanceDiscount") && existingColumns.includes("advanceDiscountType")) {
      console.log("✅ Both columns already exist. Migration not needed.");
      return;
    }

    // Add advanceDiscount column
    if (!existingColumns.includes("advanceDiscount")) {
      try {
        await client.execute(`
          ALTER TABLE "Product" ADD COLUMN "advanceDiscount" INTEGER NOT NULL DEFAULT 0;
        `);
        console.log("✅ Added advanceDiscount column");
      } catch (error: any) {
        if (error.message?.includes("duplicate column")) {
          console.log("⚠️  advanceDiscount column already exists, skipping...");
        } else {
          throw error;
        }
      }
    } else {
      console.log("ℹ️  advanceDiscount column already exists");
    }

    // Add advanceDiscountType column
    if (!existingColumns.includes("advanceDiscountType")) {
      try {
        await client.execute(`
          ALTER TABLE "Product" ADD COLUMN "advanceDiscountType" TEXT NOT NULL DEFAULT 'PKR';
        `);
        console.log("✅ Added advanceDiscountType column");
      } catch (error: any) {
        if (error.message?.includes("duplicate column")) {
          console.log("⚠️  advanceDiscountType column already exists, skipping...");
        } else {
          throw error;
        }
      }
    } else {
      console.log("ℹ️  advanceDiscountType column already exists");
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error: any) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

migrate();

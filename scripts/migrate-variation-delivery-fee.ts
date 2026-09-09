/**
 * One-shot migration: adds deliveryFee column to ProductVariation in Turso.
 * Run with: npx tsx scripts/migrate-variation-delivery-fee.ts
 */
import { createClient } from "@libsql/client";
import * as dotenv from "fs";

// Load .env manually since we're outside Next.js
const envContent = require("fs").readFileSync(".env", "utf-8") as string;
envContent.split("\n").forEach((line: string) => {
    const [key, ...rest] = line.trim().split("=");
    if (key && !key.startsWith("#")) {
        const value = rest.join("=").replace(/^"(.*)"$/, "$1");
        process.env[key] = value;
    }
});

async function main() {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url || !authToken) {
        console.error("Missing TURSO_DATABASE_URL or TURSO_AUTH_TOKEN");
        process.exit(1);
    }

    const client = createClient({ url, authToken });

    console.log("Connected to Turso. Running migration...");

    try {
        await client.execute(
            "ALTER TABLE ProductVariation ADD COLUMN deliveryFee INTEGER NOT NULL DEFAULT 0"
        );
        console.log("✅ Column 'deliveryFee' added to ProductVariation successfully.");
    } catch (err: any) {
        if (err.message?.includes("duplicate column name") || err.message?.includes("already exists")) {
            console.log("ℹ️  Column 'deliveryFee' already exists — nothing to do.");
        } else {
            console.error("❌ Migration failed:", err.message);
            process.exit(1);
        }
    }

    await client.close();
}

main();

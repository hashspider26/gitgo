-- Migration to add advanceDiscount and advanceDiscountType columns to Product table
-- Run this SQL in your Turso database or use: npx prisma db push

-- For SQLite/Turso (libSQL)
ALTER TABLE "Product" ADD COLUMN "advanceDiscount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Product" ADD COLUMN "advanceDiscountType" TEXT NOT NULL DEFAULT 'PKR';

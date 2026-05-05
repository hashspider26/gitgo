import { PrismaClient } from "@prisma/client";
import { uploadToR2 } from "../lib/r2";
import axios from "axios";
import * as dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config();

const prisma = new PrismaClient();

async function migrateImages() {
    console.log("🚀 Starting migration from Cloudinary to Cloudflare R2...");

    const products = await prisma.product.findMany();
    console.log(`Found ${products.length} products to check.`);

    let totalImages = 0;
    let migratedImages = 0;
    let skippedImages = 0;
    let failedImages = 0;

    for (const product of products) {
        console.log(`\n📦 Processing product: ${product.title} (ID: ${product.id})`);
        
        let images: string[] = [];
        try {
            images = JSON.parse(product.images);
        } catch (e) {
            console.error(`❌ Error parsing images for product ${product.id}:`, e);
            continue;
        }

        const newImages: string[] = [];
        let productModified = false;

        for (const imageUrl of images) {
            totalImages++;
            
            // Skip if already on R2 (checks if public domain is in the URL)
            const publicDomain = process.env.R2_PUBLIC_DOMAIN;
            if (publicDomain && imageUrl.includes(publicDomain)) {
                console.log(`⏩ Skipping (already on R2): ${imageUrl}`);
                newImages.push(imageUrl);
                skippedImages++;
                continue;
            }

            // Only process Cloudinary URLs (or any external URL)
            if (imageUrl.includes("cloudinary.com") || imageUrl.includes("res.cloudinary.com")) {
                try {
                    console.log(`🔄 Migrating: ${imageUrl}`);
                    
                    // Download image
                    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data, 'binary');
                    const contentType = (response.headers['content-type'] as string) || 'image/jpeg';
                    
                    // Generate a key for R2
                    // Extract original filename or use product slug + timestamp
                    const originalFilename = imageUrl.split('/').pop()?.split('?')[0] || `${product.slug}-${Date.now()}.jpg`;
                    const key = `products/${product.id}/${originalFilename}`;

                    // Upload to R2
                    const newUrl = await uploadToR2(buffer, key, contentType);
                    console.log(`✅ Success: ${newUrl}`);
                    
                    newImages.push(newUrl);
                    migratedImages++;
                    productModified = true;
                } catch (error: any) {
                    console.error(`❌ Failed to migrate image ${imageUrl}:`, error.message);
                    newImages.push(imageUrl); // Keep original if failed
                    failedImages++;
                }
            } else {
                console.log(`⏩ Skipping (not Cloudinary): ${imageUrl}`);
                newImages.push(imageUrl);
                skippedImages++;
            }
        }

        if (productModified) {
            await prisma.product.update({
                where: { id: product.id },
                data: { images: JSON.stringify(newImages) }
            });
            console.log(`💾 Updated product ${product.id} in database.`);
        }
    }

    console.log("\n✨ Migration Summary:");
    console.log(`- Total images checked: ${totalImages}`);
    console.log(`- Successfully migrated: ${migratedImages}`);
    console.log(`- Skipped: ${skippedImages}`);
    console.log(`- Failed: ${failedImages}`);
    
    await prisma.$disconnect();
}

migrateImages().catch(async (e) => {
    console.error("FATAL ERROR during migration:", e);
    await prisma.$disconnect();
    process.exit(1);
});

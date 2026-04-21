import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cloudinary, cloudinaryConfigs } from "@/lib/cloudinary-server";
import { extractPublicId } from "@/lib/cloudinary";
import { getToken } from "next-auth/jwt";

// This route ensures all images for all products are present in all Cloudinary accounts
export async function POST(req: Request) {
    try {
        // 1. Auth check - only admins or valid crons can trigger sync
        const cronSecret = process.env.CRON_SECRET;
        const authHeader = req.headers.get("Authorization");
        
        const isCronTask = cronSecret && authHeader === `Bearer ${cronSecret}`;
        
        let isAdmin = false;
        if (!isCronTask) {
            const token = await getToken({
                req: req as any,
                secret: process.env.NEXTAUTH_SECRET
            });
            isAdmin = !!token?.isAdmin;
        }

        if (!isCronTask && !isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const products = await prisma.product.findMany({
            select: { id: true, title: true, images: true }
        });

        const syncResults = {
            totalProducts: products.length,
            totalImages: 0,
            synced: 0,
            failed: 0,
            skipped: 0,
            details: [] as string[]
        };

        if (cloudinaryConfigs.length <= 1) {
            return NextResponse.json({ 
                message: "Only one Cloudinary account configured. Nothing to sync.",
                configCount: cloudinaryConfigs.length 
            });
        }

        // Iterate through products
        for (const product of products) {
            let images: string[] = [];
            try {
                images = product.images ? JSON.parse(product.images) : [];
            } catch (e) {
                continue;
            }

            if (!Array.isArray(images)) continue;

            syncResults.totalImages += images.length;

            for (const imageUrl of images) {
                const publicId = extractPublicId(imageUrl);
                if (!publicId) {
                    syncResults.skipped++;
                    continue;
                }

                // For each image, check existence in each account and sync if missing
                // Note: Checking existence is slow, so we might just "blindly" upload with overwrite: false
                // Cloudinary upload with same public_id and overwrite: false is relatively efficient if it already exists?
                // Actually, just upload with 'overwrite: true' (as requested) to ensure latest versions are synced.
                
                const syncPromises = cloudinaryConfigs.map(async (config) => {
                    // Skip the account that already seems to be the source? 
                    // No, just upload to all to be safe.
                    try {
                        await cloudinary.uploader.upload(imageUrl, {
                            ...config,
                            public_id: publicId,
                            overwrite: true,
                            resource_type: "image",
                        });
                        return true;
                    } catch (error) {
                        console.error(`Sync failed for ${publicId} on ${config.cloud_name}:`, error);
                        return false;
                    }
                });

                const results = await Promise.all(syncPromises);
                if (results.every(r => r)) {
                    syncResults.synced++;
                } else {
                    syncResults.failed++;
                }
            }
        }

        return NextResponse.json({
            message: "Sync process completed",
            ...syncResults
        });

    } catch (error) {
        console.error("Sync error:", error);
        return NextResponse.json({ 
            error: "Sync failed", 
            details: error instanceof Error ? error.message : String(error) 
        }, { status: 500 });
    }
}

export const GET = POST;

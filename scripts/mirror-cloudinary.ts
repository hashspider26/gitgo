
import { prisma } from '../lib/prisma';
import { v2 as cloudinary } from 'cloudinary';

// TARGET ACCOUNT
const backupConfig = {
    cloud_name: "dglf8tzbw",
    api_key: "122184543887739",
    api_secret: "jDOFtNTJ8vRmb99insXRjSu55S0"
};

// KNOWN SOURCE ACCOUNTS
const sourceClouds = ["drrp9ew1d", "ddpfmekx6"];

async function mirrorImages() {
    console.log(`Starting thorough mirroring to ${backupConfig.cloud_name}...`);
    
    const products = await prisma.product.findMany();
    console.log(`Checking ${products.length} products...`);

    let successCount = 0;
    let errorCount = 0;
    let skipCount = 0;

    for (const product of products) {
        let images: string[] = [];
        try {
            images = product.images ? JSON.parse(product.images) : [];
        } catch (e) {
            continue;
        }

        if (!Array.isArray(images)) continue;

        for (let url of images) {
            if (!url) continue;

            const tasks: { source: string, publicId: string }[] = [];

            if (url.startsWith('/uploads/')) {
                const filename = url.replace('/uploads/', '');
                const basePublicId = filename.replace(/\.[^.]+$/, '');
                
                sourceClouds.forEach(c => {
                    // Try double folder (Correct)
                    tasks.push({
                        source: `https://res.cloudinary.com/${c}/image/upload/v1/greenvalleyseeds/greenvalleyseeds/${filename}`,
                        publicId: `greenvalleyseeds/greenvalleyseeds/${basePublicId}`
                    });
                    // Try single folder
                    tasks.push({
                        source: `https://res.cloudinary.com/${c}/image/upload/v1/greenvalleyseeds/${filename}`,
                        publicId: `greenvalleyseeds/${basePublicId}`
                    });
                });
            } else if (url.includes('cloudinary.com')) {
                const match = url.match(/\/upload\/(?:v\d+\/)?([^/]+(?:\/[^/]+)*?)(?:\.[^.]+)?$/);
                const originalPublicId = match ? match[1].replace(/\.[^.]+$/, '') : null;
                
                if (originalPublicId) {
                    const cleanUrl = url.replace(/\/upload\/(.*?\/)?v\d+\//, '/upload/');
                    
                    // Try original path from original cloud
                    tasks.push({ source: cleanUrl, publicId: originalPublicId });
                    
                    // Try double folder fix if it's a greenvalleyseeds image
                    if (originalPublicId.startsWith('greenvalleyseeds/') && !originalPublicId.startsWith('greenvalleyseeds/greenvalleyseeds/')) {
                        const fixedPublicId = originalPublicId.replace('greenvalleyseeds/', 'greenvalleyseeds/greenvalleyseeds/');
                        const fixedUrl = cleanUrl.replace('greenvalleyseeds/', 'greenvalleyseeds/greenvalleyseeds/');
                        tasks.push({ source: fixedUrl, publicId: fixedPublicId });
                    }
                    
                    // Try other clouds too
                    sourceClouds.forEach(c => {
                        const otherCloudUrl = cleanUrl.replace(/res\.cloudinary\.com\/[^/]+/, `res.cloudinary.com/${c}`);
                        tasks.push({ source: otherCloudUrl, publicId: originalPublicId });
                    });
                }
            }

            if (tasks.length === 0) {
                console.log(`[SKIP] Unrecognizable: ${url}`);
                skipCount++;
                continue;
            }

            let mirrored = false;
            for (const task of tasks) {
                try {
                    await cloudinary.uploader.upload(task.source, {
                        public_id: task.publicId,
                        cloud_name: backupConfig.cloud_name,
                        api_key: backupConfig.api_key,
                        api_secret: backupConfig.api_secret,
                        overwrite: true,
                        resource_type: 'auto'
                    });
                    console.log(`[OK] Mirrored: ${task.publicId}`);
                    successCount++;
                    mirrored = true;
                    break;
                } catch (e) {
                    // Try next task
                }
            }

            if (!mirrored) {
                console.error(`[ERR] Failed to find source for: ${url}`);
                errorCount++;
            }
        }
    }

    console.log(`\n--- Results ---`);
    console.log(`Success: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    console.log(`Skipped: ${skipCount}`);
}

mirrorImages()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

import { v2 as cloudinary } from 'cloudinary';

export interface CloudinaryConfig {
    cloud_name: string;
    api_key: string;
    api_secret: string;
}

// Support multiple configurations via CLOUDINARY_CONFIGS (JSON array) or a list of URLs
function getConfigs(): CloudinaryConfig[] {
    const configs: CloudinaryConfig[] = [];

    // 1. Check for CLOUDINARY_CONFIGS JSON array
    if (process.env.CLOUDINARY_CONFIGS) {
        try {
            const parsed = JSON.parse(process.env.CLOUDINARY_CONFIGS);
            if (Array.isArray(parsed)) {
                configs.push(...parsed);
            }
        } catch (e) {
            console.error('Failed to parse CLOUDINARY_CONFIGS:', e);
        }
    }

    // 2. Check for multiple CLOUDINARY_URLS (comma separated)
    if (process.env.CLOUDINARY_URLS) {
        const urls = process.env.CLOUDINARY_URLS.split(',').map(u => u.trim());
        for (const url of urls) {
            const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
            if (match) {
                configs.push({
                    api_key: match[1],
                    api_secret: match[2],
                    cloud_name: match[3],
                });
            }
        }
    }

    // 3. Fallback to single CLOUDINARY_URL
    if (process.env.CLOUDINARY_URL) {
        const match = process.env.CLOUDINARY_URL.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
        if (match && !configs.some(c => c.cloud_name === match[3])) {
            configs.push({
                api_key: match[1],
                api_secret: match[2],
                cloud_name: match[3],
            });
        }
    }

    // 4. Check for numbered env vars (CLOUDINARY_CLOUD_NAME_1, etc.)
    for (let i = 1; i <= 10; i++) {
        const cloudName = process.env[`CLOUDINARY_CLOUD_NAME_${i}`];
        const apiKey = process.env[`CLOUDINARY_API_KEY_${i}`];
        const apiSecret = process.env[`CLOUDINARY_API_SECRET_${i}`];

        if (cloudName && apiKey && apiSecret) {
            if (!configs.some(c => c.cloud_name === cloudName)) {
                configs.push({
                    cloud_name: cloudName,
                    api_key: apiKey,
                    api_secret: apiSecret,
                });
            }
        }
    }

    // 5. Fallback to individual env vars (default)
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        if (!configs.some(c => c.cloud_name === process.env.CLOUDINARY_CLOUD_NAME)) {
            configs.push({
                cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
                api_key: process.env.CLOUDINARY_API_KEY,
                api_secret: process.env.CLOUDINARY_API_SECRET,
            });
        }
    }

    return configs;
}

const configs = getConfigs();
export const cloudinaryConfigs = configs;

// Configure the singleton with the first config for backward compatibility
if (configs.length > 0) {
    cloudinary.config(configs[0]);
} else {
    console.warn('Cloudinary not configured. Set CLOUDINARY_URLS, CLOUDINARY_CONFIGS, or individual env vars.');
}

export { cloudinary };

/**
 * Uploads an image to all configured Cloudinary accounts simultaneously.
 * Returns the result from the first successful upload.
 */
export async function multiUpload(file: string, options: any) {
    if (configs.length === 0) {
        throw new Error('No Cloudinary accounts configured');
    }

    const uploadPromises = configs.map(async (config) => {
        try {
            return await cloudinary.uploader.upload(file, {
                ...options,
                ...config, // Override global config with this account's config
            });
        } catch (error) {
            console.error(`Upload failed for account ${config.cloud_name}:`, error);
            return null;
        }
    });

    const results = await Promise.all(uploadPromises);
    const successfulResults = results.filter(r => r !== null);

    if (successfulResults.length === 0) {
        throw new Error('Failed to upload to any Cloudinary account');
    }

    // Return the result from the first account as the "primary" reference
    return successfulResults[0];
}

/**
 * Randomly replaces the cloud name in a Cloudinary URL to distribute bandwidth load.
 * Also strips versioning to ensure compatibility between different accounts.
 */
export function getRandomizedUrl(url: string | null): string | null {
    if (!url || configs.length === 0) return url;

    try {
        // Extract the current cloud name from the URL
        // Format: https://res.cloudinary.com/{cloud_name}/image/upload/...
        const match = url.match(/res\.cloudinary\.com\/([^/]+)\/image\/upload/);
        if (!match) return url;

        const currentCloudName = match[1];
        
        // Pick a random config from the list
        const randomIndex = Math.floor(Math.random() * configs.length);
        const randomConfig = configs[randomIndex];

        // FORCE OVERRIDE: 
        // We always replace the cloud name with one from our configured list.
        // This works even if only 1 account is configured, forcing old URLs to use the new cloud name.
        
        // Replace the cloud name 
        let newUrl = url.replace(
            `res.cloudinary.com/${currentCloudName}/`,
            `res.cloudinary.com/${randomConfig.cloud_name}/`
        );

        // Strip version (v123456789/) if present to ensure compatibility
        newUrl = newUrl.replace(/\/v\d+\//, '/');

        return newUrl;
    } catch {
        return url;
    }
}

/**
 * Deletes an image from all configured Cloudinary accounts simultaneously.
 */
export async function multiDelete(publicId: string) {
    if (configs.length === 0) return;

    const deletePromises = configs.map(async (config) => {
        try {
            return await cloudinary.uploader.destroy(publicId, {
                ...config,
            } as any);
        } catch (error) {
            console.error(`Delete failed for account ${config.cloud_name}:`, error);
            return null;
        }
    });

    return await Promise.all(deletePromises);
}

// Helper function to extract public_id from Cloudinary URL
export function extractPublicId(url: string): string | null {
    try {
        const match = url.match(/\/upload\/(?:v\d+\/)?([^/]+(?:\/[^/]+)*?)(?:\.[^.]+)?$/);
        if (match && match[1]) {
            return match[1].replace(/\.[^.]+$/, '');
        }
        return null;
    } catch {
        return null;
    }
}



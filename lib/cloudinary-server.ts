import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryConfig } from './cloudinary';

// This file is ONLY for server-side use.
// It imports the 'cloudinary' SDK which uses 'fs'.

function getConfigs(): CloudinaryConfig[] {
    const configs: CloudinaryConfig[] = [];
    
    // Default from env
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
        configs.push({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }
    
    // Multiple URLs
    if (process.env.CLOUDINARY_URLS) {
        try {
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
        } catch (e) {
            console.error('Error parsing CLOUDINARY_URLS:', e);
        }
    }

    return configs;
}

let configs = getConfigs();

export function ensureConfigs() {
    if (configs.length === 0) {
        configs = getConfigs();
    }
    return configs;
}

// Initial config
if (configs.length > 0) {
    cloudinary.config(configs[0]);
}

export { cloudinary };
export const cloudinaryConfigs = configs;

export async function multiUpload(file: string, options: any): Promise<any> {
    const activeConfigs = ensureConfigs();
    if (activeConfigs.length === 0) {
        throw new Error('No Cloudinary accounts configured');
    }

    let lastError = null;
    for (const config of activeConfigs) {
        try {
            // Using standard upload with explicit credentials to ensure it hits the right account
            const result = await cloudinary.uploader.upload(file, {
                ...options,
                cloud_name: config.cloud_name,
                api_key: config.api_key,
                api_secret: config.api_secret,
                secure: true
            });
            return result;
        } catch (error: any) {
            console.error(`Upload failed for ${config.cloud_name}:`, error);
            lastError = error;
        }
    }

    throw lastError || new Error('Upload failed on all accounts');
}

export async function multiDelete(publicId: string) {
    const activeConfigs = ensureConfigs();
    return Promise.all(activeConfigs.map(config => 
        cloudinary.uploader.destroy(publicId, {
            cloud_name: config.cloud_name,
            api_key: config.api_key,
            api_secret: config.api_secret,
            secure: true
        } as any).catch(() => null)
    ));
}

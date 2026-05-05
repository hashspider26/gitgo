// Client-safe Cloudinary utilities
// This file can be imported by BOTH client and server components.

export interface CloudinaryConfig {
    cloud_name: string;
    api_key: string;
    api_secret: string;
}



export function getRandomizedUrl(url: string | null, transformations: string = "f_auto,q_auto"): string | null {
    if (!url) return null;
    
    // The active cloud name from env or fallback
    const activeCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME || "dglf8tzbw";

    // Local path conversion (Legacy support for /uploads/ prefix)
    if (url.startsWith('/uploads/')) {
        const filename = url.replace('/uploads/', '');
        return `https://res.cloudinary.com/${activeCloudName}/image/upload/${transformations}/v1/greenvalleyseeds/greenvalleyseeds/${filename}`;
    }

    // Existing Cloudinary URL
    if (url.includes('cloudinary.com')) {
        // Fix double folder nesting issues if they exist in legacy data
        if (url.includes('/greenvalleyseeds/') && !url.includes('/greenvalleyseeds/greenvalleyseeds/')) {
            url = url.replace('/greenvalleyseeds/', '/greenvalleyseeds/greenvalleyseeds/');
        }

        const parts = url.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');
        const cloudIndex = parts.findIndex(p => p.includes('cloudinary.com'));
        
        // Ensure the cloud name is updated to the active one (fixes legacy ddpfmekx6 urls)
        if (cloudIndex !== -1 && parts[cloudIndex + 1]) {
            parts[cloudIndex + 1] = activeCloudName;
        }

        if (uploadIndex !== -1) {
            // Check if there are already transformations
            const nextPart = parts[uploadIndex + 1];
            const hasTransformations = nextPart && (
                nextPart.includes(',') || 
                nextPart.startsWith('w_') || 
                nextPart.startsWith('f_') || 
                nextPart.startsWith('q_') ||
                nextPart.startsWith('c_')
            );
            
            if (!hasTransformations) {
                // Insert transformations after /upload/
                parts.splice(uploadIndex + 1, 0, transformations);
            }
        }
        
        return parts.join('/');
    }

    return url;
}

export function extractPublicId(url: string): string | null {
    try {
        const match = url.match(/\/upload\/(?:v\d+\/)?([^/]+(?:\/[^/]+)*?)(?:\.[^.]+)?$/);
        return match ? match[1].replace(/\.[^.]+$/, '') : null;
    } catch {
        return null;
    }
}

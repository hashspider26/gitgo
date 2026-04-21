// Client-safe Cloudinary utilities
// This file can be imported by BOTH client and server components.

export interface CloudinaryConfig {
    cloud_name: string;
    api_key: string;
    api_secret: string;
}

// Public cloud names for client-side load balancing
// IMPORTANT: These should ideally come from public env vars (starting with NEXT_PUBLIC_)
// for true client-side support, butConstructing based on process.env on server is fine.
const PUBLIC_CLOUD_NAMES = [
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
    "drrp9ew1d" // Fallback/Hardcoded if necessary for performance
].filter(Boolean) as string[];

export function getRandomizedUrl(url: string | null): string | null {
    if (!url) return null;
    
    const cloudNames = PUBLIC_CLOUD_NAMES;
    if (cloudNames.length === 0) return url;

    // Local path conversion
    if (url.startsWith('/uploads/')) {
        const filename = url.replace('/uploads/', '');
        const hash = Array.from(filename).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const cloudName = cloudNames[hash % cloudNames.length];
        return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/v1/greenvalleyseeds/greenvalleyseeds/${filename}`;
    }

    // Existing Cloudinary URL
    if (url.includes('cloudinary.com')) {
        if (url.includes('/greenvalleyseeds/') && !url.includes('/greenvalleyseeds/greenvalleyseeds/')) {
            url = url.replace('/greenvalleyseeds/', '/greenvalleyseeds/greenvalleyseeds/');
        }
        
        const parts = url.split('/');
        const cloudIndex = parts.findIndex(p => p.includes('cloudinary.com'));
        if (cloudIndex !== -1 && parts[cloudIndex + 1]) {
            const pathPart = parts.slice(cloudIndex + 2).join('/');
            const hash = Array.from(pathPart).reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const cloudName = cloudNames[hash % cloudNames.length];
            return `https://res.cloudinary.com/${cloudName}/${pathPart}`;
        }
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

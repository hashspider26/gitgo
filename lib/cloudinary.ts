import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// Support both CLOUDINARY_URL format and individual env vars
if (process.env.CLOUDINARY_URL) {
  // Parse CLOUDINARY_URL format: cloudinary://api_key:api_secret@cloud_name
  const url = process.env.CLOUDINARY_URL;
  const match = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
  if (match) {
    const [, api_key, api_secret, cloud_name] = match;
    cloudinary.config({
      cloud_name,
      api_key,
      api_secret,
    });
  } else {
    throw new Error('Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name');
  }
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.warn('Cloudinary not configured. Set CLOUDINARY_URL or individual credentials.');
}

export { cloudinary };

// Helper function to extract public_id from Cloudinary URL
export function extractPublicId(url: string): string | null {
  try {
    // Cloudinary URLs format: 
    // https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{folder}/{public_id}.{format}
    // or with transformations:
    // https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{folder}/{public_id}.{format}
    
    // Match the path after /upload/
    const match = url.match(/\/upload\/(?:v\d+\/)?([^/]+(?:\/[^/]+)*?)(?:\.[^.]+)?$/);
    if (match && match[1]) {
      // Return the full path (including folder) as public_id
      // Remove file extension if present
      return match[1].replace(/\.[^.]+$/, '');
    }
    return null;
  } catch {
    return null;
  }
}


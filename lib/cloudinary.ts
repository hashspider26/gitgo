import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
// Support both CLOUDINARY_URL format and individual env vars
if (process.env.CLOUDINARY_URL) {
  try {
    const parsedUrl = new URL(process.env.CLOUDINARY_URL);
    cloudinary.config({
      cloud_name: parsedUrl.hostname,
      api_key: parsedUrl.username,
      api_secret: parsedUrl.password,
    });
  } catch (e) {
    console.error('Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name');
  }
} else if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
} else {
  console.log('Cloudinary configuration wait: missing env vars (CLOUDINARY_URL or keys)');
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


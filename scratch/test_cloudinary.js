
const PUBLIC_CLOUD_NAMES = ["drrp9ew1d"];

function getRandomizedUrl(url, transformations = "f_auto,q_auto") {
    if (!url) return null;
    
    const cloudNames = PUBLIC_CLOUD_NAMES;
    if (cloudNames.length === 0) return url;

    // Local path conversion
    if (url.startsWith('/uploads/')) {
        const filename = url.replace('/uploads/', '');
        const hash = Array.from(filename).reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const cloudName = cloudNames[hash % cloudNames.length];
        return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/v1/greenvalleyseeds/greenvalleyseeds/${filename}`;
    }

    // Existing Cloudinary URL
    if (url.includes('cloudinary.com')) {
        // Ensure the nested folder structure if missing
        if (url.includes('/greenvalleyseeds/') && !url.includes('/greenvalleyseeds/greenvalleyseeds/')) {
            url = url.replace('/greenvalleyseeds/', '/greenvalleyseeds/greenvalleyseeds/');
        }
        
        const parts = url.split('/');
        const uploadIndex = parts.findIndex(p => p === 'upload');
        
        if (uploadIndex !== -1) {
            // Check if there are already transformations
            const nextPart = parts[uploadIndex + 1];
            const hasTransformations = nextPart && (nextPart.includes(',') || nextPart.startsWith('w_') || nextPart.startsWith('f_') || nextPart.startsWith('q_'));
            
            if (hasTransformations) {
                // ...
            } else {
                // Insert transformations after /upload/
                parts.splice(uploadIndex + 1, 0, transformations);
            }
            
            // Randomize cloud name if we have multiples
            const cloudIndex = parts.findIndex(p => p.includes('cloudinary.com'));
            if (cloudIndex !== -1 && cloudNames.length > 1) {
                const pathPart = parts.slice(uploadIndex + 1).join('/');
                const hash = Array.from(pathPart).reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const cloudName = cloudNames[hash % cloudNames.length];
                parts[cloudIndex] = `res.cloudinary.com/${cloudName}`;
            }
            
            return parts.join('/');
        }
    }

    return url;
}

const testUrls = [
    "https://res.cloudinary.com/drrp9ew1d/image/upload/v1714900000/test.jpg",
    "https://res.cloudinary.com/drrp9ew1d/image/upload/f_auto,q_auto/v1714900000/test.jpg",
    "/uploads/image.jpg"
];

testUrls.forEach(u => {
    console.log(`Original: ${u}`);
    console.log(`Result:   ${getRandomizedUrl(u)}`);
    console.log('---');
});

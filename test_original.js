
function getRandomizedUrl(url) {
    if (!url) return null;
    const cloudNames = ["drrp9ew1d"];
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

console.log(getRandomizedUrl("https://res.cloudinary.com/ddpfmekx6/image/upload/v1774547213/greenvalleyseeds/1774547212330_IMG_20260326_224610.png"));

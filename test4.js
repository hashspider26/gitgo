
const https = require('https');

const urls = [
    "https://res.cloudinary.com/ddpfmekx6/image/upload/v1774547213/greenvalleyseeds/1774547212330_IMG_20260326_224610.png"
];

urls.forEach(original => {
    console.log(`Testing: ${original}`);
    
    https.get(original, (res) => {
        console.log(`Status: ${res.statusCode}`);
    }).on('error', (e) => {
        console.error(e);
    });
});

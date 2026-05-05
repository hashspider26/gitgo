
const { getRandomizedUrl } = require('./lib/cloudinary');
const https = require('https');

const urls = [
    "https://res.cloudinary.com/ddpfmekx6/image/upload/v1774547213/greenvalleyseeds/1774547212330_IMG_20260326_224610.png"
];

urls.forEach(original => {
    const transformed = getRandomizedUrl(original, "f_auto,q_auto,w_500,c_limit");
    console.log(`Testing: ${transformed}`);
    
    https.get(transformed, (res) => {
        console.log(`Status: ${res.statusCode}`);
        if (res.statusCode >= 400) {
            res.on('data', d => console.log(d.toString()));
        }
    }).on('error', (e) => {
        console.error(e);
    });
});

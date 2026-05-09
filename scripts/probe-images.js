
import https from 'https';

const files = [
    "1765647365266_WhatsApp_Image_2025-11-28_at_19.57.22_86028018.jpg"
];

const clouds = ["drrp9ew1d", "ddpfmekx6"];
const folders = ["greenvalleyseeds/greenvalleyseeds", "greenvalleyseeds", "uploads", ""];

files.forEach(f => {
    clouds.forEach(c => {
        folders.forEach(dir => {
            const path = dir ? `${dir}/${f}` : f;
            const url = `https://res.cloudinary.com/${c}/image/upload/v1/${path}`;
            https.get(url, (res) => {
                if (res.statusCode === 200) {
                    console.log(`FOUND: ${url}`);
                }
            }).on('error', () => {});
        });
    });
});

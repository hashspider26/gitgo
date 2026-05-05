
const https = require('https');

const image = "1774547212330_IMG_20260326_224610.png";
const clouds = ["drrp9ew1d", "ddpfmekx6"];
const folders = ["greenvalleyseeds/greenvalleyseeds", "greenvalleyseeds", "gvs_uploads", "uploads"];

async function probe() {
    for (const cloud of clouds) {
        for (const folder of folders) {
            const path = folder ? `${folder}/${image}` : image;
            const url = `https://res.cloudinary.com/${cloud}/image/upload/v1/${path}`;
            
            await new Promise((resolve) => {
                https.get(url, (res) => {
                    console.log(`Cloud: ${cloud}, Folder: ${folder}, Status: ${res.statusCode}`);
                    if (res.statusCode === 200) {
                        console.log(`>>> SUCCESS: ${url}`);
                    }
                    resolve();
                }).on('error', (e) => {
                    console.log(`Error: ${e.message}`);
                    resolve();
                });
            });
        }
    }
}

probe();


import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: "drrp9ew1d",
    api_key: "779812286976858",
    api_secret: "wVfcP8lR8D8NYGUJp235X8srpMo"
});

const id = "greenvalleyseeds/greenvalleyseeds/1774532844323_IMG_20260326_184635";

async function check() {
    try {
        const result = await cloudinary.api.resource(id);
        console.log("FOUND in drrp9ew1d:", result.secure_url);
    } catch (e) {
        console.log("NOT FOUND in drrp9ew1d:", e.message);
        
        // Try other folder
        try {
            const result2 = await cloudinary.api.resource("greenvalleyseeds/1774532844323_IMG_20260326_184635");
            console.log("FOUND in drrp9ew1d (short path):", result2.secure_url);
        } catch (e2) {
            console.log("NOT FOUND in drrp9ew1d (short path):", e2.message);
        }
    }
}

check();

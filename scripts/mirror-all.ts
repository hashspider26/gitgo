
import { v2 as cloudinary } from 'cloudinary';

// SOURCE (Primary)
const sourceConfig = {
    cloud_name: "drrp9ew1d",
    api_key: "779812286976858",
    api_secret: "wVfcP8lR8D8NYGUJp235X8srpMo"
};

// TARGET (Backup)
const targetConfig = {
    cloud_name: "dglf8tzbw",
    api_key: "122184543887739",
    api_secret: "jDOFtNTJ8vRmb99insXRjSu55S0"
};

async function mirrorAll() {
    console.log("Listing all resources from primary account...");
    
    cloudinary.config(sourceConfig);
    
    let nextCursor = null;
    let totalMirrored = 0;

    do {
        const result = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'greenvalleyseeds/',
            max_results: 500,
            next_cursor: nextCursor
        });

        console.log(`Found ${result.resources.length} resources in this batch.`);

        for (const resource of result.resources) {
            try {
                // Switch config to target for upload
                cloudinary.config(targetConfig);
                
                await cloudinary.uploader.upload(resource.secure_url, {
                    public_id: resource.public_id,
                    overwrite: true,
                    resource_type: resource.resource_type
                });

                console.log(`✅ Mirrored: ${resource.public_id}`);
                totalMirrored++;
                
                // Switch back to source for next resource check (not strictly needed for resources array but good practice)
                cloudinary.config(sourceConfig);
            } catch (e: any) {
                console.error(`❌ Failed ${resource.public_id}: ${e.message}`);
                cloudinary.config(sourceConfig);
            }
        }

        nextCursor = result.next_cursor;
    } while (nextCursor);

    console.log(`\n--- Finished ---`);
    console.log(`Total mirrored: ${totalMirrored}`);
}

mirrorAll().catch(console.error);

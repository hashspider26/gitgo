import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { Readable } from "stream";

export const maxDuration = 60;

export async function POST(req: Request) {
    console.log("Upload request received");

    try {
<<<<<<< HEAD
        // Check for required credentials
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            console.error("Cloudinary credentials missing from environment");
            return NextResponse.json({
                error: "Cloudinary configuration missing.",
                details: "Server-side environment variables are not set for Cloudinary."
            }, { status: 500 });
        }
=======
        // Log environment status (Safe check)
        console.log("Cloudinary Config Status:", {
            hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
            hasApiKey: !!process.env.CLOUDINARY_API_KEY,
            hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
            hasUrl: !!process.env.CLOUDINARY_URL
        });
>>>>>>> dfd199b87ce164bd07927d4c5bd56dc6e780ae11

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            console.error("Upload error: No file in form data");
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        console.log("File received:", file.name, file.size, file.type);

        const buffer = Buffer.from(await file.arrayBuffer());
<<<<<<< HEAD

        console.log("Starting Cloudinary streaming upload...");

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "greenvalleyseeds",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Stream Error:", error);
                        reject(error);
                    } else {
                        resolve(result);
                    }
                }
            );

            const s = new Readable();
            s.push(buffer);
            s.push(null);
            s.pipe(uploadStream);
        }) as any;

        console.log("Cloudinary upload successful:", uploadResult.secure_url);

=======

        // Convert to Base64 - More stable for Serverless than Streams
        const base64Image = `data:${file.type};base64,${buffer.toString('base64')}`;
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._-]/g, "_");

        console.log("Starting Cloudinary upload for:", filename);

        // Upload to Cloudinary using Base64 string
        const uploadResult = await cloudinary.uploader.upload(base64Image, {
            folder: "greenvalleyseeds",
            public_id: filename.replace(/\.[^/.]+$/, ""),
            resource_type: "image",
            transformation: [
                { width: 1200, height: 1200, crop: "limit" },
                { quality: "auto" },
                { fetch_format: "auto" }
            ]
        });

        console.log("Cloudinary upload successful:", uploadResult.secure_url);

>>>>>>> dfd199b87ce164bd07927d4c5bd56dc6e780ae11
        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        }, { status: 201 });

    } catch (error: any) {
<<<<<<< HEAD
=======
        // Stringify the error to avoid [object Object] in logs
>>>>>>> dfd199b87ce164bd07927d4c5bd56dc6e780ae11
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("CRITICAL UPLOAD ERROR:", errorMessage);

        return NextResponse.json({
            error: "Upload failed",
            details: errorMessage,
            code: error?.http_status || 500
        }, { status: 500 });
    }
}

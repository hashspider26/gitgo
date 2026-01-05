import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
    console.log("Upload request received");

    try {
        // Log environment status (Safe check)
        console.log("Cloudinary Config Status:", {
            hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
            hasApiKey: !!process.env.CLOUDINARY_API_KEY,
            hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
            hasUrl: !!process.env.CLOUDINARY_URL
        });

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            console.error("Upload error: No file in form data");
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        console.log("File received:", file.name, file.size, file.type);

        const buffer = Buffer.from(await file.arrayBuffer());

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

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        }, { status: 201 });

    } catch (error: any) {
        // Stringify the error to avoid [object Object] in logs
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("CRITICAL UPLOAD ERROR:", errorMessage);

        return NextResponse.json({
            error: "Upload failed",
            details: errorMessage,
            code: error?.http_status || 500
        }, { status: 500 });
    }
}

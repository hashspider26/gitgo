import { NextResponse } from "next/server";
import { v2 as cloudinary } from 'cloudinary';

export const maxDuration = 10;

export async function POST(req: Request) {
    console.log("[UPLOAD] Starting request handler...");

    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        // 1. Initial Config Check
        if (!cloudName || !apiKey || !apiSecret) {
            console.error("[UPLOAD] CRITICAL: Missing Cloudinary environment variables!");
            return NextResponse.json({
                error: "Cloudinary configuration missing on Vercel.",
                details: "Please go to Vercel Dashboard > Settings > Environment Variables and add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
            }, { status: 500 });
        }

        // 2. Configure Local Instance
        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
            secure: true
        });

        // 3. Parse Form Data
        console.log("[UPLOAD] Parsing form data...");
        let formData;
        try {
            formData = await req.formData();
        } catch (err: any) {
            console.error("[UPLOAD] Failed to parse form data:", err.message);
            return NextResponse.json({ error: "Invalid form data.", details: err.message }, { status: 400 });
        }

        const file = formData.get("file") as File;
        if (!file) {
            console.error("[UPLOAD] No file found in form data.");
            return NextResponse.json({ error: "No image file provided." }, { status: 400 });
        }

        console.log(`[UPLOAD] Processing file: ${file.name}, Size: ${file.size}, Type: ${file.type}`);

        // 4. Convert to Buffer & Base64
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        const fileContent = `data:${file.type};base64,${base64Data}`;

        // 5. Cloudinary Upload
        console.log("[UPLOAD] Sending to Cloudinary...");
        const result = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload(
                fileContent,
                { folder: "greenvalleyseeds" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
        }) as any;

        console.log("[UPLOAD] Success! URL:", result.secure_url);

        return NextResponse.json({
            url: result.secure_url,
            public_id: result.public_id
        }, { status: 201 });

    } catch (error: any) {
        console.error("[UPLOAD] UNEXPECTED FATAL ERROR:", error);

        return NextResponse.json({
            error: "Internal Upload Error",
            details: error instanceof Error ? error.message : "The server encountered a problem processing your request.",
            code: error?.http_status || 500
        }, { status: 500 });
    }
}

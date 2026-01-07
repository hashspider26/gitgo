import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { Readable } from "stream";

export const maxDuration = 60;

export async function POST(req: Request) {
    console.log("Upload request received");

    try {
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

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            console.error("Upload error: No file in form data");
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        console.log("File received:", file.name, file.size, file.type);

        const buffer = Buffer.from(await file.arrayBuffer());

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

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        }, { status: 201 });

    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        console.error("CRITICAL UPLOAD ERROR:", errorMessage);

        return NextResponse.json({
            error: "Upload failed",
            details: errorMessage,
            code: error?.http_status || 500
        }, { status: 500 });
    }
}

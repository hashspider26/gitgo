import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { Readable } from "stream";

// Set to 10 for Vercel Hobby plan compatibility
export const maxDuration = 10;

export async function POST(req: Request) {
    try {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        // Verify configuration inside the handler for maximum reliability
        if (!cloudName || !apiKey || !apiSecret) {
            console.error("Missing Cloudinary Env Vars");
            return NextResponse.json({
                error: "Cloudinary configuration missing on server.",
                details: "Check Vercel Environment Variables."
            }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        // Vercel Hobby plan has a 4.5MB limit for request body. 
        // We check this here to give a clear error if possible, 
        // though Vercel might kill the request before it reaches here.
        if (file.size > 4.5 * 1024 * 1024) {
            return NextResponse.json({
                error: "File is too large for Vercel Hobby plan (Max 4.5MB).",
                details: "Please resize your image or use a smaller file."
            }, { status: 413 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "greenvalleyseeds",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Upload Error:", error);
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

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        }, { status: 201 });

    } catch (error: any) {
        console.error("CRITICAL API ERROR:", error);
        return NextResponse.json({
            error: "Upload process failed",
            details: error instanceof Error ? error.message : "Unknown error",
            code: 500
        }, { status: 500 });
    }
}

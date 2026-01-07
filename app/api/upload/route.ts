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

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json({
                error: "Cloudinary configuration missing.",
                details: "Server-side environment variables are not set for Cloudinary."
            }, { status: 500 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
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
        const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
        return NextResponse.json({
            error: "Upload failed",
            details: errorMessage,
            code: error?.http_status || 500
        }, { status: 500 });
    }
}

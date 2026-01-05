import { NextResponse } from "next/server";
import sharp from "sharp";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        // Check if file is an image
        const isImage = file.type.startsWith("image/");
        if (!isImage) {
            return NextResponse.json({ error: "File must be an image." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._-]/g, "_");

        let processedBuffer: Buffer;

        // Process image with sharp to reduce size
        try {
            // Resize and compress image
            // Max width: 1200px, Max height: 1200px, Quality: 85%
            processedBuffer = await sharp(buffer)
                .resize(1200, 1200, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .jpeg({ quality: 85, mozjpeg: true })
                .toBuffer();
        } catch (error) {
            // If sharp processing fails, use original buffer
            console.warn("Image processing failed, using original:", error);
            processedBuffer = buffer;
        }

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "greenvalleyseeds",
                    public_id: filename.replace(/\.[^/.]+$/, ""), // Remove extension
                    resource_type: "image",
                    transformation: [
                        { quality: "auto" },
                        { fetch_format: "auto" }
                    ]
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary Stream Error:", error);
                        reject(new Error(typeof error === 'object' ? JSON.stringify(error) : String(error)));
                    } else {
                        resolve(result);
                    }
                }
            );
            uploadStream.end(processedBuffer);
        }) as any;

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id
        }, { status: 201 });

    } catch (error: any) {
        console.error("CRITICAL UPLOAD ERROR:", error);
        return NextResponse.json({
            error: "Upload failed",
            details: error?.message || "Internal crash",
            code: error?.http_code || 500
        }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import sharp from "sharp";
import { cloudinary } from "@/lib/cloudinary";

function isCloudinaryConfigured(): boolean {
    if (process.env.CLOUDINARY_URL) return true;
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) return true;
    return false;
}

export async function POST(req: Request) {
    try {
        if (!isCloudinaryConfigured()) {
            console.error("Upload failed: Cloudinary not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET.");
            return NextResponse.json(
                { error: "Image upload is not configured. Please set CLOUDINARY_URL (or Cloudinary env vars) on the server." },
                { status: 503 }
            );
        }

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
            processedBuffer = await sharp(buffer)
                .resize(1200, 1200, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                .jpeg({ quality: 85, mozjpeg: true })
                .toBuffer();
        } catch (err) {
            console.warn("Image processing failed, using original:", err);
            processedBuffer = buffer;
        }

        // Upload to Cloudinary (options without transformation - image already processed)
        const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "greenvalleyseeds",
                    public_id: filename.replace(/\.[^/.]+$/, ""),
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else if (result) resolve(result);
                    else reject(new Error("No result from Cloudinary"));
                }
            );
            uploadStream.on("error", reject);
            uploadStream.end(processedBuffer);
        });

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        }, { status: 201 });

    } catch (error) {
        console.error("Upload error:", error);
        const message = error instanceof Error ? error.message : "Unknown error";
        const isCloudinary = message.includes("Cloudinary") || (error as any)?.error?.message;
        return NextResponse.json({
            error: "Failed to upload file.",
            details: message,
            hint: !isCloudinaryConfigured() ? "Set CLOUDINARY_URL on your host (e.g. Vercel env vars)." : undefined,
        }, { status: 500 });
    }
}

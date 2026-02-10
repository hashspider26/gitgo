import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";

// Allow larger uploads (Vercel default is 4.5MB)
export const maxDuration = 30;

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

        // Use base64 upload (reliable on Vercel, no sharp native module needed)
        const b64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${b64}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
            folder: "greenvalleyseeds",
            public_id: filename.replace(/\.[^/.]+$/, ""),
            resource_type: "image",
            overwrite: true,
        });

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        }, { status: 201 });

    } catch (error) {
        console.error("Upload error:", error);
        const err = error as any;
        const message = err?.message
            || err?.error?.message
            || (typeof err === "string" ? err : "Unknown error");
        return NextResponse.json({
            error: "Failed to upload file.",
            details: String(message),
            hint: !isCloudinaryConfigured() ? "Set CLOUDINARY_URL on Vercel (Project Settings > Environment Variables)." : undefined,
        }, { status: 500 });
    }
}

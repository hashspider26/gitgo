import { NextResponse } from "next/server";
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

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "greenvalleyseeds",
                    public_id: filename.replace(/\.[^/.]+$/, ""),
                    resource_type: "image",
                    transformation: [
                        { width: 1200, height: 1200, crop: "limit" },
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
            uploadStream.end(buffer);
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

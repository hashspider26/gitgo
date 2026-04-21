import { NextResponse } from "next/server";
import { multiUpload, ensureConfigs } from "@/lib/cloudinary-server";

// Allow larger uploads (Vercel default is 4.5MB)
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file received." }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = Date.now() + "_" + file.name.replaceAll(" ", "_").replace(/[^a-zA-Z0-9._-]/g, "_");
        
        // Use base64 data URI for Cloudinary upload
        const b64 = buffer.toString("base64");
        const dataUri = `data:${file.type};base64,${b64}`;

        // Ensure configs are loaded
        const configs = ensureConfigs();
        if (configs.length === 0) {
            throw new Error("Cloudinary accounts not configured in environment variables.");
        }

        const uploadResult = await multiUpload(dataUri, {
            public_id: filename.replace(/\.[^/.]+$/, ""),
            folder: "greenvalleyseeds/greenvalleyseeds",
            resource_type: "image",
            overwrite: true,
        });

        return NextResponse.json({
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
        }, { status: 201 });

    } catch (error: any) {
        console.error("Cloudinary Upload Error:", error);
        
        return NextResponse.json({
            error: "Failed to upload file.",
            details: error?.message || String(error),
        }, { status: 500 });
    }
}

import { NextResponse } from "next/server";
import { multiUpload } from "@/lib/cloudinary-server";

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
        const base64Data = buffer.toString('base64');
        const fileUri = `data:${file.type};base64,${base64Data}`;

        const result = await multiUpload(fileUri, {
            folder: "gvs_uploads",
            resource_type: "auto",
        });

        return NextResponse.json({
            url: result.secure_url,
            key: result.public_id,
        }, { status: 201 });

    } catch (error: any) {
        console.error("Upload Error:", error);
        
        return NextResponse.json({
            error: "Failed to upload file.",
            details: error?.message || String(error),
        }, { status: 500 });
    }
}

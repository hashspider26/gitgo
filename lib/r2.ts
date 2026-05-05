import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
});

export async function uploadToR2(
    buffer: Buffer,
    key: string,
    contentType: string
): Promise<string> {
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;

    if (!bucketName || !publicDomain) {
        throw new Error("R2 bucket name or public domain not configured.");
    }

    const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: contentType,
    });

    await r2Client.send(command);

    // Return the public URL
    return `${publicDomain.startsWith('http') ? '' : 'https://'}${publicDomain}/${key}`;
}

export async function deleteFromR2(key: string): Promise<void> {
    const bucketName = process.env.R2_BUCKET_NAME;

    if (!bucketName) {
        throw new Error("R2 bucket name not configured.");
    }

    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
    });

    await r2Client.send(command);
}

export function getR2KeyFromUrl(url: string): string | null {
    const publicDomain = process.env.R2_PUBLIC_DOMAIN;
    if (!publicDomain || !url.includes(publicDomain)) return null;
    
    return url.split(`${publicDomain}/`)[1] || null;
}

import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { cloudinary, extractPublicId } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const product = await prisma.product.findUnique({
            where: { id: params.id },
        });
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const product = await prisma.product.update({
            where: { id: params.id },
            data: {
                title: body.title,
                description: body.description,
                price: Number(body.price),
                salePrice: body.salePrice ? Number(body.salePrice) : null,
                category: body.category,
                stock: Number(body.stock),
                images: JSON.stringify(body.images || []),
                isFeatured: body.isFeatured,
                weight: body.weight ? Number(body.weight) : undefined,
                deliveryFee: body.deliveryFee ? Number(body.deliveryFee) : undefined,
            }
        });
        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        // Get product first to access image URLs
        const product = await prisma.product.findUnique({
            where: { id: params.id },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // Delete associated images from Cloudinary
        try {
            const images = product.images ? JSON.parse(product.images) : [];
            if (Array.isArray(images)) {
                for (const imageUrl of images) {
                    if (imageUrl && typeof imageUrl === 'string') {
                        // Check if it's a Cloudinary URL
                        if (imageUrl.includes('cloudinary.com')) {
                            const publicId = extractPublicId(imageUrl);
                            if (publicId) {
                                try {
                                    await cloudinary.uploader.destroy(publicId);
                                } catch (error) {
                                    console.warn(`Failed to delete Cloudinary image ${publicId}:`, error);
                                }
                            }
                        }
                        // Legacy: Handle old local uploads (if any)
                        // These will be ignored on Vercel since filesystem is read-only
                    }
                }
            }
        } catch (error) {
            console.warn("Error deleting product images:", error);
            // Continue with product deletion even if image deletion fails
        }

        // Delete the product
        await prisma.product.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete product error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}

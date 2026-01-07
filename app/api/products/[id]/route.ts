import { NextResponse } from "next/server";
import { cloudinary, extractPublicId } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const products = await prisma.$queryRaw`SELECT * FROM "Product" WHERE id = ${params.id} LIMIT 1` as any[];

        if (!products || products.length === 0) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const rawProduct = products[0];
        const getVal = (key: string) => {
            const lowerKey = key.toLowerCase();
            const actualKey = Object.keys(rawProduct).find(k => k.toLowerCase() === lowerKey);
            return actualKey ? rawProduct[actualKey] : undefined;
        };

        // Normalize the product object for the frontend
        const product = {
            ...rawProduct,
            id: getVal('id'),
            price: Number(getVal('price')),
            stock: Number(getVal('stock') || 0),
            deliveryFee: Number(getVal('deliveryFee') || 0),
            weight: Number(getVal('weight') || 0),
            advanceDiscount: Number(getVal('advanceDiscount') || 0),
            advanceDiscountType: getVal('advanceDiscountType') || 'PKR'
        };

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const images = JSON.stringify(body.images || []);
        const price = Number(body.price);
        const stock = Number(body.stock);
        const weight = Number(body.weight || 0);
        const deliveryFee = Number(body.deliveryFee || 0);
        const advanceDiscount = Number(body.advanceDiscount || 0);
        const advanceDiscountType = body.advanceDiscountType || "PKR";

        console.log("Updating product:", params.id, { advanceDiscount, advanceDiscountType });

        await prisma.$executeRaw`
            UPDATE "Product" 
            SET title = ${body.title}, 
                description = ${body.description}, 
                price = ${price}, 
                category = ${body.category}, 
                stock = ${stock}, 
                images = ${images},
                weight = ${weight},
                deliveryFee = ${deliveryFee},
                advanceDiscount = ${advanceDiscount},
                advanceDiscountType = ${advanceDiscountType},
                updatedAt = ${new Date().toISOString()}
            WHERE id = ${params.id}
        `;

        return NextResponse.json({ success: true });
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

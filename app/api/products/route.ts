import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    try {
        const products = await prisma.product.findMany({
            where: category ? { category } : undefined,
            orderBy: { createdAt: 'desc' },
            include: { variations: true },
        });
        return NextResponse.json(products);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    // Check auth - in real app verify admin
    // const session = await getServerSession();
    // if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const body = await request.json();
        const product = await prisma.product.create({
            data: {
                title: body.title,
                slug: body.slug,
                description: body.description,
                price: Number(body.price),
                salePrice: body.salePrice ? Number(body.salePrice) : null,
                category: body.category,
                stock: Number(body.stock),
                images: JSON.stringify(body.images || []),
                isFeatured: body.isFeatured || false,
                deliveryFee: body.deliveryFee ? Number(body.deliveryFee) : 0,
                weight: body.weight ? Number(body.weight) : 0,
                advanceDiscount: body.advanceDiscount ? Number(body.advanceDiscount) : 0,
                advanceDiscountType: body.advanceDiscountType || "PKR",
                ...(body.variations && body.variations.length > 0 && {
                    variations: {
                        create: body.variations.map((v: any) => ({
                            title: v.title,
                            price: Number(v.price),
                            originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
                            discountLabel: v.discountLabel || null,
                            stock: Number(v.stock || 0),
                            deliveryFee: v.deliveryFee !== undefined ? Number(v.deliveryFee) : 0
                        }))
                    }
                })
            },
            include: { variations: true }
        });
        return NextResponse.json(product);
    } catch (error: any) {
        console.error("Product creation failed:", error);
        return NextResponse.json({
            error: "Failed to create product",
            details: error.message
        }, { status: 500 });
    }
}

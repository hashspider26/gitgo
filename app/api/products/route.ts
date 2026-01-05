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
            }
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

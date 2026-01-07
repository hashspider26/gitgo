import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";


export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    try {
        let products;
        if (category) {
            products = await prisma.$queryRaw`SELECT * FROM "Product" WHERE category = ${category} ORDER BY createdAt DESC`;
        } else {
            products = await prisma.$queryRaw`SELECT * FROM "Product" ORDER BY createdAt DESC`;
        }
        return NextResponse.json((products as any[]).map(p => {
            const getVal = (key: string) => {
                const lowerKey = key.toLowerCase();
                const actualKey = Object.keys(p).find(k => k.toLowerCase() === lowerKey);
                return actualKey ? p[actualKey] : undefined;
            };
            return {
                ...p,
                id: getVal('id'),
                price: Number(getVal('price')),
                deliveryFee: Number(getVal('deliveryFee') || 0),
                weight: Number(getVal('weight') || 0),
                advanceDiscount: Number(getVal('advanceDiscount') || 0),
                advanceDiscountType: getVal('advanceDiscountType') || 'PKR'
            };
        }));
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
        const productId = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();

        await prisma.$executeRaw`
            INSERT INTO "Product" (
                id, title, slug, description, price, salePrice, category, 
                stock, images, isFeatured, deliveryFee, weight, 
                advanceDiscount, advanceDiscountType, createdAt, updatedAt
            )
            VALUES (
                ${productId}, 
                ${body.title}, 
                ${body.slug}, 
                ${body.description}, 
                ${Number(body.price)}, 
                ${body.salePrice ? Number(body.salePrice) : null}, 
                ${body.category}, 
                ${Number(body.stock)}, 
                ${JSON.stringify(body.images || [])}, 
                ${body.isFeatured ? 1 : 0}, 
                ${Number(body.deliveryFee || 0)}, 
                ${Number(body.weight || 0)}, 
                ${Number(body.advanceDiscount || 0)}, 
                ${body.advanceDiscountType || "PKR"}, 
                ${now}, 
                ${now}
            )
        `;

        return NextResponse.json({ id: productId, success: true });
    } catch (error: any) {
        console.error("Product creation failed:", error);
        return NextResponse.json({
            error: "Failed to create product",
            details: error.message
        }, { status: 500 });
    }
}

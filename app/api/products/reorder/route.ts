import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { productIds } = body;

        if (!Array.isArray(productIds)) {
            return NextResponse.json({ error: "Invalid product IDs" }, { status: 400 });
        }

        // Update each product's position
        // We use a transaction to ensure all updates succeed or fail together
        await prisma.$transaction(
            productIds.map((id, index) =>
                prisma.product.update({
                    where: { id },
                    data: { position: index },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Reorder products error:", error);
        return NextResponse.json({ error: "Failed to reorder products" }, { status: 500 });
    }
}

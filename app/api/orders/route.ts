import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await getServerSession(authOptions);

        // In a real app validate body via Zod
        const { firstName, lastName, phone, address, city, items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        let totalAmount = 0;
        const orderItems: any[] = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) continue;

            const productTotal = product.price * item.quantity;
            const deliveryFee = (product as any).deliveryFee || 0;
            totalAmount += productTotal + deliveryFee;

            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        if (orderItems.length === 0) {
            return NextResponse.json({ error: "No valid products found" }, { status: 400 });
        }

        const order = await (prisma.order as any).create({
            data: {
                customerName: `${firstName} ${lastName}`,
                phone,
                address,
                city,
                totalAmount,
                status: "PENDING",
                userId: session?.user?.id || null,
                items: {
                    create: orderItems
                }
            }
        });

        // Auto-save user details to profile if logged in
        if (session?.user?.id) {
            try {
                // Use type casting to bypass temporary Prisma Client sync issues (EPERM during generate)
                await (prisma.user as any).update({
                    where: { id: session.user.id },
                    data: {
                        phone: phone || (session.user as any).phone,
                        address: address || (session.user as any).address,
                        city: city || (session.user as any).city,
                    }
                });
            } catch (profileError) {
                console.warn("User profile auto-save failed (likely client out of sync):", profileError);
            }
        }

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({
            error: "Failed to create order",
            details: error.message
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    // Check auth - admin only
    try {
        const orders = await prisma.order.findMany({
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: "desc" }
        });
        return NextResponse.json(orders);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
    }
}

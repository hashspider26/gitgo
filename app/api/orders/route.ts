import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendDiscordOrderNotification } from "@/lib/discord";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await getServerSession(authOptions);

        // In a real app validate body via Zod
        const { firstName, lastName, phone, address, city, items } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        let subtotal = 0;
        const orderItems: any[] = [];
        let totalWeightGrams = 0;
        let maxBaseDeliveryFee = 0;

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) continue;

            const productTotal = product.price * item.quantity;
            subtotal += productTotal;
            const weight = (product as any).weight || 0;
            const deliveryFee = (product as any).deliveryFee || 0;
            totalWeightGrams += weight * item.quantity;
            if (deliveryFee > maxBaseDeliveryFee) maxBaseDeliveryFee = deliveryFee;

            orderItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        if (orderItems.length === 0) {
            return NextResponse.json({ error: "No valid products found" }, { status: 400 });
        }

        // Delivery: base fee for first 1000g, then +100 PKR per extra 1000g
        let deliverySurcharge = 0;
        if (totalWeightGrams > 1000) {
            const extraGrams = totalWeightGrams - 1000;
            deliverySurcharge = Math.ceil(extraGrams / 1000) * 100;
        }
        const totalDeliveryFee = maxBaseDeliveryFee + deliverySurcharge;
        const discountAmount = body.discountAmount || 0;
        const totalAmount = subtotal + totalDeliveryFee - discountAmount;

        const orderData = {
            customerName: firstName && lastName ? `${firstName} ${lastName}` : body.customerName || "Customer",
            phone,
            address,
            city,
            totalAmount,
            discountAmount,
            paymentMethod: body.paymentMethod || "COD",
            status: "PENDING" as const,
            userId: session?.user?.id || null,
            items: { create: orderItems }
        };

        let order: any = null;
        const maxAttempts = 10;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            const ordersWithReadable = await prisma.order.findMany({
                where: { readableId: { not: null } },
                select: { readableId: true }
            });
            let maxNum = 0;
            for (const o of ordersWithReadable) {
                const m = (o.readableId || "").match(/^GVS-(\d+)$/);
                if (m) maxNum = Math.max(maxNum, parseInt(m[1], 10));
            }
            const nextIdNumber = maxNum + 1;
            const readableId = `GVS-${nextIdNumber.toString().padStart(5, "0")}`;

            try {
                order = await (prisma.order as any).create({
                    data: { readableId, ...orderData }
                });
                break;
            } catch (err: any) {
                const isUniqueViolation = err?.code === "P2002" || (err?.message && String(err.message).includes("UNIQUE constraint failed"));
                if (isUniqueViolation && attempt < maxAttempts - 1) {
                    continue;
                }
                throw err;
            }
        }

        if (!order) {
            return NextResponse.json({ error: "Failed to create order (readableId)" }, { status: 500 });
        }

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

        // Send Discord notification (fire and forget)
        const fullOrder = await prisma.order.findUnique({
            where: { id: order.id },
            include: { items: { include: { product: true } } }
        });
        if (fullOrder) {
            sendDiscordOrderNotification(fullOrder).catch(err =>
                console.error("Delayed Discord notification failed:", err)
            );
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

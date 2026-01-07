import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const session = await getServerSession(authOptions);

        const { firstName, lastName, phone, address, city, items, paymentMethod = "COD" } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "No items in order" }, { status: 400 });
        }

        // Generate sequential human-readable ID
        const orderCount = await prisma.order.count();
        const nextIdNumber = orderCount + 1;
        const readableId = `GVS-${nextIdNumber.toString().padStart(5, '0')}`;

        let subtotal = 0;
        let totalDeliveryFee = 0;
        const validItems: any[] = [];
        let totalDiscount = 0;
        for (const item of items) {
            const products = await prisma.$queryRaw`SELECT * FROM "Product" WHERE id = ${item.productId} LIMIT 1` as any[];
            if (!products || products.length === 0) continue;
            const rawProduct = products[0];
            const getProdVal = (key: string) => {
                const lowerKey = key.toLowerCase();
                const actualKey = Object.keys(rawProduct).find(k => k.toLowerCase() === lowerKey);
                return actualKey ? rawProduct[actualKey] : undefined;
            };

            const product = {
                id: getProdVal('id'),
                price: Number(getProdVal('price') || 0),
                weight: Number(getProdVal('weight') || 0),
                deliveryFee: Number(getProdVal('deliveryFee') || 0),
                advanceDiscount: Number(getProdVal('advanceDiscount') || 0),
                advanceDiscountType: getProdVal('advanceDiscountType') || 'PKR'
            };

            const productTotal = product.price * item.quantity;
            subtotal += productTotal;

            // Delivery calculation
            const baseFee = product.deliveryFee || 0;
            if (baseFee > 0) {
                const totalWeight = (product.weight || 0) * item.quantity;
                const extraWeightKg = Math.max(0, Math.ceil(totalWeight / 1000) - 1);
                totalDeliveryFee += baseFee + (extraWeightKg * 100);
            }

            // Discount calculation for advance payment
            if (product.advanceDiscount && product.advanceDiscount > 0) {
                let itemDiscount = 0;
                if (product.advanceDiscountType === "PERCENT") {
                    itemDiscount = (product.price * product.advanceDiscount / 100) * item.quantity;
                } else {
                    itemDiscount = product.advanceDiscount * item.quantity;
                }
                totalDiscount += itemDiscount;
            }

            validItems.push({
                productId: product.id,
                quantity: item.quantity,
                price: product.price
            });
        }

        const discountToApply = paymentMethod === "ADVANCE" ? totalDiscount : 0;
        const totalAmount = subtotal + totalDeliveryFee - discountToApply;

        console.log("Order Calculation Debug:", {
            subtotal,
            totalDeliveryFee,
            totalDiscount,
            discountToApply,
            totalAmount,
            paymentMethod
        });

        if (validItems.length === 0) {
            return NextResponse.json({ error: "No valid products found" }, { status: 400 });
        }

        const orderId = `order_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const customerName = `${firstName} ${lastName}`;
        const userId = session?.user?.id || null;
        const now = new Date().toISOString();

        await prisma.$transaction(async (tx) => {
            // Use tx.$executeRaw with template literals for safer/better parameter binding
            await tx.$executeRaw`
                INSERT INTO "Order" (id, readableId, customerName, phone, address, city, totalAmount, discountAmount, paymentMethod, status, stockDeducted, userId, createdAt, updatedAt)
                VALUES (${orderId}, ${readableId}, ${customerName}, ${phone}, ${address}, ${city}, ${totalAmount}, ${discountToApply}, ${paymentMethod}, 'PENDING', 0, ${userId}, ${now}, ${now})
            `;

            for (const item of validItems) {
                const itemId = `item_${Math.random().toString(36).slice(2, 9)}`;
                await tx.$executeRaw`
                    INSERT INTO "OrderItem" (id, orderId, productId, quantity, price)
                    VALUES (${itemId}, ${orderId}, ${item.productId}, ${item.quantity}, ${item.price})
                `;
            }
        });

        if (userId) {
            try {
                await (prisma.user as any).update({
                    where: { id: userId },
                    data: { phone, address, city }
                });
            } catch (e) { }
        }

        return NextResponse.json({ id: orderId, readableId });
    } catch (error: any) {
        console.error("Order creation error:", error);
        return NextResponse.json({
            error: "Failed to create order",
            details: error.message
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        // Switch to Raw SQL for fetching as well to ensure we get custom columns 
        // even if Prisma Client is struggling with the schema sync
        const orders = await prisma.$queryRaw`
            SELECT 
                o.*,
                (SELECT json_group_array(
                    json_object(
                        'id', oi.id,
                        'orderId', oi.orderId,
                        'productId', oi.productId,
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'product', (SELECT json_object('id', p.id, 'title', p.title, 'images', p.images) FROM "Product" p WHERE p.id = oi.productId)
                    )
                ) FROM "OrderItem" oi WHERE oi.orderId = o.id) as items
            FROM "Order" o
            ORDER BY o.createdAt DESC
        `;

        // Parse items JSON string back to object
        const parsedOrders = (orders as any[]).map(order => ({
            ...order,
            items: order.items ? JSON.parse(order.items) : []
        }));

        return NextResponse.json(parsedOrders);
    } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        // Fallback to prisma if raw fails (though raw is safer here)
        try {
            const orders = await prisma.order.findMany({
                include: { items: { include: { product: true } } },
                orderBy: { createdAt: "desc" }
            });
            return NextResponse.json(orders);
        } catch (e) {
            return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
        }
    }
}

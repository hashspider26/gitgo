import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { status: newStatus } = body;

        // Fetch current order to check stockDeducted status and items
        const order = await prisma.order.findUnique({
            where: { id: params.id },
            include: { items: true }
        });

        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const deductionStatuses = ["CONFIRMED", "SHIPPED", "DELIVERED"];
        const shouldDeductStock = deductionStatuses.includes(newStatus) && !(order as any).stockDeducted;

        console.log(`Updating order ${params.id} to status ${newStatus}. Should deduct stock: ${shouldDeductStock}`);

        if (shouldDeductStock) {
            try {
                await prisma.$transaction(async (tx) => {
                    // 1. Decrement stock for each product in the order
                    for (const item of order.items) {
                        const product = await tx.product.findUnique({ where: { id: item.productId } });

                        if (product) {
                            await tx.product.update({
                                where: { id: item.productId },
                                data: {
                                    stock: {
                                        decrement: Math.min(item.quantity, product.stock)
                                    }
                                }
                            });
                        }
                    }

                    // 2. Update order status and mark as stockDeducted using Raw SQL
                    // This bypasses the "Library not found/Out of sync" Prisma runtime validation
                    // while your dev server is locking the Prisma Client generation.
                    await tx.$executeRaw`UPDATE "Order" SET "status" = ${newStatus}, "stockDeducted" = 1 WHERE "id" = ${params.id}`;
                });
            } catch (txError) {
                console.error("Transaction failed:", txError);
                throw txError;
            }
        } else {
            // Just update the status normally using Raw SQL
            await prisma.$executeRaw`UPDATE "Order" SET "status" = ${newStatus} WHERE "id" = ${params.id}`;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Order update error details:", error?.message || error);
        return NextResponse.json({
            error: "Failed to update status",
            details: error?.message || "Internal Server Error"
        }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    return PUT(request, { params });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { status } = body;

        const order = await prisma.order.update({
            where: { id: params.id },
            data: { status }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
    }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    return PUT(request, { params });
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, phone, address, city } = body;

        // Use type casting to bypass temporary Prisma Client sync issues
        const updatedUser = await (prisma.user as any).update({
            where: { id: session.user.id },
            data: {
                name,
                phone,
                address,
                city,
            }
        });

        return NextResponse.json({
            success: true,
            user: {
                name: updatedUser.name,
                phone: updatedUser.phone,
                address: updatedUser.address,
                city: updatedUser.city,
            }
        });
    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}


import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        // Use Raw SQL to ensure we get the latest data even if Prisma Client is out of sync
        // Using $queryRaw allows us to bypass the 'displayOrder' check if Prisma thinks it doesn't exist.
        const categoriesRaw = await prisma.$queryRaw`SELECT * FROM "Category" ORDER BY displayOrder ASC`;

        // Robust normalization
        const categories = (categoriesRaw as any[]).map(cat => {
            const getVal = (key: string) => {
                const lowerKey = key.toLowerCase();
                const actualKey = Object.keys(cat).find(k => k.toLowerCase() === lowerKey);
                return actualKey ? cat[actualKey] : undefined;
            };

            return {
                id: getVal('id'),
                name: getVal('name'),
                displayOrder: getVal('displayOrder') ?? 0,
            };
        });

        return NextResponse.json(categories);
    } catch (error: any) {
        console.error("Failed to fetch categories:", error);
        // Fallback to standard prisma if raw fails
        try {
            const categories = await prisma.category.findMany({
                orderBy: { displayOrder: 'asc' } as any
            });
            return NextResponse.json(categories);
        } catch (e) {
            return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
        }
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: "Name is required" }, { status: 400 });
        }

        // Check if category already exists (case-insensitive)
        const existing = await prisma.$queryRaw`SELECT * FROM "Category" WHERE LOWER(name) = LOWER(${name})`;
        if (Array.isArray(existing) && existing.length > 0) {
            return NextResponse.json({ error: "Category already exists" }, { status: 400 });
        }

        // Get current max displayOrder
        const stats: any[] = await prisma.$queryRaw`SELECT MAX(displayOrder) as maxOrder FROM "Category"`;
        const maxVal = (stats[0]?.maxOrder === null || stats[0]?.maxOrder === undefined) ? -1 : stats[0].maxOrder;
        const nextOrder = maxVal + 1;

        const id = `cat_${Date.now()}`;
        const now = new Date().toISOString();

        // Use Raw SQL for insertion to ensure displayOrder is correctly handled
        await prisma.$executeRaw`
            INSERT INTO "Category" (id, name, displayOrder, createdAt, updatedAt)
            VALUES (${id}, ${name}, ${nextOrder}, ${now}, ${now})
        `;

        return NextResponse.json({ id, name, displayOrder: nextOrder });
    } catch (error: any) {
        console.error("Failed to create category:", error);
        return NextResponse.json({ error: "Failed to create category", details: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { categoryIds } = body;

        if (!Array.isArray(categoryIds)) {
            return NextResponse.json({ error: "Invalid data" }, { status: 400 });
        }

        // Update reorder via Raw SQL
        for (let i = 0; i < categoryIds.length; i++) {
            await prisma.$executeRaw`UPDATE "Category" SET displayOrder = ${i} WHERE id = ${categoryIds[i]}`;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to reorder categories:", error);
        return NextResponse.json({ error: "Failed to reorder categories" }, { status: 500 });
    }
}

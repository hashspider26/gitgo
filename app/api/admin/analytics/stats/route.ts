import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export async function GET() {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();

        // 1. Basic Stats using Raw SQL
        const basicStats: any[] = await prisma.$queryRaw`
            SELECT type, COUNT(*) as count 
            FROM AnalyticsEvent 
            WHERE createdAt >= ${thirtyDaysAgoStr}
            GROUP BY type
        `;

        // 1.5 Unique Visitors (Unique IPs in last 30 days)
        const uniqueVisitors: any[] = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT ip) as count 
            FROM AnalyticsEvent 
            WHERE createdAt >= ${thirtyDaysAgoStr}
        `;

        // 2. Sources
        const sources: any[] = await prisma.$queryRaw`
            SELECT source, COUNT(*) as count 
            FROM AnalyticsEvent 
            WHERE createdAt >= ${thirtyDaysAgoStr}
            GROUP BY source
            ORDER BY count DESC
        `;

        // 3. Devices
        const devices: any[] = await prisma.$queryRaw`
            SELECT device, COUNT(*) as count 
            FROM AnalyticsEvent 
            WHERE createdAt >= ${thirtyDaysAgoStr}
            GROUP BY device
        `;

        // 4. Most viewed products with REAL Sales from Order table
        const topProducts: any[] = await prisma.$queryRaw`
            SELECT productId, COUNT(*) as count 
            FROM AnalyticsEvent 
            WHERE type = 'VIEW_PRODUCT' AND productId IS NOT NULL AND createdAt >= ${thirtyDaysAgoStr}
            GROUP BY productId
            ORDER BY count DESC
            LIMIT 50
        `;

        const realSales: any[] = await prisma.$queryRaw`
            SELECT oi.productId, SUM(oi.quantity) as soldQuantity
            FROM OrderItem oi
            JOIN "Order" o ON oi.orderId = o.id
            WHERE o.status != 'CANCELLED' AND o.createdAt >= ${thirtyDaysAgoStr}
            GROUP BY oi.productId
        `;

        // Get product titles
        const productIds = topProducts.map(p => p.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true }
        });

        const topProductsWithTitles = topProducts.map(tp => {
            const product = products.find(p => p.id === tp.productId);
            const salesRecord = realSales.find(rs => rs.productId === tp.productId);
            return {
                title: product?.title || 'Unknown Product',
                views: Number(tp.count),
                sales: salesRecord ? Number(salesRecord.soldQuantity) : 0
            };
        });

        // 5. Recent Events - ADD_TO_CART, PURCHASE, and VIEW_PRODUCT events, Limit 100 (Include IP)
        const recentEvents: any[] = await prisma.$queryRaw`
            SELECT id, type, path, source, device, ip, createdAt, metadata, productId
            FROM AnalyticsEvent
            WHERE type IN ('ADD_TO_CART', 'PURCHASE', 'VIEW_PRODUCT')
            ORDER BY createdAt DESC
            LIMIT 100
        `;

        return NextResponse.json({
            basicStats: basicStats.map(s => ({ type: s.type, _count: { _all: Number(s.count) } })),
            uniqueVisitors: Number(uniqueVisitors[0]?.count || 0),
            sources: sources.map(s => ({ source: s.source, _count: { _all: Number(s.count) } })),
            devices: devices.map(d => ({ device: d.device, _count: { _all: Number(d.count) } })),
            topProducts: topProductsWithTitles,
            recentEvents: recentEvents.map(e => ({
                ...e,
                metadata: e.metadata || null
            }))
        });
    } catch (error) {
        console.error("Failed to fetch analytics stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

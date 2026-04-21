import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const filter = searchParams.get('filter') || '30d';

        let startDate = new Date();
        if (filter === '24h') {
            startDate.setHours(startDate.getHours() - 24);
        } else if (filter === '7d') {
            startDate.setDate(startDate.getDate() - 7);
        } else if (filter === '28d') {
            startDate.setDate(startDate.getDate() - 28);
        } else if (filter === 'all') {
            startDate = new Date(0); // Epoch
        } else {
            startDate.setDate(startDate.getDate() - 30); // Default
        }
        
        const startDateStr = startDate.toISOString();

        // 1. Basic Stats using Raw SQL
        const basicStats: any[] = await prisma.$queryRaw`
            SELECT type, COUNT(*) as count 
            FROM AnalyticsEvent 
            WHERE createdAt >= ${startDateStr}
            GROUP BY type
        `;

        // 1.5 Unique Visitors (Unique IPs in last timeframe)
        const uniqueVisitors: any[] = await prisma.$queryRaw`
            SELECT COUNT(DISTINCT ip) as count 
            FROM AnalyticsEvent 
            WHERE createdAt >= ${startDateStr}
        `;

        // 2. Sources
        const sources: any[] = await prisma.$queryRaw`
            SELECT 
                source, 
                COUNT(*) as count,
                SUM(CASE WHEN type = 'PURCHASE' THEN 1 ELSE 0 END) as purchases
            FROM AnalyticsEvent 
            WHERE createdAt >= ${startDateStr}
            GROUP BY source
            ORDER BY count DESC
        `;

        // 3. Devices
        const devices: any[] = await prisma.$queryRaw`
            SELECT device, COUNT(*) as count 
            FROM AnalyticsEvent 
            WHERE createdAt >= ${startDateStr}
            GROUP BY device
        `;

        // 4. Most viewed products with REAL Sales from Order table
        const topProducts: any[] = await prisma.$queryRaw`
            SELECT productId, COUNT(*) as count 
            FROM AnalyticsEvent 
            WHERE type = 'VIEW_PRODUCT' AND productId IS NOT NULL AND createdAt >= ${startDateStr}
            GROUP BY productId
            ORDER BY count DESC
            LIMIT 100
        `;

        const realSales: any[] = await prisma.$queryRaw`
            SELECT oi.productId, SUM(oi.quantity) as soldQuantity, COUNT(DISTINCT oi.orderId) as orderCount
            FROM OrderItem oi
            JOIN "Order" o ON oi.orderId = o.id
            WHERE o.status != 'CANCELLED' AND o.createdAt >= ${startDateStr}
            GROUP BY oi.productId
        `;

        // Get product titles
        const productIds = Array.from(new Set([
            ...topProducts.map(p => p.productId),
            ...realSales.map(rs => rs.productId)
        ]));

        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
            select: { id: true, title: true }
        });

        const topProductsWithTitles = productIds.map(pid => {
            const product = products.find(p => p.id === pid);
            const viewRecord = topProducts.find(tp => tp.productId === pid);
            const salesRecord = realSales.find(rs => rs.productId === pid);
            
            const views = viewRecord ? Number(viewRecord.count) : 0;
            const orders = salesRecord ? Number(salesRecord.orderCount) : 0;
            const sales = salesRecord ? Number(salesRecord.soldQuantity) : 0;
            const ratio = views > 0 ? (orders / views) * 100 : 0;

            return {
                title: product?.title || 'Unknown Product',
                views,
                orders,
                sales,
                ratio: Number(ratio.toFixed(1))
            };
        }).sort((a, b) => b.ratio - a.ratio);

        // 5. Recent Events - ADD_TO_CART, PURCHASE, and VIEW_PRODUCT events, Limit 100 (Include IP)
        const recentEvents: any[] = await prisma.$queryRaw`
            SELECT id, type, path, source, device, ip, createdAt, metadata, productId
            FROM AnalyticsEvent
            WHERE type IN ('ADD_TO_CART', 'PURCHASE', 'VIEW_PRODUCT')
            ORDER BY createdAt DESC
            LIMIT 100
        `;

        const normalizedSources = sources.reduce((acc: any[], s: any) => {
            let name = s.source || 'Direct';
            if (['fb', 'facebook', 'facebook.com'].includes(name.toLowerCase())) name = 'Facebook';
            if (['ig', 'instagram', 'instagram.com'].includes(name.toLowerCase())) name = 'Instagram';
            if (name.toLowerCase() === 'direct') name = 'Direct';
            
            const existing = acc.find(item => item.source === name);
            if (existing) {
                existing._count._all += Number(s.count);
                existing.orders += Number(s.purchases || 0);
            } else {
                acc.push({
                    source: name,
                    _count: { _all: Number(s.count) },
                    orders: Number(s.purchases || 0)
                });
            }
            return acc;
        }, []).sort((a, b) => b._count._all - a._count._all);

        // 6. Time Series for Line Chart
        const allEvents = await prisma.analyticsEvent.findMany({
            where: { createdAt: { gte: startDate } },
            select: { createdAt: true, type: true }
        });

        const timeSeries = allEvents.reduce((acc: Record<string, any>, event) => {
            const date = event.createdAt.toISOString().split('T')[0];
            if (!acc[date]) {
                acc[date] = { date, PAGE_VIEW: 0, PURCHASE: 0, ADD_TO_CART: 0 };
            }
            if (acc[date][event.type] !== undefined) {
                acc[date][event.type]++;
            } else if (event.type === 'VIEW_PRODUCT' || event.type === 'PAGE_VIEW') {
                acc[date].PAGE_VIEW++;
            }
            return acc;
        }, {});
        
        const chartData = Object.values(timeSeries).sort((a: any, b: any) => a.date.localeCompare(b.date));

        return NextResponse.json({
            basicStats: basicStats.map(s => ({ type: s.type, _count: { _all: Number(s.count) } })),
            uniqueVisitors: Number(uniqueVisitors[0]?.count || 0),
            sources: normalizedSources,
            devices: devices.map(d => ({ device: d.device, _count: { _all: Number(d.count) } })),
            topProducts: topProductsWithTitles,
            chartData,
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

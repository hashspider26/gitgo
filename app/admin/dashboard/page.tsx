import Link from "next/link";
import { Package, ShoppingBag, Plus, DollarSign, Clock, AlertCircle, Tags, Mail, BarChart3, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

function formatPrice(amount: number) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default async function DashboardPage() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [
        totalProducts,
        totalOrders,
        orders,
        pendingOrders,
        unreadMessages,
        analyticsStats,
        sourceStatsRaw,
        uniqueVisitorsRows
    ] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.findMany({ select: { totalAmount: true } }),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.contactMessage.count({ where: { status: 'UNREAD' } }),
        prisma.analyticsEvent.groupBy({
            by: ['type'],
            _count: { _all: true },
            where: {
                createdAt: { gte: thirtyDaysAgo }
            }
        }),
        prisma.$queryRaw`
            SELECT source, COUNT(DISTINCT ip) as uniqueVisitors, COUNT(*) as totalViews
            FROM AnalyticsEvent
            WHERE type = 'PAGE_VIEW' AND createdAt >= ${thirtyDaysAgo}
            GROUP BY source
            ORDER BY totalViews DESC
            LIMIT 10
        `,
        prisma.$queryRaw`SELECT COUNT(DISTINCT ip) as count FROM AnalyticsEvent WHERE createdAt >= ${thirtyDaysAgo}`
    ]);

    const sourceStats = Array.isArray(sourceStatsRaw) ? sourceStatsRaw : [];

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const statsMap = (analyticsStats as any[]).reduce((acc: any, s: any) => {
        acc[s.type] = s._count._all;
        return acc;
    }, {});

    const productViews = statsMap['VIEW_PRODUCT'] || 0;
    const addedToCart = statsMap['ADD_TO_CART'] || 0;
    const sales = statsMap['PURCHASE'] || 0;
    const totalViews = statsMap['PAGE_VIEW'] || 0;
    const uniqueVisitors = Number((uniqueVisitorsRows as { count?: number }[])?.[0]?.count ?? 0);

    const stats = [
        {
            label: "Total Revenue",
            value: formatPrice(totalRevenue),
            icon: DollarSign,
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-900/10"
        },
        {
            label: "Total Orders",
            value: totalOrders,
            icon: ShoppingBag,
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/10"
        },
        {
            label: "Total Products",
            value: totalProducts,
            icon: Package,
            color: "text-amber-600",
            bg: "bg-amber-50 dark:bg-amber-900/10"
        },
        {
            label: "Pending Orders",
            value: pendingOrders,
            icon: AlertCircle,
            color: "text-rose-600",
            bg: "bg-rose-50 dark:bg-rose-900/10"
        }
    ];

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-6">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Store Overview</h1>
                    <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-500">
                        <Clock className="h-3 w-3" /> Updated just now
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-black p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Analytics Highlights */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary rotate-45" /> Visitor Analytics
                        </h2>
                        <Link href="/admin/dashboard/analytics" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                            Go to Analytics <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="bg-white dark:bg-black rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left mb-10 pb-10 border-b border-zinc-100 dark:border-zinc-800">
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Product Views</p>
                                <p className="text-4xl font-black text-zinc-900 dark:text-white">{productViews.toLocaleString()}</p>
                                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Last 30 Days</p>
                            </div>
                            <div className="border-y md:border-y-0 md:border-x border-zinc-100 dark:border-zinc-800 py-6 md:py-0 md:px-8">
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Added to Cart</p>
                                <p className="text-4xl font-black text-zinc-900 dark:text-white">{addedToCart.toLocaleString()}</p>
                                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Last 30 Days</p>
                            </div>
                            <div className="md:pl-8">
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Sales</p>
                                <p className="text-4xl font-black text-primary">{sales.toLocaleString()}</p>
                                <p className="text-[10px] text-zinc-500 mt-2 font-medium">Orders placed</p>
                            </div>
                        </div>

                        <div>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[280px]">
                                    <thead>
                                        <tr className="text-left border-b border-zinc-200 dark:border-zinc-700">
                                            <th className="pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Source</th>
                                            <th className="pb-3 pr-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Unique Visitors</th>
                                            <th className="pb-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Total Views</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                        {(sourceStats || []).map((row: any, i: number) => (
                                            <tr key={row.source ?? i}>
                                                <td className="py-3 pr-4 text-sm font-bold text-zinc-600 dark:text-zinc-400">{row.source || "Direct"}</td>
                                                <td className="py-3 pr-4 text-sm font-black text-zinc-900 dark:text-white text-right">{Number(row.uniqueVisitors ?? row.unique_visitors ?? 0).toLocaleString()}</td>
                                                <td className="py-3 text-sm font-black text-zinc-900 dark:text-white text-right">{Number(row.totalViews ?? row.total_views ?? 0).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <h2 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-zinc-400" /> Quick Actions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Link href="/admin/dashboard/products" className="group block p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-green-100 text-green-600 rounded-lg dark:bg-green-900/30 group-hover:scale-110 transition-transform">
                                <Package className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Manage Products</h3>
                                <p className="text-zinc-500 text-sm">Add, edit, or remove products from your store.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/dashboard/orders" className="group block p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/30 group-hover:scale-110 transition-transform">
                                <ShoppingBag className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">View Orders</h3>
                                <p className="text-zinc-500 text-sm">Check incoming orders and manage shipments.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/dashboard/analytics" className="group block p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30 group-hover:scale-110 transition-transform">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Full Analytics</h3>
                                <p className="text-zinc-500 text-sm">Deep dive into visitor sources, devices and more.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/dashboard/categories" className="group block p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary transition-all hover:shadow-md">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30 group-hover:scale-110 transition-transform">
                                <Tags className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Categories</h3>
                                <p className="text-zinc-500 text-sm">Add and manage product categories.</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="/admin/dashboard/messages" className="group block p-6 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-primary transition-all hover:shadow-md relative">
                        {unreadMessages > 0 && (
                            <span className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {unreadMessages}
                            </span>
                        )}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/30 group-hover:scale-110 transition-transform">
                                <Mail className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">Messages</h3>
                                <p className="text-zinc-500 text-sm">View and manage contact form messages.</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

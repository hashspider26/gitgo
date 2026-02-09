"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    BarChart3, ShoppingCart, Package, Globe,
    Activity, Calendar, TrendingUp, Search, Eye
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("/api/admin/analytics/stats");
                const json = await res.json();
                setData(json);
            } catch (e) {
                console.error("Failed to load analytics", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50  p-4 md:p-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Activity className="h-10 w-10 text-primary animate-pulse" />
                    <p className="text-zinc-500 font-medium animate-pulse">Loading Analytics...</p>
                </div>
            </div>
        );
    }

    const stats = data?.basicStats?.reduce((acc: any, s: any) => {
        acc[s.type] = s._count._all;
        return acc;
    }, {}) || {};

    return (
        <div className="min-h-screen bg-zinc-50  p-3 md:p-6">
            <div className="mx-auto max-w-[1600px]">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-xl md:text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2 md:gap-3">
                            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                            Visitor Analytics
                        </h1>
                        <p className="text-[11px] md:text-sm text-zinc-500">Overview of store traffic and sales</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white  px-3 py-1.5 md:px-4 md:py-2 rounded-xl border border-zinc-200  shadow-sm text-[10px] md:text-sm font-bold text-zinc-600 w-fit">
                        <Calendar className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                        Last 30 Days
                    </div>
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8">
                    <Card className="border-none shadow-sm  overflow-hidden group">
                        <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
                            <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">Page Views</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 pt-0">
                            <div className="text-xl md:text-3xl font-black text-zinc-900 ">{stats.PAGE_VIEW || 0}</div>
                            <p className="text-[8px] md:text-[10px] text-zinc-500 mt-0.5 md:mt-1 font-medium italic">Total visits</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm  overflow-hidden group">
                        <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
                            <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">Uniques</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 pt-0">
                            <div className="text-xl md:text-3xl font-black text-zinc-900 ">{data?.uniqueVisitors || 0}</div>
                            <p className="text-[8px] md:text-[10px] text-zinc-500 mt-0.5 md:mt-1 font-medium italic">By IP</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm  overflow-hidden group">
                        <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
                            <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">Cart Adds</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 pt-0">
                            <div className="text-xl md:text-3xl font-black text-zinc-900 ">{stats.ADD_TO_CART || 0}</div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm  overflow-hidden group">
                        <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
                            <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">Checkouts Started</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 pt-0">
                            <div className="text-xl md:text-3xl font-black text-zinc-900 ">{stats.INITIATE_CHECKOUT || 0}</div>
                            <p className="text-[8px] md:text-[10px] text-zinc-500 mt-0.5 md:mt-1 font-medium italic">Visits to checkout page</p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm  overflow-hidden group col-span-2 md:col-span-1">
                        <CardHeader className="p-3 md:p-4 pb-1 md:pb-2">
                            <CardTitle className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">Orders Placed</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 md:p-4 pt-0">
                            <div className="text-xl md:text-3xl font-black text-zinc-900 ">{stats.PURCHASE || 0}</div>
                            <p className="text-[8px] md:text-[10px] text-zinc-500 mt-0.5 md:mt-1 font-medium italic">Completed purchases</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-8">
                    {/* Traffic Sources */}
                    <div className="bg-white  rounded-2xl md:rounded-3xl p-4 md:p-6 border border-zinc-100  shadow-sm flex flex-col h-[250px] md:h-[300px]">
                        <h3 className="text-sm md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2 sticky top-0 bg-white  z-10 pb-2">
                            <Search className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Sources
                        </h3>
                        <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-none">
                            {data?.sources?.map((s: any) => (
                                <div key={s.source} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-2 md:gap-3">
                                        <div className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600">
                                            <Globe className="h-3 w-3 md:h-4 md:w-4" />
                                        </div>
                                        <span className="font-bold text-[10px] md:text-sm text-zinc-700 ">{s.source || 'Direct'}</span>
                                    </div>
                                    <span className="text-zinc-400 font-black text-[10px] md:text-sm">{s._count._all}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Hot Products */}
                    <div className="bg-white  rounded-2xl md:rounded-3xl p-4 md:p-6 border border-zinc-100  shadow-sm flex flex-col h-[250px] md:h-[300px]">
                        <h3 className="text-sm md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2 sticky top-0 bg-white  z-10 pb-2">
                            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Hot Products
                        </h3>
                        <div className="space-y-3 overflow-y-auto pr-2 flex-1 scrollbar-none">
                            {data?.topProducts?.map((p: any) => (
                                <div key={p.title} className="flex flex-col gap-1 pb-2 border-b border-zinc-50  last:border-0">
                                    <span className="font-bold text-[9px] md:text-[11px] text-zinc-700  line-clamp-1">{p.title}</span>
                                    <div className="flex items-center gap-2 md:gap-4 text-[8px] md:text-[10px] font-black tracking-tighter">
                                        <span className="text-zinc-400 flex items-center gap-1">
                                            <Eye className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                            <span className="text-zinc-900 ">{p.views || 0}</span>
                                            <span className="uppercase opacity-70 hidden md:inline">Views</span>
                                        </span>
                                        <span className="text-green-500 flex items-center gap-1">
                                            <Package className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                            <span className="text-green-600 ">{p.sales || 0}</span>
                                            <span className="uppercase opacity-70 hidden md:inline">Sales</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div className="bg-white  rounded-2xl md:rounded-3xl p-4 md:p-8 border border-zinc-100  shadow-sm">
                    <h3 className="text-sm md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
                        <Activity className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Recent Activity
                    </h3>
                    <div className="overflow-x-auto -mx-4 px-4 overflow-y-hidden">
                        <table className="w-full min-w-[500px]">
                            <thead>
                                <tr className="text-left border-b border-zinc-100 ">
                                    <th className="pb-3 md:pb-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">Event</th>
                                    <th className="pb-3 md:pb-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">Details</th>
                                    <th className="pb-3 md:pb-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400">IP</th>
                                    <th className="pb-3 md:pb-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400 hidden md:table-cell">Source</th>
                                    <th className="pb-3 md:pb-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-400 text-right">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 ">
                                {data?.recentEvents?.length > 0 ? (
                                    data.recentEvents.map((event: any) => {
                                        const isPurchase = event.type === 'PURCHASE';
                                        const isAddToCart = event.type === 'ADD_TO_CART';
                                        const isViewProduct = event.type === 'VIEW_PRODUCT';
                                        let metadata = null;
                                        if (event.metadata) {
                                            try {
                                                metadata = typeof event.metadata === 'string' ? JSON.parse(event.metadata) : event.metadata;
                                            } catch (e) {
                                                console.warn('Failed to parse metadata:', e);
                                                metadata = null;
                                            }
                                        }
                                        
                                        // Get event title from metadata or default
                                        let eventTitle = '';
                                        if (isPurchase && metadata?.orderId) {
                                            eventTitle = `Order #${metadata.orderId}`;
                                        } else if (isAddToCart && metadata?.title) {
                                            eventTitle = metadata.title;
                                        } else if (isViewProduct && metadata?.title) {
                                            eventTitle = metadata.title;
                                        } else if (isPurchase) {
                                            eventTitle = 'Order Placed';
                                        } else if (isViewProduct) {
                                            eventTitle = 'Product Viewed';
                                        } else {
                                            eventTitle = 'Item Added to Cart';
                                        }

                                        // Color scheme: green = Purchase, blue = Add to Cart, amber = Product Viewed
                                        const bgColor = isPurchase 
                                            ? 'bg-green-100 dark:bg-green-900/20' 
                                            : isViewProduct 
                                                ? 'bg-amber-100 dark:bg-amber-900/20' 
                                                : 'bg-blue-100 dark:bg-blue-900/20';
                                        const textColor = isPurchase 
                                            ? 'text-green-700 dark:text-green-400' 
                                            : isViewProduct 
                                                ? 'text-amber-700 dark:text-amber-400' 
                                                : 'text-blue-700 dark:text-blue-400';
                                        const borderColor = isPurchase 
                                            ? 'border-green-200 dark:border-green-800' 
                                            : isViewProduct 
                                                ? 'border-amber-200 dark:border-amber-800' 
                                                : 'border-blue-200 dark:border-blue-800';

                                        return (
                                            <tr key={event.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                                <td className="py-3 md:py-4">
                                                    <span className={`text-[8px] md:text-[10px] font-black px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-tighter ${bgColor} ${textColor} border ${borderColor} whitespace-nowrap inline-flex items-center gap-1.5`}>
                                                        {isPurchase ? (
                                                            <>
                                                                <ShoppingCart className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                                Purchase
                                                            </>
                                                        ) : isViewProduct ? (
                                                            <>
                                                                <Eye className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                                Product Viewed
                                                            </>
                                                        ) : (
                                                            <>
                                                                <ShoppingCart className="h-2.5 w-2.5 md:h-3 md:w-3" />
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </span>
                                                </td>
                                                <td className="py-3 md:py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-[9px] md:text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate max-w-[150px] md:max-w-[250px]">
                                                            {eventTitle}
                                                        </span>
                                                        {metadata && (
                                                            <span className="text-[8px] md:text-[9px] text-zinc-500 dark:text-zinc-400">
                                                                {isPurchase && metadata.total ? `PKR ${metadata.total.toLocaleString()}` : ''}
                                                                {isAddToCart && metadata.quantity ? `Qty: ${metadata.quantity}` : ''}
                                                                {isViewProduct && metadata.price ? `PKR ${metadata.price.toLocaleString()}` : ''}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3 md:py-4">
                                                    <span className="text-[8px] md:text-[10px] font-mono px-1 md:px-2 py-0.5 md:py-1 bg-zinc-50 dark:bg-zinc-800 rounded text-zinc-500 dark:text-zinc-400">
                                                        {event.ip ? event.ip.split('.').slice(0, 3).join('.') + '.*' : '...'}
                                                    </span>
                                                </td>
                                                <td className="py-3 md:py-4 font-bold text-[9px] md:text-xs text-zinc-500 dark:text-zinc-400 hidden md:table-cell">
                                                    {event.source || 'Direct'}
                                                </td>
                                                <td className="py-3 md:py-4 text-right text-[8px] md:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold whitespace-nowrap">
                                                    {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-8 text-center text-zinc-400 dark:text-zinc-500 text-sm">
                                            No recent activity
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

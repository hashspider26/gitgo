import Link from "next/link";
import { Package, ShoppingBag, Plus, DollarSign, Clock, AlertCircle, Tags, Mail } from "lucide-react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export const revalidate = 0;

function formatPrice(amount: number) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default async function DashboardPage() {
    const [totalProducts, totalOrders, orders, pendingOrders, unreadMessages] = await Promise.all([
        prisma.product.count(),
        prisma.order.count(),
        prisma.order.findMany({ select: { totalAmount: true } }),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.contactMessage.count({ where: { status: 'UNREAD' } })
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

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
                <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white">Store Overview</h1>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {stats.map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-black p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
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

                <h2 className="text-lg font-semibold mb-6 text-zinc-900 dark:text-white flex items-center gap-2">
                    <Clock className="h-5 w-5 text-zinc-400" /> Quick Actions
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

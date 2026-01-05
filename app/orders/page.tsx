import Link from "next/link";
import { ArrowLeft, Package, ShoppingBag, Calendar, MapPin, Phone } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function UserOrdersPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login?callbackUrl=/orders");
    }

    // Fetch orders for this specific user
    const orders = await (prisma.order as any).findMany({
        where: { userId: session.user.id },
        include: {
            items: {
                include: {
                    product: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    });

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        SHIPPED: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
        DELIVERED: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <Link href="/profile" className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-primary transition-colors group mb-3">
                            <div className="h-8 w-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mr-3 group-hover:border-primary">
                                <ArrowLeft className="h-4 w-4" />
                            </div>
                            Back to Profile
                        </Link>
                        <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">My Orders</h1>
                        <p className="text-zinc-500 mt-1">Track and view all your seed orders</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-xs font-bold text-primary uppercase tracking-widest border border-primary/20">
                        <ShoppingBag className="h-4 w-4" /> {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 p-16 text-center flex flex-col items-center gap-6 shadow-sm">
                        <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-400">
                            <ShoppingBag className="h-10 w-10" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold dark:text-zinc-100 mb-2">No orders yet</h2>
                            <p className="text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                                When you place an order, it will appear here so you can track its status and review your purchase history.
                            </p>
                        </div>
                        <Link href="/shop" className="mt-4 inline-flex items-center justify-center rounded-2xl bg-primary px-8 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order: any) => {
                            const orderDate = new Date(order.createdAt);
                            const images = order.items[0]?.product?.images ? JSON.parse(order.items[0].product.images) : [];
                            const firstImage = images[0] || "/placeholder.png";

                            return (
                                <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                                    {/* Header */}
                                    <div className="px-8 py-5 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                                <Package className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold">Order ID</p>
                                                <p className="font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">#{order.id.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Status</p>
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${statusColors[order.status] || statusColors.PENDING}`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                            {/* Order Items */}
                                            <div className="lg:col-span-2 space-y-4">
                                                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Items Ordered</h3>
                                                <div className="space-y-3">
                                                    {order.items.map((item: any) => {
                                                        const itemImages = item.product.images ? JSON.parse(item.product.images) : [];
                                                        const itemImage = itemImages[0] || "/placeholder.png";

                                                        return (
                                                            <div key={item.id} className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-black rounded-2xl border border-zinc-100 dark:border-zinc-800 group-hover:border-zinc-200 dark:group-hover:border-zinc-700 transition-colors">
                                                                <div className="h-16 w-16 bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex-shrink-0">
                                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                    <img src={itemImage} alt={item.product.title} className="w-full h-full object-cover" />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.product.title}</p>
                                                                    <p className="text-sm text-zinc-500 mt-0.5">Quantity: {item.quantity}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100">PKR {item.price * item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Total */}
                                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                                    <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Total Amount</span>
                                                    <span className="text-2xl font-black text-primary">PKR {order.totalAmount}</span>
                                                </div>
                                            </div>

                                            {/* Order Details */}
                                            <div className="space-y-6">
                                                <div>
                                                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4">Order Details</h3>
                                                    <div className="space-y-4">
                                                        <div className="flex items-start gap-3">
                                                            <Calendar className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Order Date</p>
                                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">
                                                                    {orderDate.toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <MapPin className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Delivery Address</p>
                                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1 leading-relaxed">
                                                                    {order.address}<br />
                                                                    {order.city}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start gap-3">
                                                            <Phone className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
                                                            <div>
                                                                <p className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Contact</p>
                                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{order.phone}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

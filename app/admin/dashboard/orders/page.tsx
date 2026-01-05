import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Package, Sprout } from "lucide-react";
import { OrderStatusManager } from "@/components/admin/order-status-manager";

export const revalidate = 0;

export default async function OrdersPage() {
    const orders = await prisma.order.findMany({
        include: {
            items: {
                include: {
                    product: true,
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-6">
            <div className="mx-auto max-w-5xl">
                <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6 transition-colors">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
                </Link>

                <h1 className="text-2xl font-bold mb-8 text-zinc-900 dark:text-white">Orders Management</h1>

                <div className="space-y-6">
                    {orders.map((order) => (
                        <div key={order.id} className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-zinc-100 dark:border-zinc-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-zinc-900 dark:text-white">{order.customerName}</h3>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                        <p className="font-medium text-zinc-700 dark:text-zinc-300">{order.phone}</p>
                                        <p>{order.address}, {order.city}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <p className="text-xs text-zinc-400">
                                        Ordered: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <OrderStatusManager orderId={order.id} currentStatus={order.status} />
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/30">
                                <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-4 tracking-widest px-1">Items Ordered</h4>
                                <ul className="space-y-4">
                                    {order.items.map((item) => {
                                        let imageUrl = null;
                                        try {
                                            const images = (item.product as any).images ? JSON.parse((item.product as any).images) : [];
                                            if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
                                        } catch (e) { }

                                        return (
                                            <li key={item.id} className="flex items-center justify-between group">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105">
                                                        {imageUrl ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={imageUrl} alt={item.product.title} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <Sprout className="h-5 w-5 text-zinc-300" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm text-zinc-900 dark:text-zinc-200 group-hover:text-primary transition-colors">
                                                            {item.product.title}
                                                        </span>
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                                            Qty: {item.quantity} × PKR {item.price}
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">PKR {item.price * item.quantity}</span>
                                            </li>
                                        );
                                    })}
                                </ul>
                                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between items-center px-1">
                                    <span className="text-sm text-zinc-500 font-medium">Order Total</span>
                                    <p className="font-bold text-xl text-primary">PKR {order.totalAmount}</p>
                                </div>
                            </div>
                        </div>
                    ))}

                    {orders.length === 0 && (
                        <div className="text-center py-20 text-zinc-500 bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center gap-3">
                            <Package className="h-10 w-10 text-zinc-300" />
                            <p className="font-medium">No orders received yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

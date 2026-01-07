import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Package, Sprout } from "lucide-react";
import { OrderStatusManager } from "@/components/admin/order-status-manager";

export const revalidate = 0;

export default async function OrdersPage() {
    // We use Raw SQL here to bypass Prisma Client's internal schema constraints.
    // Explicitly listing columns to ensure we get exactly what we need.
    const ordersRaw = await prisma.$queryRaw`
        SELECT 
            id,
            readableId,
            customerName,
            phone,
            address,
            city,
            totalAmount,
            discountAmount,
            paymentMethod,
            status,
            createdAt,
            (SELECT json_group_array(
                json_object(
                    'id', oi.id,
                    'orderId', oi.orderId,
                    'productId', oi.productId,
                    'quantity', oi.quantity,
                    'price', oi.price,
                    'product', (SELECT json_object('id', p.id, 'title', p.title, 'images', p.images) FROM "Product" p WHERE p.id = oi.productId)
                )
            ) FROM "OrderItem" oi WHERE oi.orderId = "Order".id) as items
        FROM "Order"
        ORDER BY createdAt DESC
    `;

    // Robust normalization to handle column name casing differences across environments
    const orders = (ordersRaw as any[]).map(order => {
        // Find keys case-insensitively
        const getVal = (key: string) => {
            const lowerKey = key.toLowerCase();
            const actualKey = Object.keys(order).find(k => k.toLowerCase() === lowerKey);
            return actualKey ? order[actualKey] : undefined;
        };

        return {
            ...order,
            id: getVal('id'),
            readableId: getVal('readableId'),
            customerName: getVal('customerName'),
            phone: getVal('phone'),
            address: getVal('address'),
            city: getVal('city'),
            totalAmount: getVal('totalAmount'),
            discountAmount: getVal('discountAmount') || 0,
            paymentMethod: getVal('paymentMethod'),
            status: getVal('status'),
            createdAt: getVal('createdAt'),
            items: order.items ? JSON.parse(order.items) : []
        };
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
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">
                                            #{order.readableId || order.id?.slice(0, 8)}
                                        </span>
                                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">{order.customerName}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter shadow-sm border ${String(order.paymentMethod || '').toUpperCase() === 'ADVANCE'
                                            ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                            : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
                                            }`}>
                                            {String(order.paymentMethod || '').toUpperCase() === 'ADVANCE' ? 'Advance' : 'COD'}
                                        </span>
                                    </div>
                                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{order.phone}</p>
                                        <p className="text-xs mt-0.5">{order.address}, {order.city}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                        Ordered: {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                    <OrderStatusManager orderId={order.id} currentStatus={order.status} />
                                </div>
                            </div>
                            <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/30">
                                <h4 className="text-[10px] font-bold uppercase text-zinc-400 mb-4 tracking-widest px-1">Items Ordered</h4>
                                <ul className="space-y-4">
                                    {order.items.map((item: any) => {
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
                                <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2 px-1">
                                    <div className="flex justify-between items-center text-xs text-zinc-500">
                                        <span>Items Subtotal</span>
                                        <span className="font-bold text-zinc-700 dark:text-zinc-300">PKR {order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)}</span>
                                    </div>

                                    {(() => {
                                        const sub = order.items.reduce((acc: number, it: any) => acc + (it.price * it.quantity), 0);
                                        const delivery = order.totalAmount - (sub - order.discountAmount);
                                        if (delivery > 0) {
                                            return (
                                                <div className="flex justify-between items-center text-xs text-zinc-500">
                                                    <span>Delivery Charges</span>
                                                    <span className="font-bold text-zinc-700 dark:text-zinc-300">PKR {delivery}</span>
                                                </div>
                                            );
                                        }
                                        return null;
                                    })()}

                                    {order.discountAmount > 0 && (
                                        <div className="flex justify-between items-center text-xs font-bold text-blue-600">
                                            <span>Advance Payment Discount</span>
                                            <span>-PKR {order.discountAmount}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center pt-2 mt-1 border-t border-zinc-100 dark:border-zinc-900">
                                        <span className="text-sm text-zinc-900 dark:text-zinc-100 font-bold uppercase tracking-tight">Final Paid Amount</span>
                                        <div className="flex flex-col items-end">
                                            <p className="font-black text-2xl text-primary leading-none">PKR {order.totalAmount}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-widest">{order.paymentMethod === 'ADVANCE' ? 'Paid via Bank/JazzCash' : 'Cash on Delivery'}</p>
                                        </div>
                                    </div>
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

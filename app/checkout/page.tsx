"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingCart, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

interface CheckoutItem {
    id: string; // Product ID
    title: string;
    price: number;
    quantity: number;
    deliveryFee: number;
    weight: number;
    image?: string;
}

export const dynamic = "force-dynamic";

function CheckoutContent() {
    const { data: session, status: sessionStatus } = useSession();
    const searchParams = useSearchParams();
    const { items: cartItems, clearCart } = useCartStore();

    const productIdParam = searchParams.get("product");
    const quantityParam = parseInt(searchParams.get("quantity") || "1");

    const [checkoutItems, setCheckoutItems] = useState<CheckoutItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        city: "",
    });

    // Handle Autofill from Session
    useEffect(() => {
        if (sessionStatus === "authenticated" && session?.user) {
            const name = session.user.name || "";
            const nameParts = name.trim().split(/\s+/);
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            setFormData(prev => ({
                ...prev,
                firstName: prev.firstName || firstName,
                lastName: prev.lastName || lastName,
                phone: prev.phone || session.user.phone || "",
                address: prev.address || session.user.address || "",
                city: prev.city || session.user.city || "",
            }));
        }
    }, [session, sessionStatus]);

    useEffect(() => {
        async function fetchProduct() {
            if (productIdParam) {
                // Direct Buy Mode
                try {
                    const res = await fetch(`/api/products/${productIdParam}`);
                    if (res.ok) {
                        const product = await res.json();
                        let imageUrl = null;
                        try {
                            const images = product.images ? JSON.parse(product.images) : [];
                            if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
                        } catch (e) { }

                        setCheckoutItems([{
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            quantity: quantityParam,
                            deliveryFee: product.deliveryFee || 0,
                            weight: product.weight || 0,
                            image: imageUrl || undefined
                        }]);
                    }
                } catch (e) {
                    console.error(e);
                } finally {
                    setLoading(false);
                }
            } else {
                // Cart Mode
                setCheckoutItems(cartItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    deliveryFee: item.deliveryFee || 0,
                    weight: item.weight || 0,
                    image: item.image
                })));
                setLoading(false);
            }
        }

        fetchProduct();
    }, [productIdParam, quantityParam, cartItems]);

    // Calculations with weight-based delivery fee
    const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Calculate delivery fee based on weight
    const totalDeliveryFee = checkoutItems.reduce((totalFee, item) => {
        const baseDeliveryFee = item.deliveryFee || 0;
        if (baseDeliveryFee === 0) return totalFee; // Free delivery items don't contribute

        const itemWeight = item.weight || 0;
        const totalItemWeight = itemWeight * item.quantity;

        // Logic: Multiply delivery fee for every 1000g exceeded
        // 0-1000g: 1x
        // 1001-2000g: 2x
        // 2001-3000g: 3x
        let multiplier = 1;
        if (totalItemWeight > 1000) {
            multiplier = Math.ceil(totalItemWeight / 1000);
        }

        return totalFee + (baseDeliveryFee * multiplier);
    }, 0);

    const total = subtotal + totalDeliveryFee;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const orderData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            items: checkoutItems.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }))
        };

        try {
            const res = await fetch("/api/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                setSuccess(true);
                // Clear cart if checking out from cart
                if (!productIdParam) {
                    clearCart();
                }
            } else {
                alert("Failed to place order. Please try again.");
            }
        } catch (e) {
            console.error(e);
            alert("An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none p-10 text-center border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-500">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold mb-3 dark:text-white">Order Placed!</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                        Thank you for your order, <span className="font-bold text-zinc-900 dark:text-zinc-200">{formData.firstName}</span>. We successfully received your request and will contact you shortly to confirm.
                    </p>
                    <div className="space-y-3">
                        <Link href="/" className="flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]">
                            Back to Home
                        </Link>
                        {session && (
                            <Link href="/orders" className="flex h-12 items-center justify-center rounded-2xl border border-zinc-200 dark:border-zinc-800 px-8 text-sm font-bold text-zinc-600 dark:text-zinc-300 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                View My Orders
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-5xl">
                <div className="flex items-center justify-between mb-10">
                    <Link href="/shop" className="inline-flex items-center text-sm font-bold text-zinc-500 hover:text-primary transition-colors group">
                        <div className="h-8 w-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mr-3 group-hover:border-primary">
                            <ArrowLeft className="h-4 w-4" />
                        </div>
                        Back to Shop
                    </Link>
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-xs font-bold text-primary uppercase tracking-widest border border-primary/20">
                        <ShoppingCart className="h-3.5 w-3.5" /> Secure Checkout
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Form */}
                    <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold dark:text-white">Shipping Information</h2>
                                    <p className="text-xs text-zinc-500 font-medium">Where should we send your seeds?</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">First Name</label>
                                        <input
                                            required
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black px-4 py-3.5 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-zinc-400 placeholder:font-normal"
                                            placeholder="Enter first name"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Last Name</label>
                                        <input
                                            required
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black px-4 py-3.5 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-zinc-400 placeholder:font-normal"
                                            placeholder="Enter last name"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        placeholder="Enter phone number"
                                        className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black px-4 py-3.5 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-zinc-400 placeholder:font-normal"
                                    />
                                    <p className="text-[10px] text-zinc-400 ml-1 font-medium">We only use this to coordinate your delivery</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Complete Address</label>
                                    <textarea
                                        required
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black px-4 py-3.5 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all resize-none placeholder:text-zinc-400 placeholder:font-normal"
                                        placeholder="Enter address"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">City</label>
                                    <input
                                        required
                                        value={formData.city}
                                        onChange={e => setFormData({ ...formData, city: e.target.value })}
                                        className="w-full rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-black px-4 py-3.5 text-sm font-medium focus:border-primary focus:ring-4 focus:ring-primary/5 focus:outline-none transition-all placeholder:text-zinc-400 placeholder:font-normal"
                                        placeholder="Enter city"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-6 h-14 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>Place Order</>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-zinc-400 font-medium">By placing this order, you agree to our terms and conditions.</p>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:col-span-5 order-1 lg:order-2">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-sm sticky top-28">
                            <h3 className="text-lg font-bold mb-6 flex justify-between items-center">
                                Order Summary
                                <span className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-[10px] text-zinc-500 uppercase tracking-tighter">
                                    {checkoutItems.length} Item{checkoutItems.length !== 1 && 's'}
                                </span>
                            </h3>

                            {loading ? (
                                <div className="animate-pulse space-y-4">
                                    <div className="flex justify-between">
                                        <div className="h-4 w-32 bg-zinc-100 rounded" />
                                        <div className="h-4 w-12 bg-zinc-100 rounded" />
                                    </div>
                                    <div className="h-px bg-zinc-50" />
                                    <div className="flex justify-between">
                                        <div className="h-6 w-16 bg-zinc-100 rounded" />
                                        <div className="h-6 w-24 bg-zinc-100 rounded" />
                                    </div>
                                </div>
                            ) : checkoutItems.length > 0 ? (
                                <div className="space-y-6">
                                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                        {checkoutItems.map((item) => (
                                            <div key={item.id} className="flex gap-4 p-3 bg-zinc-50 dark:bg-black rounded-xl border border-transparent dark:border-zinc-800">
                                                {item.image && (
                                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0">
                                                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.title}</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5 flex justify-between">
                                                        <span>Qty: {item.quantity}</span>
                                                        <span>{formatCurrency(item.price)} each</span>
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold">{formatCurrency(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-3 px-1 pt-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500 font-medium">Subtotal</span>
                                            <span className="font-bold">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-zinc-500 font-medium">Shipping</span>
                                            {totalDeliveryFee > 0 ? (
                                                <span className="font-bold">{formatCurrency(totalDeliveryFee)}</span>
                                            ) : (
                                                <span className="text-green-600 font-bold uppercase text-[10px] tracking-widest bg-green-50 px-1.5 py-0.5 rounded">Free</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex justify-between items-center">
                                        <span className="text-lg font-extrabold">Total Amount</span>
                                        <span className="text-2xl font-black text-primary">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>

                                    <div className="pt-4 bg-primary/5 rounded-2xl p-4 border border-dashed border-primary/20">
                                        <p className="text-[10px] text-primary font-bold uppercase tracking-widest text-center">Guaranteed fresh & high-quality seeds</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-sm text-zinc-500 py-10 text-center">
                                    Your cart is empty.
                                    <div className="mt-4">
                                        <Link href="/shop" className="text-primary hover:underline">Continue Shopping</Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}

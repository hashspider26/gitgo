"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingCart, User as UserIcon, CreditCard, Banknote, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import { trackPurchase, trackBeginCheckout } from "@/lib/analytics";

interface CheckoutItem {
    id: string; // Product ID
    title: string;
    price: number;
    quantity: number;
    deliveryFee: number;
    weight: number;
    image?: string;
    advanceDiscount?: number;
    advanceDiscountType?: string;
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
    const [orderId, setOrderId] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "ADVANCE">("COD");

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
        async function fetchDetails() {
            setLoading(true);
            try {
                if (productIdParam) {
                    // Direct Buy Mode
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
                            image: imageUrl || undefined,
                            advanceDiscount: product.advanceDiscount || 0,
                            advanceDiscountType: product.advanceDiscountType || "PKR"
                        }]);
                    }
                } else {
                    // Cart Mode - We need to fetch full product details to get discounts
                    // A bit inefficient but necessary for accuracy
                    const itemPromises = cartItems.map(async (cartItem) => {
                        const res = await fetch(`/api/products/${cartItem.id}`);
                        if (res.ok) {
                            const p = await res.json();
                            return {
                                id: cartItem.id,
                                title: cartItem.title,
                                price: cartItem.price,
                                quantity: cartItem.quantity,
                                image: cartItem.image,
                                advanceDiscount: p.advanceDiscount || 0,
                                advanceDiscountType: p.advanceDiscountType || "PKR",
                                deliveryFee: p.deliveryFee || 0,
                                weight: p.weight || 0,
                            };
                        }
                        return {
                            ...cartItem,
                            deliveryFee: cartItem.deliveryFee || 0,
                            weight: cartItem.weight || 0
                        };
                    });
                    const fullItems = await Promise.all(itemPromises);
                    setCheckoutItems(fullItems);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }

        fetchDetails();
    }, [productIdParam, quantityParam, cartItems]);


    // Calculations
    const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Calculate delivery fee based on weight
    // Calculate delivery fee based on combined weight
    const totalWeight = checkoutItems.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
    const maxBaseFee = checkoutItems.reduce((max, item) => Math.max(max, item.deliveryFee || 0), 0);

    let surcharge = 0;
    if (totalWeight > 1000) {
        const extraWeight = totalWeight - 1000;
        const extraChunks = Math.ceil(extraWeight / 1000);
        surcharge = extraChunks * 100;
    }
    const totalDeliveryFee = checkoutItems.length > 0 ? maxBaseFee + surcharge : 0;

    // Calculate Advance Payment Discount
    const totalDiscount = checkoutItems.reduce((acc, item) => {
        if (!item.advanceDiscount || item.advanceDiscount <= 0) return acc;

        let itemDiscount = 0;
        if (item.advanceDiscountType === "PERCENT") {
            itemDiscount = (item.price * item.advanceDiscount / 100) * item.quantity;
        } else {
            itemDiscount = item.advanceDiscount * item.quantity;
        }
        return acc + itemDiscount;
    }, 0);

    const discountToApply = paymentMethod === "ADVANCE" ? totalDiscount : 0;
    const total = subtotal + totalDeliveryFee - discountToApply;

    const hasTrackedCheckout = useRef(false);
    useEffect(() => {
        if (!loading && checkoutItems.length > 0 && !hasTrackedCheckout.current) {
            trackBeginCheckout(checkoutItems, total);
            hasTrackedCheckout.current = true;
        }
    }, [loading, checkoutItems.length]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        const orderData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            paymentMethod: paymentMethod,
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
                const data = await res.json();
                setOrderId(data.readableId || data.id);
                setSuccess(true);

                // Tracking
                trackPurchase(
                    data.readableId || data.id,
                    checkoutItems,
                    total
                );

                if (!productIdParam) clearCart();
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
                <div className="max-w-xl w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-xl shadow-zinc-200/50 dark:shadow-none p-8 sm:p-10 text-center border border-zinc-100 dark:border-zinc-800 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-center mb-6">
                        <div className="h-20 w-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-500">
                            <CheckCircle2 className="h-10 w-10" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold mb-2 dark:text-white">Order Placed!</h1>
                    <p className="text-sm font-bold text-primary mb-4">Order ID: #{orderId}</p>

                    {paymentMethod === "ADVANCE" ? (
                        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-6 mb-8 text-left">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" />
                                <h3 className="font-black text-blue-900 dark:text-blue-300 text-center uppercase tracking-tighter">Advance Payment Instructions</h3>
                            </div>
                            <div className="space-y-4 text-sm text-zinc-700 dark:text-zinc-300">
                                <div className="p-3 bg-white dark:bg-black rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <p className="font-bold text-zinc-900 dark:text-white mb-1">Easypaisa</p>
                                    <p>Account Title: <span className="font-semibold">Faisal Raza</span></p>
                                    <p>Account Number: <span className="font-bold text-blue-600 dark:text-blue-400">03081158620</span></p>
                                </div>
                                <div className="p-3 bg-white dark:bg-black rounded-xl border border-blue-100 dark:border-blue-900/30">
                                    <p className="font-bold text-zinc-900 dark:text-white mb-1">MCB Bank</p>
                                    <p>Account Title: <span className="font-semibold">Faisal Raza</span></p>
                                    <p>Account Number: <span className="font-bold text-blue-600 dark:text-blue-400">1343607001010465</span></p>
                                </div>
                                <div className="pt-2">
                                    <p className="leading-relaxed">
                                        Please send <span className="font-bold text-zinc-900 dark:text-white">{formatCurrency(total)}</span> to one of the payment options above.
                                    </p>
                                    <p className="mt-3 font-medium bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg border border-amber-100 dark:border-amber-900/20 text-xs">
                                        <span className="font-black text-amber-600 uppercase block mb-1">Action Required</span>
                                        Send a screenshot of the payment to WhatsApp <span className="font-bold text-zinc-900 dark:text-white">03081158620</span> along with Order ID <span className="font-bold text-primary">#{orderId}</span> to confirm your order.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-zinc-500 dark:text-zinc-400 mb-8 leading-relaxed">
                            Thank you for your order, <span className="font-bold text-zinc-900 dark:text-zinc-200">{formData.firstName}</span>. Your order will be delivered to you via Cash on Delivery. We will contact you shortly to confirm.
                        </p>
                    )}

                    <div className="space-y-3">
                        <Link href="/shop" className="flex h-12 items-center justify-center rounded-2xl bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]">
                            Back to Shop
                        </Link>
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

                                {/* Payment Method Selection */}
                                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1 mb-4 block">Select Payment Method</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("COD")}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === "COD"
                                                ? "bg-primary/5 border-primary ring-2 ring-primary/10"
                                                : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"}`}
                                        >
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${paymentMethod === "COD" ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                                                <Banknote className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold dark:text-white">Cash on Delivery</p>
                                                <p className="text-[10px] text-zinc-500 font-medium">Standard Price</p>
                                            </div>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setPaymentMethod("ADVANCE")}
                                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all relative overflow-hidden ${paymentMethod === "ADVANCE"
                                                ? "bg-primary/5 border-primary ring-2 ring-primary/10"
                                                : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200"}`}
                                        >
                                            {totalDiscount > 0 && (
                                                <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-2.5 py-1 rounded-bl-xl uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                                                    <Sparkles className="h-2.5 w-2.5" /> -{formatCurrency(totalDiscount)} OFF
                                                </div>
                                            )}
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${paymentMethod === "ADVANCE" ? "bg-primary text-white" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"}`}>
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold dark:text-white">Advance Payment</p>
                                                <p className="text-[10px] text-zinc-500 font-medium">{totalDiscount > 0 ? "Discount Included" : "Easypaisa / Bank Transfer"}</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full mt-6 h-14 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-6 w-6 animate-spin" />
                                    ) : (
                                        <>Place Order Now</>
                                    )}
                                </button>
                                <p className="text-[10px] text-center text-zinc-400 font-medium italic">
                                    {paymentMethod === "ADVANCE"
                                        ? `Total to pay: ${formatCurrency(total)} (Discount of ${formatCurrency(totalDiscount ?? 0)} included)`
                                        : "Standard pricing applies for Cash on Delivery."
                                    }
                                </p>
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
                                    <div className="h-10 bg-zinc-100 rounded-xl" />
                                    <div className="h-10 bg-zinc-100 rounded-xl" />
                                    <div className="h-10 bg-zinc-100 rounded-xl" />
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
                                        {paymentMethod === "ADVANCE" && totalDiscount > 0 && (
                                            <div className="flex justify-between text-sm text-blue-600 animate-in slide-in-from-top-1">
                                                <span className="font-medium flex items-center gap-1 italic"><Sparkles className="h-3 w-3" /> Advance Payment Discount</span>
                                                <span className="font-bold">-{formatCurrency(totalDiscount)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 flex justify-between items-center text-primary">
                                        <span className="text-lg font-extrabold">Total Amount</span>
                                        <div className="text-right">
                                            <span className="text-2xl font-black block leading-none">
                                                {formatCurrency(total)}
                                            </span>
                                            {paymentMethod === "ADVANCE" && (
                                                <span className="text-[10px] font-bold uppercase tracking-tighter">Savings included</span>
                                            )}
                                        </div>
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

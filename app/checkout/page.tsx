"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { ArrowLeft, CheckCircle2, Loader2, ShoppingCart, User as UserIcon } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import { trackPurchase } from "@/lib/analytics";

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

import { ShieldCheck, Lock, Clock, ShoppingBag, Truck, Gift, Smartphone, Building } from "lucide-react";

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
    const [confirmedOrderId, setConfirmedOrderId] = useState("");
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
    const [paymentMethod, setPaymentMethod] = useState<"COD" | "ADVANCE">("COD");

    // Simple countdown timer
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Form State
    const [formData, setFormData] = useState({
        fullName: "",
        phone: "",
        address: "",
        city: "",
    });

    useEffect(() => {
        if (sessionStatus === "authenticated" && session?.user) {
            setFormData(prev => ({
                ...prev,
                fullName: prev.fullName || session.user.name || "",
                phone: prev.phone || session.user.phone || "",
                address: prev.address || session.user.address || "",
                city: prev.city || session.user.city || "",
            }));
        }
    }, [session, sessionStatus]);

    useEffect(() => {
        async function fetchProduct() {
            if (productIdParam) {
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
                            image: imageUrl || undefined,
                            advanceDiscount: product.advanceDiscount || 0,
                            advanceDiscountType: product.advanceDiscountType || "PKR"
                        }]);
                    }
                } catch (e) {
                } finally {
                    setLoading(false);
                }
            } else {
                setCheckoutItems(cartItems.map(item => ({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    quantity: item.quantity,
                    deliveryFee: item.deliveryFee || 0,
                    weight: item.weight || 0,
                    image: item.image,
                    advanceDiscount: (item as any).advanceDiscount || 0,
                    advanceDiscountType: (item as any).advanceDiscountType || "PKR"
                })));
                setLoading(false);
            }
        }
        fetchProduct();
    }, [productIdParam, quantityParam, cartItems]);

    const subtotal = checkoutItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    // Delivery: base fee for first 1000g (max of item fees), then +100 PKR per extra 1000g total weight
    const totalWeightGrams = checkoutItems.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
    const maxBaseDeliveryFee = checkoutItems.length === 0 ? 0 : Math.max(...checkoutItems.map(item => item.deliveryFee || 0));
    let deliverySurcharge = 0;
    if (totalWeightGrams > 1000) {
        const extraGrams = totalWeightGrams - 1000;
        deliverySurcharge = Math.ceil(extraGrams / 1000) * 100;
    }
    const totalDeliveryFee = maxBaseDeliveryFee + deliverySurcharge;

    // Calculate advance discount
    let totalDiscount = 0;
    if (paymentMethod === "ADVANCE") {
        totalDiscount = checkoutItems.reduce((acc, item) => {
            let discount = 0;
            if (item.advanceDiscountType === "PERCENT") {
                discount = (item.price * item.quantity * (item.advanceDiscount || 0)) / 100;
            } else {
                discount = (item.advanceDiscount || 0) * item.quantity;
            }
            return acc + discount;
        }, 0);
    }

    const total = subtotal + totalDeliveryFee - totalDiscount;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const orderData = {
            customerName: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            paymentMethod,
            discountAmount: totalDiscount,
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
                const orderId = data.readableId || data.id;
                setConfirmedOrderId(orderId);
                setSuccess(true);
                
                // Track purchase event
                trackPurchase(orderId, checkoutItems, total);
                
                if (!productIdParam) clearCart();
            } else {
                alert("Failed to place order. Please check your details and try again.");
            }
        } catch (e) {
            alert("An error occurred. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white p-4">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-500">
                    <div className="flex justify-center">
                        <div className="h-24 w-24 bg-primary rounded-full flex items-center justify-center text-white shadow-2xl shadow-primary/40 animate-bounce">
                            <CheckCircle2 className="h-12 w-12" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-zinc-900 mb-2 uppercase tracking-tighter italic">Order Confirmed!</h1>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">We're getting your product ready!</p>
                    </div>
                    <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 text-left space-y-4">
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
                            <span>Ship to</span>
                            <span className="text-zinc-900">{formData.fullName}</span>
                        </div>
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest text-zinc-400">
                            <span>Method</span>
                            <span className="text-zinc-900">{paymentMethod === "COD" ? "Cash on Delivery" : "Advance Payment"}</span>
                        </div>
                        <div className="h-px bg-zinc-200" />
                        
                        {paymentMethod === "COD" ? (
                            <p className="text-[10px] text-zinc-400 font-medium italic text-center">
                                A confirmation SMS has been sent to {formData.phone}
                            </p>
                        ) : (
                            <div className="bg-white border border-zinc-200 rounded-2xl p-4 space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-tight text-center border-b border-zinc-100 pb-2 mb-2">Advance Payment Instructions</h3>
                                
                                <div className="space-y-3">
                                    <div className="text-xs">
                                        <p className="font-bold text-zinc-900">Easypaisa</p>
                                        <p className="text-zinc-500">Account Title: <span className="font-medium text-zinc-900">Faisal Raza</span></p>
                                        <p className="text-zinc-500">Account Number: <span className="font-mono font-bold text-zinc-900">03081158620</span></p>
                                    </div>
                                    
                                    <div className="text-xs">
                                        <p className="font-bold text-zinc-900">MCB Bank</p>
                                        <p className="text-zinc-500">Account Title: <span className="font-medium text-zinc-900">Faisal Raza</span></p>
                                        <p className="text-zinc-500">Account Number: <span className="font-mono font-bold text-zinc-900">1343607001010465</span></p>
                                    </div>
                                </div>

                                <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 text-[10px] text-zinc-600 space-y-2">
                                    <p>Please send <span className="font-black text-zinc-900">{formatCurrency(total)}</span> to one of the payment options above.</p>
                                    
                                    <div>
                                        <p className="font-bold text-red-600 uppercase tracking-wider mb-1">Action Required</p>
                                        <p>Send a screenshot of the payment to WhatsApp <span className="font-bold text-zinc-900">03081158620</span> along with Order ID <span className="font-black text-zinc-900">#{confirmedOrderId}</span> to confirm your order.</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <Link href="/" className="flex h-16 w-full items-center justify-center rounded-2xl bg-zinc-900 text-white font-black uppercase tracking-[0.2em] text-xs hover:bg-black transition-all">
                        Return to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Simple Logo Header */}
            <div className="border-b border-zinc-100 italic">
                <div className="mx-auto max-w-5xl h-20 flex items-center justify-center">
                    <Link href="/" className="text-xl font-black uppercase tracking-[0.3em] flex items-center gap-2">
                        Green Valley <span className="text-primary italic">Seeds</span>
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-5xl px-4 py-12">
                {/* Hurrry Up Banner */}
                <div className="mb-10 flex items-center justify-center gap-2 text-red-600 animate-pulse">
                    <Clock className="h-4 w-4" />
                    <span className="text-xs font-black uppercase tracking-widest">Items reserved for you: <span className="font-mono text-base">{formatTime(timeLeft)}</span></span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Main Flow: Forms and Payment (Left in desktop, Top in mobile) */}
                    <div className="lg:col-span-12 xl:col-span-7 space-y-10 order-1">
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-8 w-8 bg-black rounded-xl flex items-center justify-center text-white">
                                    <span className="text-xs font-black">01</span>
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Delivery Details</h2>
                            </div>

                            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                                <input
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Your Full Name"
                                    className="w-full h-14 bg-zinc-50 border-0 rounded-2xl px-6 text-sm font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-primary transition-all"
                                />
                                <input
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="Phone Number (for Courier)"
                                    className="w-full h-14 bg-zinc-50 border-0 rounded-2xl px-6 text-sm font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-primary transition-all"
                                />
                                <input
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="City"
                                    className="w-full h-14 bg-zinc-50 border-0 rounded-2xl px-6 text-sm font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-primary transition-all"
                                />
                                <textarea
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Complete Delivery Address"
                                    rows={3}
                                    className="w-full bg-zinc-50 border-0 rounded-2xl px-6 py-4 text-sm font-bold placeholder:text-zinc-400 focus:ring-2 focus:ring-primary transition-all resize-none"
                                />
                            </form>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="h-8 w-8 bg-black rounded-xl flex items-center justify-center text-white">
                                    <span className="text-xs font-black">02</span>
                                </div>
                                <h2 className="text-xl font-black uppercase tracking-tighter">Payment Mode</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* COD Option */}
                                <div
                                    onClick={() => setPaymentMethod("COD")}
                                    className={`p-4 border transition-all cursor-pointer flex items-center justify-between group rounded-none ${paymentMethod === "COD" ? "border-black bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 flex items-center justify-center transition-colors rounded-none ${paymentMethod === "COD" ? "bg-white text-black border border-zinc-200" : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100"}`}>
                                        
                                            <Smartphone className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold uppercase tracking-wide">Cash on Delivery</p>
                                            <p className="text-[10px] font-medium text-zinc-500">Pay on arrival</p>
                                        </div>
                                    </div>
                                    <div className={`h-5 w-5 rounded-full border-2 transition-all ${paymentMethod === "COD" ? "border-black bg-black" : "border-zinc-300 bg-white"}`} />
                                </div>

                                {/* Advance Payment Option */}
                                <div
                                    onClick={() => setPaymentMethod("ADVANCE")}
                                    className={`p-4 border transition-all cursor-pointer flex items-center justify-between group rounded-none ${paymentMethod === "ADVANCE" ? "border-black bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-300"}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 flex items-center justify-center transition-colors rounded-none ${paymentMethod === "ADVANCE" ? "bg-white text-black border border-zinc-200" : "bg-zinc-50 text-zinc-400 group-hover:bg-zinc-100"}`}>
                                            <Building className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-xs font-bold uppercase tracking-wide">Advance Payment</p>
                                                <span className="bg-green-100 text-green-700 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-none">Save Extra</span>
                                            </div>
                                            <p className="text-[10px] font-medium text-zinc-500">Bank/EasyPaisa</p>
                                        </div>
                                    </div>
                                    <div className={`h-5 w-5 rounded-full border-2 transition-all ${paymentMethod === "ADVANCE" ? "border-black bg-black" : "border-zinc-300 bg-white"}`} />
                                </div>
                            </div>

                            {/* Place Order Button brought here */}
                            <div className="pt-6">
                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={submitting || checkoutItems.length === 0}
                                    className="w-full h-14 bg-black text-white font-bold uppercase tracking-widest text-xs shadow-lg hover:bg-zinc-900 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 rounded-none"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        "Place Order"
                                    )}
                                </button>
                                <p className="mt-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center">By clicking, you agree to our standard terms of sale.</p>
                            </div>
                        </section>
                    </div>

                    {/* Order Summary (Right in desktop, Bottom in mobile) */}
                    <div className="lg:col-span-12 xl:col-span-5 order-2">
                        <div className="bg-zinc-50 p-8 rounded-[40px] sticky top-8">
                            <div className="flex items-center gap-2 mb-8 italic">
                                <ShoppingBag className="h-5 w-5 text-zinc-400" />
                                <h3 className="text-lg font-black uppercase tracking-tighter italic">Order Summary</h3>
                            </div>

                            <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto overflow-x-hidden pr-2 scrollbar-none">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="flex gap-4 items-center animate-pulse">
                                                <div className="h-16 w-16 bg-zinc-200 rounded-2xl flex-shrink-0" />
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-3 w-3/4 bg-zinc-200 rounded" />
                                                    <div className="h-2 w-1/2 bg-zinc-200 rounded" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    checkoutItems.map((item) => (
                                        <div key={item.id} className="flex gap-4 items-center">
                                            <div className="relative h-16 w-16 bg-white rounded-2xl border border-zinc-100 overflow-hidden flex-shrink-0">
                                                {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" />}
                                                <div className="absolute -top-1 -right-1 bg-black text-white h-5 w-5 rounded-full text-[10px] font-black flex items-center justify-center">
                                                    {item.quantity}
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-zinc-900 uppercase tracking-tight leading-none mb-1 truncate">{item.title}</p>
                                                <p className="text-[10px] font-black text-zinc-400">{formatCurrency(item.price)} each</p>
                                            </div>
                                            <p className="text-xs font-black">{formatCurrency(item.price * item.quantity)}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="space-y-3 pt-6 border-t border-zinc-200">
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Subtotal</span>
                                    <span className="text-zinc-900">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-400">
                                    <span>Shipping</span>
                                    {totalDeliveryFee > 0 ? (
                                        <span className="text-zinc-900">{formatCurrency(totalDeliveryFee)}</span>
                                    ) : (
                                        <span className="text-primary tracking-widest bg-primary/10 px-2 py-0.5 rounded-lg active">FREE</span>
                                    )}
                                </div>
                                {totalDiscount > 0 && (
                                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-green-600">
                                        <span>Advance Discount</span>
                                        <span>-{formatCurrency(totalDiscount)}</span>
                                    </div>
                                )}
                                <div className="h-px bg-zinc-200 my-4" />
                                <div className="flex justify-between items-end pb-8">
                                    <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Grand Total</p>
                                    <p className="text-3xl font-black tracking-tighter text-zinc-900 italic leading-none">{formatCurrency(total)}</p>
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                <div className="flex items-center justify-center gap-6">
                                    <ShieldCheck className="h-8 w-8 text-zinc-300" />
                                    <Gift className="h-8 w-8 text-zinc-300" />
                                    <Truck className="h-8 w-8 text-zinc-300" />
                                </div>
                                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest text-center leading-relaxed">
                                    Guaranteed High Quality <br />
                                    Secure Dispatch
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <CheckoutContent />
        </Suspense>
    );
}

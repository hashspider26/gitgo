"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Share2, Check, Shield, ShoppingCart, Minus, Plus, Truck } from "lucide-react";
import { AddToCart } from "@/components/cart/add-to-cart";
import { Button } from "@/components/ui/button";
import { trackBeginCheckout } from "@/lib/analytics";

interface ProductActionsProps {
    product: {
        id: string;
        title: string;
        price: number;
        image?: string;
        slug: string;
        stock: number;
        weight?: number;
        deliveryFee?: number;
        advanceDiscount?: number;
        advanceDiscountType?: string;
    };
}

export function ProductActions({ product }: ProductActionsProps) {
    const stock = product.stock;
    const router = useRouter();
    const [shared, setShared] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const maxQty = Math.max(1, stock);
    const safeQuantity = Math.min(Math.max(1, quantity), maxQty);

    useEffect(() => {
        if (quantity > maxQty) setQuantity(maxQty);
    }, [stock, maxQty, quantity]);

    // Delivery: base fee for first 1000g, then +100 PKR per extra 1000g
    const totalWeightGrams = (product.weight || 0) * safeQuantity;
    const baseFee = product.deliveryFee || 0;
    let surcharge = 0;
    if (totalWeightGrams > 1000) {
        surcharge = Math.ceil((totalWeightGrams - 1000) / 1000) * 100;
    }
    const deliveryFeeForQuantity = baseFee + surcharge;

    const handleBuyNow = () => {
        const qty = safeQuantity;
        trackBeginCheckout([{
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: qty,
            image: product.image
        }], product.price * qty + deliveryFeeForQuantity);

        router.push(`/checkout?product=${product.id}&quantity=${qty}`);
    };

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: product.title,
            text: `Check out ${product.title} on Green Valley Seeds`,
            url: url,
        };

        try {
            // Try Web Share API first (works on mobile and modern browsers)
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                setShared(true);
                setTimeout(() => setShared(false), 2000);
            } else if (navigator.clipboard && navigator.clipboard.writeText) {
                // Fallback to clipboard
                await navigator.clipboard.writeText(url);
                setShared(true);
                setTimeout(() => setShared(false), 2000);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = url;
                textArea.style.position = "fixed";
                textArea.style.left = "-999999px";
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    setShared(true);
                    setTimeout(() => setShared(false), 2000);
                } catch (err) {
                    console.error('Failed to copy:', err);
                    alert('Failed to copy link. Please copy manually: ' + url);
                }
                document.body.removeChild(textArea);
            }
        } catch (error: any) {
            // User cancelled share dialog or error occurred
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
                // Try clipboard as fallback
                try {
                    if (navigator.clipboard) {
                        await navigator.clipboard.writeText(url);
                        setShared(true);
                        setTimeout(() => setShared(false), 2000);
                    }
                } catch (clipboardError) {
                    console.error('Clipboard error:', clipboardError);
                }
            }
        }
    };

    const [displayStock, setDisplayStock] = useState(stock + 1);
    const [isHovered, setIsHovered] = useState(false);
    const [showBuyerText, setShowBuyerText] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isHovered && displayStock > stock) {
                    setIsHovered(true);
                    setTimeout(() => {
                        setDisplayStock(stock);
                        setShowBuyerText(true);
                        setTimeout(() => setShowBuyerText(false), 3000); // Hide text after 3s
                    }, 1500); // Delay for realism
                }
            },
            { threshold: 0.5 }
        );

        const element = document.getElementById("stock-display");
        if (element) observer.observe(element);

        return () => observer.disconnect();
    }, [isHovered, displayStock, stock]);

    function formatPrice(amount: number) {
        return new Intl.NumberFormat("en-PK", { style: "currency", currency: "PKR", minimumFractionDigits: 0 }).format(amount);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6">
                {/* Delivery - updates with quantity (first 1000g = base, +100 per extra 1000g) */}
                <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                        <Truck className="h-4 w-4 text-primary" />
                        <span>
                            {deliveryFeeForQuantity === 0
                                ? "Free Delivery"
                                : `Delivery Charges: ${formatPrice(deliveryFeeForQuantity)}`}
                            {surcharge > 0 && (
                                <span className="text-zinc-400 font-normal ml-1">
                                    (base {formatPrice(baseFee)} + {formatPrice(surcharge)} for weight)
                                </span>
                            )}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                        <Shield className="h-3 w-3 text-primary" />
                        <span>Safe & Secure Cash on Delivery</span>
                    </div>
                </div>

                {/* Stock Status - Shopify style with FOMO */}
                {stock > 0 ? (
                    <div id="stock-display" className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 animate-in fade-in duration-700">
                            <div className="relative">
                                <div className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping absolute opacity-75" />
                                <div className="h-2.5 w-2.5 rounded-full bg-orange-500 relative" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 transition-all duration-500">
                                In Stock ({displayStock} units left)
                            </span>
                        </div>
                        {showBuyerText && (
                            <p className="text-[9px] text-zinc-400 italic animate-in fade-in slide-in-from-top-1 pl-5">
                                Someone just bought this item
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-red-600">Sold Out</span>
                    </div>
                )}

                {stock > 0 && (
                    <div className="flex flex-col gap-3">
                        {/* Quantity selector */}
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Quantity</span>
                            <div className="flex items-center rounded-none border border-zinc-200 bg-zinc-50 overflow-hidden">
                                <button
                                    type="button"
                                    aria-label="Decrease quantity"
                                    className="h-11 w-11 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-r border-zinc-200"
                                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                                    disabled={safeQuantity <= 1}
                                >
                                    <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-12 text-center font-black text-sm tabular-nums">{safeQuantity}</span>
                                <button
                                    type="button"
                                    aria-label="Increase quantity"
                                    className="h-11 w-11 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed border-l border-zinc-200"
                                    onClick={() => setQuantity((q) => Math.min(Math.max(1, stock), q + 1))}
                                    disabled={safeQuantity >= Math.max(1, stock)}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleBuyNow}
                            disabled={stock <= 0}
                            className="w-full h-12 rounded-none bg-black text-white font-bold shadow-lg hover:bg-zinc-900 transition-all active:scale-[0.98]"
                        >
                            {stock <= 0 ? (
                                "Out of Stock"
                            ) : (
                                <>
                                    <ShoppingCart className="mr-2 h-5 w-5" />
                                    Buy Now
                                </>
                            )}
                        </Button>

                        <AddToCart
                            product={product}
                            showQuantitySelector={false}
                            quantityProp={safeQuantity}
                            className="w-full h-12 rounded-none border border-black bg-white text-black hover:bg-zinc-50 transition-all font-bold"
                            variant="outline"
                            hideIcon={true}
                            stock={product.stock}
                        />

                        <div className="flex justify-center mt-2">
                            <button
                                className={`flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors ${shared ? "text-green-600" : ""}`}
                                onClick={handleShare}
                            >
                                {shared ? (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Link Copied
                                    </>
                                ) : (
                                    <>
                                        <Share2 className="h-4 w-4" />
                                        Share this product
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Psychological scarcity/trust near buttons */}
            <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-tighter text-zinc-400">
                    <Shield className="h-3 w-3" /> 100% Genuine Seeds
                </div>
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-tighter text-zinc-400">
                    <Check className="h-3 w-3" /> Hand Picked Quality
                </div>
            </div>
        </div>
    );
}

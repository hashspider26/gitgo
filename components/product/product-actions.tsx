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
        variations?: {
            id: string;
            title: string;
            price: number;
            originalPrice: number | null;
            discountLabel: string | null;
            stock: number;
            deliveryFee?: number;
        }[];
    };
}

export function ProductActions({ product }: ProductActionsProps) {
    const stock = product.stock;
    const router = useRouter();
    const [shared, setShared] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const maxQty = Math.max(1, stock);
    const safeQuantity = Math.min(Math.max(1, quantity), maxQty);

    // Deals state
    const deals = product.variations || [];
    const hasDeals = deals.length > 0;
    const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

    const activeDeal = deals.find(d => d.id === selectedDealId);
    const currentPrice = activeDeal ? activeDeal.price : product.price;
    const currentTitle = activeDeal ? activeDeal.title : product.title;
    const currentStock = activeDeal ? activeDeal.stock : product.stock;

    useEffect(() => {
        if (quantity > maxQty) setQuantity(maxQty);
    }, [stock, maxQty, quantity]);

    // Delivery: if a deal is selected and it has its own deliveryFee, use that.
    // Otherwise fall back to weight-based calculation on the product-level fee.
    const baseFee = activeDeal?.deliveryFee !== undefined && activeDeal.deliveryFee >= 0
        ? activeDeal.deliveryFee
        : (product.deliveryFee || 0);
    const totalWeightGrams = activeDeal ? 0 : (product.weight || 0) * safeQuantity; // weight surcharge only applies without deal
    let surcharge = 0;
    if (!activeDeal && totalWeightGrams > 1000) {
        surcharge = Math.ceil((totalWeightGrams - 1000) / 1000) * 100;
    }
    const deliveryFeeForQuantity = baseFee + surcharge;

    const handleBuyNow = () => {
        const qty = safeQuantity;
        trackBeginCheckout([{
            id: product.id,
            title: product.title,
            price: currentPrice,
            quantity: qty,
            image: product.image
        }], currentPrice * qty + deliveryFeeForQuantity);

        let url = `/checkout?product=${product.id}&quantity=${qty}`;
        if (selectedDealId) {
            url += `&variationId=${selectedDealId}`;
        }
        router.push(url);
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

    // Build the product object for AddToCart
    const cartProduct = {
        ...product,
        price: currentPrice,
        stock: currentStock,
        deliveryFee: activeDeal?.deliveryFee !== undefined ? activeDeal.deliveryFee : product.deliveryFee,
        variationId: activeDeal?.id,
        variationTitle: activeDeal?.title
    };

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
                        {/* Best Deals UI */}
                        {hasDeals && (
                            <div className="mb-4">
                                <div className="relative flex items-center justify-center mb-4">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-zinc-200"></div>
                                    </div>
                                    <div className="relative bg-white px-4 text-sm text-zinc-500">
                                        Best deals
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {deals.map((deal, idx) => {
                                        const isSelected = selectedDealId === deal.id;
                                        return (
                                            <div
                                                key={deal.id}
                                                onClick={() => setSelectedDealId(isSelected ? null : deal.id)}
                                                className={`flex items-center justify-between p-4 cursor-pointer transition-all rounded-lg border ${isSelected ? 'border-[1.5px] border-black bg-white' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`flex items-center justify-center w-5 h-5 rounded-full border ${isSelected ? 'border-[5px] border-black bg-white' : 'border-zinc-300 bg-white'}`}>
                                                    </div>
                                                    <div>
                                                        <p className="text-[15px] font-medium text-zinc-900 leading-tight">{deal.title}</p>
                                                        {deal.discountLabel && (
                                                            <p className="text-xs text-zinc-500 uppercase mt-0.5">{deal.discountLabel}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[15px] font-medium text-zinc-900 leading-tight">{formatPrice(deal.price)}</p>
                                                    {deal.originalPrice && deal.originalPrice > deal.price && (
                                                        <p className="text-xs text-zinc-400 line-through mt-0.5">{formatPrice(deal.originalPrice)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <p className="text-sm font-bold text-zinc-900">Total: {formatPrice(currentPrice * safeQuantity)}</p>
                                </div>
                            </div>
                        )}

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
                            product={cartProduct}
                            showQuantitySelector={false}
                            quantityProp={safeQuantity}
                            className="w-full h-12 rounded-none border border-black bg-white text-black hover:bg-zinc-50 transition-all font-bold"
                            variant="outline"
                            hideIcon={true}
                            stock={currentStock}
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

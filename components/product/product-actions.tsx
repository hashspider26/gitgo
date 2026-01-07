"use client";

import { useState } from "react";
import { Share2, Check, Minus, Plus, Truck, Shield } from "lucide-react";
import Link from "next/link";
import { AddToCart } from "@/components/cart/add-to-cart";
import { Button } from "@/components/ui/button";

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
    };
}

export function ProductActions({ product }: ProductActionsProps) {
    const stock = product.stock;
    const [quantity, setQuantity] = useState(1);
    const [shared, setShared] = useState(false);

    const handleShare = async () => {
        const url = window.location.href;
        const shareData = {
            title: product.title,
            text: `Check out ${product.title} on Green Valley Seeds`,
            url: url,
        };

        try {
            if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
                await navigator.share(shareData);
                setShared(true);
                setTimeout(() => setShared(false), 2000);
            } else {
                await navigator.clipboard.writeText(url);
                setShared(true);
                setTimeout(() => setShared(false), 2000);
            }
        } catch (error: any) {
            if (error.name !== 'AbortError') {
                console.error('Error sharing:', error);
            }
        }
    };

    const baseDeliveryFee = product.deliveryFee || 0;
    const weight = product.weight || 0;
    const currentDeliveryFee = baseDeliveryFee === 0 ? 0 : baseDeliveryFee + (Math.max(0, Math.ceil((weight * quantity) / 1000) - 1) * 100);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-5">
                {/* Delivery Fee Status */}
                <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800 mb-2">
                    <div className="h-10 w-10 bg-white dark:bg-black rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-green-600">
                        <Truck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">
                            {currentDeliveryFee === 0 ? "Free Delivery" : `Delivery Fee: Rs ${currentDeliveryFee}`}
                        </p>
                        <p className="text-xs text-zinc-500">Standard delivery charges apply</p>
                    </div>
                </div>

                {/* Cash on Delivery Badge */}
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-800/30">
                    <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300">Cash on Delivery Available</span>
                </div>

                {/* Stock Status */}
                {stock > 0 ? (
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-medium text-green-600 dark:text-green-400">In Stock ({stock} available)</span>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                        <span className="text-sm font-medium text-red-600 dark:text-red-400">Out of Stock</span>
                    </div>
                )}

                {/* Actions Grid */}
                <div className="flex flex-col gap-4">
                    {stock > 0 ? (
                        <>
                            {/* Row 1: Quantity and Share button */}
                            <div className="flex items-center gap-3">
                                {/* Quantity Selector */}
                                <div className="flex items-center h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex-1 sm:flex-none">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-l-xl hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="w-12 text-center font-bold text-base">{quantity}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-12 w-12 rounded-r-xl hover:bg-zinc-200 dark:hover:bg-zinc-800"
                                        onClick={() => setQuantity(quantity + 1)}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Share Button */}
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={`h-12 w-12 flex-shrink-0 rounded-xl transition-all ${shared ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : "bg-white dark:bg-zinc-900"
                                        }`}
                                    onClick={handleShare}
                                >
                                    {shared ? <Check className="h-5 w-5 text-green-600" /> : <Share2 className="h-5 w-5" />}
                                </Button>
                            </div>

                            {/* Row 2: Buy Now and Add to Cart */}
                            <div className="flex flex-row gap-3">
                                <Link
                                    href={`/checkout?product=${product.id}&quantity=${quantity}`}
                                    className="flex-1 h-12 rounded-xl bg-green-600 text-white font-bold flex items-center justify-center hover:bg-green-700 transition-all shadow-lg shadow-green-600/20 text-sm sm:text-base border border-green-500"
                                >
                                    Buy Now
                                </Link>
                                <div className="flex-1">
                                    <AddToCart
                                        product={product}
                                        quantity={quantity}
                                        size="default"
                                        variant="default"
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-600/20 text-sm border-none"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <Button disabled className="w-full h-14 bg-zinc-100 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 font-bold rounded-xl border border-zinc-200 dark:border-zinc-800">
                            Out of Stock
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

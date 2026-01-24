"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Share2, Check, ShoppingCart, Zap } from "lucide-react";
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
    };
}

export function ProductActions({ product }: ProductActionsProps) {
    const stock = product.stock;
    const router = useRouter();
    const [shared, setShared] = useState(false);

    const handleBuyNow = () => {
        // Track begin checkout event
        trackBeginCheckout([{
            id: product.id,
            title: product.title,
            price: product.price,
            quantity: 1,
            image: product.image
        }], product.price + (product.deliveryFee || 0));

        // Redirect to checkout with product
        router.push(`/checkout?product=${product.id}&quantity=1`);
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

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-6">
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

                {stock > 0 && (
                    <div className="flex gap-3 items-center">
                        {/* Buy Now Button - Primary Action */}
                        <Button
                            onClick={handleBuyNow}
                            className="flex-1 h-10 text-sm font-semibold shadow-lg shadow-primary/20"
                        >
                            <Zap className="mr-2 h-4 w-4" />
                            Buy Now
                        </Button>

                        {/* Add to Cart - Icon Only */}
                        <AddToCart
                            product={product}
                            size="icon"
                            className="h-10 w-10 rounded-lg shrink-0"
                        />

                        {/* Share - Icon Only */}
                        <Button
                            variant="outline"
                            size="icon"
                            className={`h-10 w-10 rounded-lg transition-colors shrink-0 ${
                                shared ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" : ""
                            }`}
                            aria-label={shared ? "Link copied!" : "Share product"}
                            onClick={handleShare}
                        >
                            {shared ? (
                                <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                                <Share2 className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

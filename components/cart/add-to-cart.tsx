"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Loader2, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";

import { useRouter } from "next/navigation";

interface AddToCartProps {
    product: {
        id: string;
        title: string;
        price: number;
        image?: string;
        slug: string;
        deliveryFee?: number;
        weight?: number;
    };
    showQuantitySelector?: boolean;
    className?: string;
    variant?: "default" | "outline" | "ghost" | "buy-now";
    size?: "default" | "sm" | "lg" | "icon";
    isBuyNow?: boolean;
    hideIcon?: boolean;
}

export function AddToCart({
    product,
    showQuantitySelector = false,
    className,
    variant = "default",
    size = "default",
    isBuyNow = false,
    hideIcon = false
}: AddToCartProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const addItem = useCartStore((state) => state.addItem);
    const router = useRouter();

    const handleAction = async () => {
        setIsAdding(true);
        addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            slug: product.slug,
            quantity: quantity,
            deliveryFee: product.deliveryFee,
            weight: product.weight
        });

        // Track add to cart event
        trackAddToCart({
            id: product.id,
            title: product.title,
            price: product.price
        }, quantity);

        if (isBuyNow) {
            router.push('/checkout');
        } else {
            // small feedback delay
            await new Promise(resolve => setTimeout(resolve, 500));
            setIsAdding(false);
        }
    };

    if (showQuantitySelector) {
        return (
            <div className={cn("flex flex-col gap-4", className)}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-2xl border border-zinc-200 bg-zinc-50 overflow-hidden">
                        <button
                            className="h-12 w-12 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1 || isAdding}
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center font-black text-sm">{quantity}</span>
                        <button
                            className="h-12 w-12 flex items-center justify-center hover:bg-zinc-100 transition-colors disabled:opacity-30"
                            onClick={() => setQuantity(quantity + 1)}
                            disabled={isAdding}
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>

                    <Button
                        onClick={handleAction}
                        disabled={isAdding}
                        className="flex-1 h-12 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-black/5 hover:scale-[1.02] active:scale-95 transition-all"
                        variant="outline"
                    >
                        {isAdding && !isBuyNow ? (
                            <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                <span className="text-green-600">Added!</span>
                            </div>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </>
                        )}
                    </Button>
                </div>

                <Button
                    onClick={() => {
                        isBuyNow = true;
                        handleAction();
                    }}
                    disabled={isAdding}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[13px] bg-red-600 hover:bg-red-700 text-white shadow-xl shadow-red-600/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                    {isAdding && isBuyNow ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        "Buy It Now"
                    )}
                </Button>
            </div>
        )
    }

    return (
        <Button
            onClick={(e) => {
                e.preventDefault();
                handleAction();
            }}
            disabled={isAdding}
            className={cn("rounded-xl font-bold transition-all active:scale-95", className)}
            variant={variant === "buy-now" ? "default" : variant}
            size={size}
        >
            {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    {!hideIcon && <ShoppingCart className={cn("h-4 w-4", size !== "icon" && "mr-2")} />}
                    {size !== "icon" && (isBuyNow ? "Quick Buy" : "Add to Cart")}
                </>
            )}
        </Button>
    );
}

"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

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
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

export function AddToCart({
    product,
    showQuantitySelector = false,
    className,
    variant = "default",
    size = "default"
}: AddToCartProps) {
    const [quantity, setQuantity] = useState(1);
    const [isAdding, setIsAdding] = useState(false);
    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = async () => {
        setIsAdding(true);
        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 300));

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
        setIsAdding(false);
        setQuantity(1); // reset quantity after adding
    };

    if (showQuantitySelector) {
        return (
            <div className={cn("flex flex-col gap-3", className)}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-l-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            disabled={quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-medium">{quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-r-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    <Button
                        onClick={handleAddToCart}
                        disabled={isAdding}
                        className="flex-1 h-10"
                        size={size}
                        variant={variant}
                    >
                        {isAdding ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                            </>
                        )}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Button
            onClick={(e) => {
                e.preventDefault(); // prevent link navigation if inside a card
                handleAddToCart();
            }}
            disabled={isAdding}
            className={cn("", className)}
            variant={variant}
            size={size}
        >
            {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <>
                    <ShoppingCart className={cn("h-4 w-4", size !== "icon" && "mr-2")} />
                    {size !== "icon" && "Add"}
                </>
            )}
        </Button>
    );
}

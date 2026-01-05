"use client";

import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCartStore, type CartItem as CartItemType } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

interface CartItemProps {
    item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
    const { updateQuantity, removeItem } = useCartStore();

    return (
        <div className="flex gap-4 py-4">
            <div className="relative aspect-square h-20 w-20 min-w-20 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                        <span className="text-xs text-zinc-400">No image</span>
                    </div>
                )}
            </div>
            <div className="flex flex-1 flex-col justify-between gap-1">
                <div>
                    <h4 className="text-sm font-medium line-clamp-2 leading-tight">
                        {item.title}
                    </h4>
                    <p className="mt-1 text-sm font-semibold text-primary">
                        {formatCurrency(item.price)}
                    </p>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-md border border-zinc-200 dark:border-zinc-800 p-0.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                            <Minus className="h-3 w-3" />
                            <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center text-xs tabular-nums">{item.quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                            <Plus className="h-3 w-3" />
                            <span className="sr-only">Increase quantity</span>
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Remove item</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}

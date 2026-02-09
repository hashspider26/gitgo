"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";
import { CartItem } from "./cart-item";

export function CartSheet() {
    const { items, getTotalPrice, isOpen, setIsOpen } = useCartStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    if (!isClient) {
        return (
            <Button variant="ghost" size="icon" className="relative text-zinc-700 dark:text-zinc-200">
                <ShoppingCart className="h-5 w-5" />
            </Button>
        )
    }

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-zinc-950">
                            {itemCount}
                        </span>
                    )}
                    <span className="sr-only">Open cart</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex w-full flex-col pr-0 sm:max-w-md">
                <SheetHeader className="px-1 text-left">
                    <SheetTitle>My Cart ({itemCount})</SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto pr-6 -mr-6 pl-1">
                    <div className="pr-6">
                        {items.length === 0 ? (
                            <div className="flex h-[50vh] flex-col items-center justify-center space-y-4 text-center">
                                <div className="rounded-full bg-zinc-100 p-6 dark:bg-zinc-800">
                                    <ShoppingCart className="h-10 w-10 text-zinc-400" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Your cart is empty</h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Looks like you haven&apos;t added anything yet.</p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    className="mt-4"
                                >
                                    Continue Shopping
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                {items.map((item) => (
                                    <CartItem key={item.id} item={item} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {items.length > 0 && (
                    <div className="pr-6 pt-6 pb-6 bg-background">
                        <div className="space-y-3 pb-6 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatCurrency(getTotalPrice())}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>Calculated at checkout</span>
                            </div>
                            <div className="flex justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
                                <span className="font-semibold">Total</span>
                                <span className="font-semibold">{formatCurrency(getTotalPrice())}</span>
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
                                Shipping, taxes, and discounts calculated at checkout.
                            </div>
                        </div>

                        <SheetFooter>
                            <Link href="/checkout" className="w-full" onClick={() => setIsOpen(false)}>
                                <Button className="w-full text-base font-semibold py-6 shadow-lg shadow-primary/20" size="lg">
                                    Checkout
                                </Button>
                            </Link>
                        </SheetFooter>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

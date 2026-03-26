"use client";

import { useState } from "react";
import { Power, PowerOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface StockToggleButtonProps {
    productId: string;
    currentStock: number;
}

export function StockToggleButton({ productId, currentStock }: StockToggleButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const isOutOfStock = currentStock <= 0;

    const toggleStock = async () => {
        setLoading(true);
        try {
            // Fetch current product data first to ensure we don't overwrite other fields
            const getRes = await fetch(`/api/products/${productId}`);
            if (!getRes.ok) throw new Error("Failed to fetch product");
            const product = await getRes.json();

            // Set stock to 0 if currently in stock, or to a default (e.g. 100) if out of stock
            const newStock = isOutOfStock ? 100 : 0;

            const res = await fetch(`/api/products/${productId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...product,
                    stock: newStock,
                    images: product.images ? JSON.parse(product.images) : [], // PUT expects images as array
                }),
            });

            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to update stock status");
            }
        } catch (error) {
            console.error("Error toggling stock:", error);
            alert("An error occurred while updating stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleStock}
            disabled={loading}
            className={`p-2 rounded transition-colors ${isOutOfStock
                    ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    : "text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
                }`}
            title={isOutOfStock ? "Mark as In Stock" : "Mark as Out of Stock"}
        >
            {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : isOutOfStock ? (
                <PowerOff className="h-4 w-4" />
            ) : (
                <Power className="h-4 w-4" />
            )}
        </button>
    );
}

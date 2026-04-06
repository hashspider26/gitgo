"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, Sprout, GripVertical, Loader2 } from "lucide-react";
import { Reorder, useDragControls } from "framer-motion";
import { StockToggleButton } from "./stock-toggle-button";
import { DeleteProductButton } from "./delete-product-button";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    stock: number;
    images: string;
    position: number;
    productId?: string;
}

export function ProductList({ initialProducts }: { initialProducts: Product[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [isReordering, setIsReordering] = useState(false);
    const router = useRouter();

    async function handleReorder(newOrder: Product[]) {
        setProducts(newOrder);
        setIsReordering(true);
        try {
            const res = await fetch("/api/products/reorder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productIds: newOrder.map((p) => p.id),
                }),
            });

            if (!res.ok) {
                console.error("Failed to update order");
                // Optionally revert state if failed
            } else {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsReordering(false);
        }
    }

    if (products.length === 0) {
        return (
            <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-12 text-center text-zinc-500">
                <div className="flex flex-col items-center gap-2">
                    <Sprout className="h-8 w-8 text-zinc-300" />
                    <p>No products found. Add your first product!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto relative">
            {isReordering && (
                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-10 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 px-4 py-2 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-800">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span className="text-sm font-medium text-zinc-900 dark:text-white">Saving order...</span>
                    </div>
                </div>
            )}
            <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                    <tr>
                        <th className="px-1 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white w-8 sm:w-12 text-center">Order</th>
                        <th className="px-1 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white w-10 sm:w-20">Image</th>
                        <th className="px-1 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white">Title</th>
                        <th className="px-1 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white">Price</th>
                        <th className="hidden md:table-cell px-6 py-4 font-medium text-zinc-900 dark:text-white">Category</th>
                        <th className="hidden sm:table-cell px-6 py-4 font-medium text-zinc-900 dark:text-white">Stock</th>
                        <th className="px-1 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white text-right">Actions</th>
                    </tr>
                </thead>
                <Reorder.Group values={products} onReorder={handleReorder} as="tbody" className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {products.map((product) => (
                        <ProductRow key={product.id} product={product} />
                    ))}
                </Reorder.Group>
            </table>
        </div>
    );
}

function ProductRow({ product }: { product: Product }) {
    const controls = useDragControls();

    let imageUrl = null;
    try {
        const images = product.images ? JSON.parse(product.images) : [];
        if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
    } catch (e) { }

    return (
        <Reorder.Item
            value={product}
            id={product.id}
            as="tr"
            dragListener={false}
            dragControls={controls}
            whileDrag={{ 
                backgroundColor: "rgba(0,0,0,0.05)",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
            }}
            className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors bg-white dark:bg-black touch-none relative z-0"
            style={{ display: "table-row" }}
        >
            <td className="px-1 py-3 sm:px-6 sm:py-4 text-center">
                <div 
                    onPointerDown={(e) => controls.start(e)}
                    className="cursor-grab active:cursor-grabbing p-1 inline-flex text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                >
                    <GripVertical className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
            </td>
            <td className="px-1 py-3 sm:px-6 sm:py-4">
                <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                    {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={imageUrl} alt={product.title} className="object-cover h-full w-full" />
                    ) : (
                        <Sprout className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-300" />
                    )}
                </div>
            </td>
            <td className="px-1 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white text-[10px] sm:text-sm max-w-[80px] sm:max-w-none truncate sm:whitespace-normal">
                {product.title}
            </td>
            <td className="px-1 py-3 sm:px-6 sm:py-4 text-zinc-600 dark:text-zinc-400 text-[10px] sm:text-sm whitespace-nowrap">
                <span className="hidden sm:inline">PKR </span>{product.price}
            </td>
            <td className="hidden md:table-cell px-6 py-4 text-zinc-600 dark:text-zinc-400">{product.category}</td>
            <td className="hidden sm:table-cell px-6 py-4 text-zinc-600 dark:text-zinc-400">{product.stock}</td>
            <td className="px-1 py-3 sm:px-6 sm:py-4 text-right">
                <div className="flex items-center justify-end gap-0 sm:gap-1">
                    <StockToggleButton productId={product.productId || product.id} currentStock={product.stock} />
                    <Link
                        href={`/admin/dashboard/products/edit/${product.id}`}
                        className="p-1 sm:p-2 hover:bg-zinc-100 rounded text-zinc-500 hover:text-primary dark:hover:bg-zinc-800 transition-colors"
                        title="Edit product"
                    >
                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Link>
                    <DeleteProductButton productId={product.id} />
                </div>
            </td>
        </Reorder.Item>
    );
}

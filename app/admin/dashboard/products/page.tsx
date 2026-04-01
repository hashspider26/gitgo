import Link from "next/link";
import { Plus, Edit, Sprout } from "lucide-react";
import { DeleteProductButton } from "@/components/admin/delete-product-button";
import { prisma } from "@/lib/prisma";
import { StockToggleButton } from "@/components/admin/stock-toggle-button";

export const revalidate = 0;

export default async function ProductsDashboard() {
    const products = await prisma.product.findMany({
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-4 sm:p-6">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Products</h1>
                    <Link href="/admin/dashboard/products/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Add New Product
                    </Link>
                </div>

                <div className="bg-white dark:bg-black rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                                <th className="px-2 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white w-14 sm:w-20">Image</th>
                                <th className="px-2 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white">Title</th>
                                <th className="px-2 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white">Price</th>
                                <th className="hidden md:table-cell px-6 py-4 font-medium text-zinc-900 dark:text-white">Category</th>
                                <th className="hidden sm:table-cell px-6 py-4 font-medium text-zinc-900 dark:text-white">Stock</th>
                                <th className="px-2 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {products.map((product: any) => {
                                let imageUrl = null;
                                try {
                                    const images = product.images ? JSON.parse(product.images) : [];
                                    if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
                                } catch (e) { }

                                return (
                                    <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                        <td className="px-2 py-3 sm:px-6 sm:py-4">
                                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                                                {imageUrl ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={imageUrl} alt={product.title} className="object-cover h-full w-full" />
                                                ) : (
                                                    <Sprout className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-300" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-2 py-3 sm:px-6 sm:py-4 font-medium text-zinc-900 dark:text-white text-xs sm:text-sm max-w-[120px] sm:max-w-none truncate sm:whitespace-normal">
                                            {product.title}
                                        </td>
                                        <td className="px-2 py-3 sm:px-6 sm:py-4 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm whitespace-nowrap">
                                            <span className="hidden sm:inline">PKR </span>{product.price}
                                        </td>
                                        <td className="hidden md:table-cell px-6 py-4 text-zinc-600 dark:text-zinc-400">{product.category}</td>
                                        <td className="hidden sm:table-cell px-6 py-4 text-zinc-600 dark:text-zinc-400">{product.stock}</td>
                                        <td className="px-2 py-3 sm:px-6 sm:py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <StockToggleButton productId={product.id} currentStock={product.stock} />
                                                <Link
                                                    href={`/admin/dashboard/products/edit/${product.id}`}
                                                    className="p-2 hover:bg-zinc-100 rounded text-zinc-500 hover:text-primary dark:hover:bg-zinc-800 transition-colors"
                                                    title="Edit product"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                                <DeleteProductButton productId={product.id} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <Sprout className="h-8 w-8 text-zinc-300" />
                                            <p>No products found. Add your first product!</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

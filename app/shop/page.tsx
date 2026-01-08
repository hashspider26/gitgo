import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Search, Sprout, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/product-card";
import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/shared/loading-skeletons";

// Helper for formatting currency
function formatPrice(amount: number) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export const revalidate = 0;

export default async function ShopPage({
    searchParams,
}: {
    searchParams: { category?: string; sort?: string; page?: string };
}) {
    const category = searchParams.category;
    const page = Number(searchParams.page) || 1;
    const pageSize = 12;
    const skip = (page - 1) * pageSize;

    const [products, totalProducts, categoryDocs] = await Promise.all([
        prisma.product.findMany({
            where: category ? { category } : undefined,
            orderBy: { createdAt: 'desc' },
            skip,
            take: pageSize,
        }),
        prisma.product.count({
            where: category ? { category } : undefined,
        }),
        prisma.category.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    const totalPages = Math.ceil(totalProducts / pageSize);

    const categories = categoryDocs.map((c: any) => c.name);

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 py-8 px-4">
                <div className="mx-auto max-w-6xl">
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Shop</h1>
                    <p className="text-zinc-500 mt-2">Browse our collection of seeds and tools.</p>
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 mt-8 flex flex-col md:flex-row gap-8">

                {/* Categories: Horizontal scroll on mobile, Sidebar on desktop */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 hidden md:block">Categories</h3>

                        {/* Mobile: Horizontal Scroll */}
                        <div className="md:hidden mb-6 -mx-4 px-4">
                            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                                <Link
                                    href="/shop"
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${!category
                                        ? "bg-primary text-white border-primary"
                                        : "bg-white text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"}`}
                                >
                                    All
                                </Link>
                                {categories.map((c: string) => (
                                    <Link
                                        key={c}
                                        href={`/shop?category=${encodeURIComponent(c)}`}
                                        className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium border transition-colors ${category === c
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300"}`}
                                    >
                                        {c}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Desktop: Vertical List */}
                        <div className="hidden md:block space-y-2">
                            <Link href="/shop" className={`block text-sm ${!category ? "text-primary font-medium" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}>
                                All Products
                            </Link>
                            {categories.map((c: string) => (
                                <Link
                                    key={c}
                                    href={`/shop?category=${encodeURIComponent(c)}`}
                                    className={`block text-sm ${category === c ? "text-primary font-medium" : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"}`}
                                >
                                    {c}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                    <Suspense fallback={<ProductGridSkeleton count={8} />}>
                        {products.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-6">
                                {products.map((p: any) => (
                                    <ProductCard key={p.id} product={p} />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Sprout className="h-12 w-12 text-zinc-300 mb-4" />
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-white">No products found</h3>
                                <p className="text-zinc-500 max-w-sm mt-2">
                                    We couldn't find any products in this category. Try checking back later or browsing all products.
                                </p>
                                <Link href="/shop" className="mt-6 inline-flex h-9 items-center justify-center rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 shadow hover:bg-zinc-900/90 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50/90">
                                    Clear Filters
                                </Link>
                            </div>
                        )}

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center mt-10 gap-2">
                                <Link
                                    href={{
                                        pathname: '/shop',
                                        query: { ...searchParams, page: page > 1 ? page - 1 : 1 }
                                    }}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${page <= 1
                                        ? 'opacity-50 pointer-events-none border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600'
                                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900'
                                        }`}
                                    aria-disabled={page <= 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Link>

                                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                                    Page {page} of {totalPages}
                                </span>

                                <Link
                                    href={{
                                        pathname: '/shop',
                                        query: { ...searchParams, page: page < totalPages ? page + 1 : totalPages }
                                    }}
                                    className={`flex items-center gap-1 px-4 py-2 rounded-md text-sm font-medium border transition-colors ${page >= totalPages
                                        ? 'opacity-50 pointer-events-none border-zinc-200 text-zinc-400 dark:border-zinc-800 dark:text-zinc-600'
                                        : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900'
                                        }`}
                                    aria-disabled={page >= totalPages}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        )}
                    </Suspense>
                </div>
            </div>
        </div>
    );
}

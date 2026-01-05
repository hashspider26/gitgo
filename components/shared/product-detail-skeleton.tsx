import { Skeleton } from "@/components/ui/skeleton";

export function ProductDetailSkeleton() {
    return (
        <div className="min-h-screen bg-white dark:bg-black pb-20">
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>

            <div className="mx-auto max-w-6xl p-4 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-16 mb-24">
                    {/* Image Gallery Skeleton */}
                    <div className="md:col-span-2">
                        <div className="max-w-md mx-auto w-full">
                            <Skeleton className="aspect-square w-full rounded-xl" />
                        </div>
                    </div>

                    {/* Product Info Skeleton */}
                    <div className="md:col-span-3 flex flex-col">
                        <div className="mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-8 w-3/4 mb-4" />
                            <Skeleton className="h-10 w-32" />
                        </div>

                        <div className="space-y-2 mb-8">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-2/3" />
                        </div>

                        <div className="space-y-6 mt-auto">
                            <Skeleton className="h-20 w-full rounded-lg" />
                            <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                    </div>
                </div>

                {/* Related Products Skeleton */}
                <div className="border-t border-zinc-200 dark:border-zinc-800 pt-16">
                    <Skeleton className="h-8 w-48 mb-8" />
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
                                <Skeleton className="aspect-square w-full" />
                                <div className="p-2 flex items-start flex-col gap-1 flex-1">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-full" />
                                    <div className="mt-auto w-full pt-1.5 flex items-center justify-between">
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-8 w-8 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

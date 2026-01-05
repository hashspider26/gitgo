import { ProductGridSkeleton } from "@/components/shared/loading-skeletons";

export default function Loading() {
    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 py-8 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="h-8 w-32 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                    <div className="h-4 w-64 bg-zinc-100 dark:bg-zinc-900 rounded mt-2 animate-pulse" />
                </div>
            </div>

            <div className="mx-auto max-w-6xl px-4 mt-8 flex flex-col md:flex-row gap-8">
                {/* Categories Skeleton */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-4 animate-pulse hidden md:block" />
                        <div className="space-y-2 hidden md:block">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="h-4 w-full bg-zinc-100 dark:bg-zinc-900 rounded animate-pulse" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Product Grid Skeleton */}
                <div className="flex-1">
                    <ProductGridSkeleton count={8} />
                </div>
            </div>
        </div>
    );
}

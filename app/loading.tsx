import { Skeleton } from "@/components/ui/skeleton";
import { ProductGridSkeleton } from "@/components/shared/loading-skeletons";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            {/* Hero Section Skeleton */}
            <section className="relative overflow-hidden border-b border-zinc-200 dark:border-zinc-800">
                <div className="mx-auto max-w-6xl px-4 py-20 sm:py-32">
                    <div className="text-center space-y-6">
                        <Skeleton className="h-16 w-3/4 mx-auto" />
                        <Skeleton className="h-6 w-2/3 mx-auto" />
                        <div className="flex gap-4 justify-center mt-8">
                            <Skeleton className="h-12 w-32 rounded-full" />
                            <Skeleton className="h-12 w-32 rounded-full" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products Skeleton */}
            <section className="py-16 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="mb-8">
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-5 w-64" />
                    </div>
                    <ProductGridSkeleton count={4} />
                </div>
            </section>

            {/* Categories Skeleton */}
            <section className="py-16 px-4 bg-white dark:bg-black">
                <div className="mx-auto max-w-6xl">
                    <Skeleton className="h-8 w-48 mb-8" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 rounded-xl" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

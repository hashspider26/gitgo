import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            {/* Hero Skeleton */}
            <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="mx-auto max-w-6xl px-4 py-20 sm:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <Skeleton className="h-8 w-32 rounded-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-3/4" />
                        </div>
                        <Skeleton className="aspect-square rounded-2xl" />
                    </div>
                </div>
            </section>

            {/* Mission & Vision Skeleton */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Skeleton className="h-64 rounded-2xl" />
                        <Skeleton className="h-64 rounded-2xl" />
                    </div>
                </div>
            </section>

            {/* Story Skeleton */}
            <section className="bg-white dark:bg-black border-y border-zinc-200 dark:border-zinc-800 py-20 px-4">
                <div className="mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <Skeleton className="h-10 w-48 mx-auto mb-4" />
                        <Skeleton className="h-6 w-96 mx-auto" />
                    </div>
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                </div>
            </section>

            {/* Values Skeleton */}
            <section className="py-20 px-4">
                <div className="mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <Skeleton className="h-10 w-64 mx-auto mb-4" />
                        <Skeleton className="h-6 w-96 mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-48 rounded-xl" />
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

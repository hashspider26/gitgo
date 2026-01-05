import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 dark:from-black dark:to-zinc-950">
            {/* Hero Skeleton */}
            <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="mx-auto max-w-6xl px-4 py-20 sm:py-24">
                    <div className="text-center space-y-4">
                        <Skeleton className="h-12 w-64 mx-auto" />
                        <Skeleton className="h-6 w-96 mx-auto" />
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Contact Info Skeleton */}
                    <div className="lg:col-span-1 space-y-6">
                        <Skeleton className="h-8 w-48 mb-6" />
                        <Skeleton className="h-20 w-full" />
                        <div className="space-y-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <Skeleton key={i} className="h-24 w-full rounded-xl" />
                            ))}
                        </div>
                    </div>

                    {/* Form Skeleton */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-8">
                            <Skeleton className="h-8 w-48 mb-6" />
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                                <Skeleton className="h-32 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

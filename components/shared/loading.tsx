"use client";

import { useEffect, useRef, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useLoading } from "@/lib/loading-context";

function TopLoadingBarContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { isLoading, stopLoading, progress } = useLoading();
    const completionHandledRef = useRef(false);
    const prevPathnameRef = useRef(pathname);

    // Complete loading when route actually changes
    useEffect(() => {
        // Only trigger when pathname actually changes (not on initial mount)
        if (prevPathnameRef.current !== pathname) {
            prevPathnameRef.current = pathname;
            
            if (isLoading) {
                completionHandledRef.current = false;
                
                const completeLoading = () => {
                    if (!completionHandledRef.current) {
                        completionHandledRef.current = true;
                        stopLoading();
                    }
                };

                let cleanup: (() => void) | null = null;

                // Use requestAnimationFrame to wait for next paint cycle
                const rafId1 = requestAnimationFrame(() => {
                    const rafId2 = requestAnimationFrame(() => {
                        // Check if page is already loaded
                        if (document.readyState === 'complete') {
                            // Small delay to ensure DOM is updated
                            setTimeout(completeLoading, 50);
                        } else {
                            // Wait for page to load
                            const handleComplete = () => {
                                setTimeout(completeLoading, 50);
                            };

                            // Listen for load event
                            window.addEventListener('load', handleComplete, { once: true });
                            
                            // Also check readyState periodically
                            const checkReady = setInterval(() => {
                                if (document.readyState === 'complete') {
                                    clearInterval(checkReady);
                                    handleComplete();
                                }
                            }, 50);

                            // Fallback: complete after 1.5 seconds max
                            const fallback = setTimeout(() => {
                                clearInterval(checkReady);
                                window.removeEventListener('load', handleComplete);
                                completeLoading();
                            }, 1500);

                            // Setup cleanup
                            cleanup = () => {
                                clearTimeout(fallback);
                                clearInterval(checkReady);
                                window.removeEventListener('load', handleComplete);
                            };
                        }
                    });
                    
                    cleanup = () => {
                        cancelAnimationFrame(rafId2);
                    };
                });

                return () => {
                    cancelAnimationFrame(rafId1);
                    if (cleanup) cleanup();
                };
            }
        }
    }, [pathname, searchParams, isLoading, stopLoading]);

    // Reset completion flag when loading starts
    useEffect(() => {
        if (isLoading) {
            completionHandledRef.current = false;
        }
    }, [isLoading]);

    if (!isLoading && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div 
                className="h-full bg-gradient-to-r from-primary via-primary/90 to-primary transition-all duration-300 ease-out"
                style={{ 
                    width: `${progress}%`,
                    transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.1s linear'
                }}
            >
                <div className="h-full bg-primary/20 animate-shimmer" />
            </div>
        </div>
    );
}

export function TopLoadingBar() {
    return (
        <Suspense fallback={null}>
            <TopLoadingBarContent />
        </Suspense>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 animate-pulse">Loading...</p>
            </div>
        </div>
    );
}

export function InlineLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{text}</span>
            </div>
        </div>
    );
}

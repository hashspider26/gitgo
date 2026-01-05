"use client";

import { useEffect } from "react";
import { useLoading } from "@/lib/loading-context";
import { usePathname } from "next/navigation";

export function GlobalLinkHandler() {
    const { startLoading } = useLoading();
    const pathname = usePathname();

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            
            // Find the closest anchor tag
            const anchor = target.closest("a");
            if (!anchor) return;

            // Check if it's a Next.js Link (has href attribute)
            const href = anchor.getAttribute("href");
            if (!href) return;

            // Don't trigger for external links, anchors, or same page
            if (
                href.startsWith("http") ||
                href.startsWith("mailto:") ||
                href.startsWith("tel:") ||
                href.startsWith("#") ||
                href === pathname
            ) {
                return;
            }

            // Start loading immediately on click
            startLoading();
        };

        document.addEventListener("click", handleClick, true);
        return () => {
            document.removeEventListener("click", handleClick, true);
        };
    }, [startLoading, pathname]);

    return null;
}


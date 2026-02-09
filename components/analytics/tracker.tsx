"use client";

import { useEffect, useTransition } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Utility to track events
export async function trackEvent(type: string, data: any = {}) {
    try {
        const sessionId = localStorage.getItem("analytics_session_id") ||
            Math.random().toString(36).substring(2, 15);
        localStorage.setItem("analytics_session_id", sessionId);

        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get("utm_source");
        const fbclid = urlParams.get("fbclid");
        const gclid = urlParams.get("gclid");

        let source = data.source;
        if (!source) {
            if (utmSource) source = utmSource;
            else if (fbclid) source = "Facebook Ads";
            else if (gclid) source = "Google Ads";
        }

        const res = await fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type,
                path: window.location.pathname,
                pageTitle: document.title,
                referrer: document.referrer,
                sessionId,
                source,
                ...data,
            }),
        });
    } catch (e) {
        console.warn("Tracking failed", e);
    }
}

export function AnalyticsTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Skip tracking for admin dashboard pages
        if (pathname.startsWith("/admin")) return;

        // Track page view on route change
        trackEvent("PAGE_VIEW");
    }, [pathname, searchParams]);

    return null; // This is a logic-only component
}

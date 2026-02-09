"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useState } from "react";

export const MetaPixel = () => {
    const [loaded, setLoaded] = useState(false);
    const pathname = usePathname();
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

    useEffect(() => {
        if (!loaded || !pixelId) return;

        // Track pageview on route change
        if (typeof window.fbq !== "undefined") {
            window.fbq("track", "PageView");
        }
    }, [pathname, loaded, pixelId]);

    if (!pixelId) {
        if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ Meta Pixel ID not configured. Set NEXT_PUBLIC_META_PIXEL_ID in your .env file");
        }
        return null;
    }

    // Validate pixel ID format (should be numeric)
    if (!/^\d+$/.test(pixelId)) {
        console.error("❌ Invalid Meta Pixel ID format. Pixel ID should be numeric.");
        return null;
    }

    return (
        <>
            <Script
                id="fb-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `,
                }}
                onLoad={() => {
                    setLoaded(true);
                    // Ensure fbq is available globally
                    if (typeof window !== "undefined" && typeof window.fbq !== "undefined") {
                        console.log("✅ Meta Pixel initialized:", pixelId);
                    }
                }}
                onError={() => {
                    console.error("❌ Failed to load Meta Pixel script");
                }}
            />
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
                    alt=""
                />
            </noscript>
        </>
    );
};

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const headerList = headers();

        // Detect source from referrer if not explicitly provided
        const referrer = body.referrer || headerList.get("referer") || "";
        let source = body.source || "direct";

        if (source === "direct" && referrer) {
            const refUrl = referrer.toLowerCase();
            if (refUrl.includes("facebook.com") || refUrl.includes("fb.me")) source = "Facebook";
            else if (refUrl.includes("google.com")) source = "Google";
            else if (refUrl.includes("instagram.com")) source = "Instagram";
            else if (refUrl.includes("t.co") || refUrl.includes("twitter.com")) source = "Twitter/X";
            else if (refUrl.includes("whatsapp.com")) source = "WhatsApp";
            else if (refUrl.includes("tiktok.com")) source = "TikTok";
            else if (!refUrl.includes(headerList.get("host") || "")) source = "Other Referral";
        }

        // Detect device from user-agent
        const ua = headerList.get("user-agent") || "";
        let device = "Desktop";
        if (/mobile/i.test(ua)) device = "Mobile";
        else if (/tablet/i.test(ua)) device = "Tablet";

        // Detect OS and Browser
        let os = "Unknown";
        if (/windows/i.test(ua)) os = "Windows";
        else if (/macintosh|mac os/i.test(ua)) os = "MacOS";
        else if (/android/i.test(ua)) os = "Android";
        else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
        else if (/linux/i.test(ua)) os = "Linux";

        let browser = "Unknown";
        if (/chrome|crios/i.test(ua)) browser = "Chrome";
        else if (/firefox|fxios/i.test(ua)) browser = "Firefox";
        else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = "Safari";
        else if (/edg/i.test(ua)) browser = "Edge";

        const forwarded = headerList.get("x-forwarded-for");
        const realIp = headerList.get("x-real-ip");
        let ip = forwarded ? forwarded.split(",")[0] : (realIp || "127.0.0.1");

        // Normalize local IPv6 loopback
        if (ip === "::1") ip = "127.0.0.1";

        const eventId = `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const now = new Date().toISOString();

        await prisma.$executeRaw`
            INSERT INTO AnalyticsEvent (
                id, type, path, pageTitle, referrer, source,
                device, browser, os, ip, sessionId, productId,
                metadata, createdAt
            )
            VALUES (
                ${eventId},
                ${body.type || "PAGE_VIEW"},
                ${body.path || "/"},
                ${body.pageTitle},
                ${referrer},
                ${source},
                ${device},
                ${browser},
                ${os},
                ${ip},
                ${body.sessionId},
                ${body.productId},
                ${body.metadata ? JSON.stringify(body.metadata) : null},
                ${now}
            )
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Analytics tracking failed:", error);
        return NextResponse.json({ error: "Failed to track" }, { status: 500 });
    }
}

import { sendGAEvent } from "@next/third-parties/google";
import { trackEvent } from "@/components/analytics/tracker";

/**
 * Declare global fbq for Meta Pixel
 */
declare global {
    interface Window {
        fbq: any;
    }
}

/**
 * Standard Analytics Events (GA4 + Meta Pixel + Internal)
 */

export const trackViewItem = (product: { id: string; title: string; price: number }) => {
    // Google Analytics
    console.log(`📊 GA Event: view_item`, product.title);
    sendGAEvent('event', 'view_item', {
        currency: "PKR",
        value: product.price,
        items: [{
            item_id: product.id,
            item_name: product.title,
            price: product.price,
            quantity: 1
        }]
    });

    // Meta Pixel - ViewContent event (Product Viewed)
    if (typeof window !== "undefined" && typeof window.fbq !== "undefined") {
        try {
            window.fbq("track", "ViewContent", {
                content_ids: [product.id],
                content_name: product.title,
                content_type: "product",
                value: product.price,
                currency: "PKR",
            });
            console.log("📊 Meta Pixel: ViewContent tracked", product.title);
        } catch (error) {
            console.error("Meta Pixel ViewContent error:", error);
        }
    } else {
        // Queue event if pixel not loaded yet (fbq queue handles this automatically)
        if (typeof window !== "undefined" && typeof (window as any)._fbq !== "undefined") {
            (window as any)._fbq("track", "ViewContent", {
                content_ids: [product.id],
                content_name: product.title,
                content_type: "product",
                value: product.price,
                currency: "PKR",
            });
        }
    }

    // Internal Tracking
    trackEvent('VIEW_PRODUCT', {
        productId: product.id,
        metadata: { title: product.title, price: product.price }
    });
};

export const trackAddToCart = (product: { id: string; title: string; price: number }, quantity: number = 1) => {
    // Google Analytics
    console.log(`📊 GA Event: add_to_cart`, product.title, "Qty:", quantity);
    sendGAEvent('event', 'add_to_cart', {
        currency: "PKR",
        value: product.price * quantity,
        items: [{
            item_id: product.id,
            item_name: product.title,
            price: product.price,
            quantity: quantity
        }]
    });

    // Meta Pixel - AddToCart event
    if (typeof window !== "undefined" && typeof window.fbq !== "undefined") {
        try {
            window.fbq("track", "AddToCart", {
                content_ids: [product.id],
                content_name: product.title,
                content_type: "product",
                value: product.price * quantity,
                currency: "PKR",
            });
            console.log("📊 Meta Pixel: AddToCart tracked", product.title, "Qty:", quantity);
        } catch (error) {
            console.error("Meta Pixel AddToCart error:", error);
        }
    } else {
        // Queue event if pixel not loaded yet
        if (typeof window !== "undefined" && typeof (window as any)._fbq !== "undefined") {
            (window as any)._fbq("track", "AddToCart", {
                content_ids: [product.id],
                content_name: product.title,
                content_type: "product",
                value: product.price * quantity,
                currency: "PKR",
            });
        }
    }

    // Internal Tracking
    trackEvent('ADD_TO_CART', {
        productId: product.id,
        metadata: { title: product.title, price: product.price, quantity }
    });
};

export const trackBeginCheckout = (items: any[], total: number) => {
    // Google Analytics
    console.log(`📊 GA Event: begin_checkout`, "Total:", total);
    sendGAEvent('event', 'begin_checkout', {
        currency: "PKR",
        value: total,
        items: items.map(item => ({
            item_id: item.id || item.productId,
            item_name: item.title,
            price: item.price,
            quantity: item.quantity
        }))
    });

    // Meta Pixel
    if (typeof window.fbq !== "undefined") {
        window.fbq("track", "InitiateCheckout", {
            content_ids: items.map(item => item.id || item.productId),
            content_type: "product",
            value: total,
            currency: "PKR",
            num_items: items.reduce((acc, item) => acc + item.quantity, 0),
        });
    }

    // Internal Tracking
    trackEvent('INITIATE_CHECKOUT', {
        metadata: {
            total,
            itemCount: items.length,
            items: items.map(i => i.id || i.productId)
        }
    });
};

// Guard to prevent double tracking of the same order in the same session
const trackedOrders = new Set<string>();

export const trackPurchase = (orderId: string, items: any[], total: number) => {
    // Prevent double tracking
    if (trackedOrders.has(orderId)) {
        console.log(`⚠️ Order ${orderId} already tracked. Skipping duplicate.`);
        return;
    }
    trackedOrders.add(orderId);

    // Google Analytics
    console.log(`📊 GA Event: purchase`, "Order:", orderId, "Total:", total);
    sendGAEvent('event', 'purchase', {
        transaction_id: orderId,
        currency: "PKR",
        value: total,
        items: items.map(item => ({
            item_id: item.id || item.productId,
            item_name: item.title || "Product",
            price: item.price,
            quantity: item.quantity
        }))
    });

    // Meta Pixel - Purchase event (with Deduplication ID)
    if (typeof window !== "undefined") {
        try {
            // Standard fbq function (handles queueing automatically)
            const fb = (window as any).fbq || (window as any)._fbq;
            
            if (typeof fb === "function") {
                fb("track", "Purchase", {
                    content_ids: items.map(item => item.id || item.productId),
                    content_name: items.map(item => item.title || "Product").join(", "),
                    content_type: "product",
                    value: total,
                    currency: "PKR",
                    num_items: items.reduce((acc, item) => acc + item.quantity, 0),
                }, { eventID: orderId }); // eventID is CRITICAL for deduplication

                console.log("📊 Meta Pixel: Purchase tracked (Deduplicated)", "Order:", orderId, "Total:", total);
            } else {
                console.warn("Meta Pixel (fbq) not found on window");
            }
        } catch (error) {
            console.error("Meta Pixel Purchase error:", error);
        }
    }

    // Internal Tracking
    trackEvent('PURCHASE', {
        metadata: {
            orderId,
            total,
            itemCount: items.length
        }
    });
};

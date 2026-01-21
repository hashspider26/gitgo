import { sendGAEvent } from "@next/third-parties/google";

/**
 * Declare global fbq for Meta Pixel
 */
declare global {
    interface Window {
        fbq: any;
    }
}

/**
 * Standard Analytics Events (GA4 + Meta Pixel)
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

    // Meta Pixel
    if (typeof window.fbq !== "undefined") {
        window.fbq("track", "ViewContent", {
            content_ids: [product.id],
            content_name: product.title,
            content_type: "product",
            value: product.price,
            currency: "PKR",
        });
    }
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

    // Meta Pixel
    if (typeof window.fbq !== "undefined") {
        window.fbq("track", "AddToCart", {
            content_ids: [product.id],
            content_name: product.title,
            content_type: "product",
            value: product.price * quantity,
            currency: "PKR",
        });
    }
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
};

export const trackPurchase = (orderId: string, items: any[], total: number) => {
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

    // Meta Pixel
    if (typeof window.fbq !== "undefined") {
        window.fbq("track", "Purchase", {
            content_ids: items.map(item => item.id || item.productId),
            content_type: "product",
            value: total,
            currency: "PKR",
            num_items: items.reduce((acc, item) => acc + item.quantity, 0),
        });
    }
};

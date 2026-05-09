
/**
 * Meta Conversions API (CAPI) Utility
 * Used to send server-side events to Meta for deduplication with the Pixel.
 */

export async function trackPurchaseServer(order: any) {
    const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
    const accessToken = process.env.META_ACCESS_TOKEN;

    if (!pixelId || !accessToken) {
        if (process.env.NODE_ENV === 'development') {
            console.warn("⚠️ Meta CAPI: Missing Pixel ID or Access Token. Server-side tracking skipped.");
        }
        return;
    }

    const eventId = order.readableId || order.id;
    const url = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`;

    // Prepare items for Meta format
    const contents = order.items?.map((item: any) => ({
        id: item.productId || item.id,
        quantity: item.quantity,
        item_price: item.price
    })) || [];

    const payload = {
        data: [
            {
                event_name: "Purchase",
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventId, // MUST MATCH THE BROWSER eventID
                event_source_url: "https://greenvalleyseeds.pk/checkout",
                action_source: "website",
                user_data: {
                    // Hash sensitive data if available
                    ph: order.phone ? [order.phone.replace(/\D/g, '')] : undefined,
                    fn: order.customerName ? [order.customerName.split(' ')[0].toLowerCase()] : undefined,
                    ln: order.customerName && order.customerName.includes(' ') ? [order.customerName.split(' ').slice(1).join(' ').toLowerCase()] : undefined,
                    ct: order.city ? [order.city.toLowerCase()] : undefined,
                    // client_ip_address and client_user_agent help Meta match the user
                },
                custom_data: {
                    currency: "PKR",
                    value: order.totalAmount,
                    content_ids: contents.map((c: any) => c.id),
                    content_type: "product",
                    num_items: order.items?.reduce((acc: number, i: any) => acc + i.quantity, 0) || 1,
                    contents: contents
                }
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const result = await response.json();
        if (result.error) {
            console.error("❌ Meta CAPI Error:", result.error);
        } else {
            console.log(`✅ Meta CAPI: Purchase tracked for order #${eventId} (Deduplication Active)`);
        }
    } catch (error) {
        console.error("❌ Meta CAPI Fetch Error:", error);
    }
}

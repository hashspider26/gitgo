
/**
 * Utility to send notifications to Discord via Webhook
 */
export async function sendDiscordOrderNotification(order: any) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.warn("⚠️ DISCORD_WEBHOOK_URL is not set. Order notification skipped.");
        return;
    }

    try {
        const orderId = order.readableId || order.id || "Unknown ID";
        const customerName = order.customerName || "Guest";
        const phone = order.phone || "N/A";
        const amount = new Intl.NumberFormat('en-PK', {
            style: 'currency',
            currency: 'PKR',
            minimumFractionDigits: 0
        }).format(order.totalAmount || 0);
        
        const method = order.paymentMethod === "ADVANCE" ? "🏦 Advance Payment" : "💵 Cash on Delivery";
        const address = `${order.address}, ${order.city}`;

        // Format items list if available
        let itemsDescription = "";
        if (order.items && Array.isArray(order.items)) {
            itemsDescription = order.items
                .map((item: any) => `• ${item.product?.title || 'Product'} x${item.quantity}`)
                .join("\n");
        }

        const embed = {
            title: "🌿 New Order Received!",
            description: `Order **#${orderId}** has been placed successfully.`,
            color: 0x22c55e, // Green
            fields: [
                {
                    name: "👤 Customer",
                    value: `${customerName}\n${phone}`,
                    inline: true
                },
                {
                    name: "💰 Amount",
                    value: `**${amount}**`,
                    inline: true
                },
                {
                    name: "💳 Payment Method",
                    value: method,
                    inline: false
                },
                {
                    name: "📍 Shipping Address",
                    value: address,
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "Green Valley Seeds • Order Notification System",
            }
        };

        if (itemsDescription) {
            embed.fields.push({
                name: "📦 Items",
                value: itemsDescription,
                inline: false
            });
        }

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "Green Valley Order Bot",
                avatar_url: "https://greenvalleyseeds.pk/icon.svg",
                embeds: [embed]
            })
        });

        if (!response.ok) {
            throw new Error(`Discord Webhook failed with status ${response.status}`);
        }

        console.log(`✅ Discord notification sent for order #${orderId}`);
    } catch (error) {
        console.error("❌ Failed to send Discord notification:", error);
    }
}

/**
 * Utility to send contact message notifications to Discord via Webhook
 */
export async function sendDiscordContactNotification(contact: any) {
    console.log("🌐 Attempting to send Discord Contact Notification...");
    const webhookUrl = process.env.DISCORD_MESSAGES_WEBHOOK_URL;
    
    if (!webhookUrl) {
        console.error("❌ DISCORD_MESSAGES_WEBHOOK_URL is NOT defined in environment variables.");
        return;
    }

    console.log("✅ Found Webhook URL, sending message...");

    try {
        const name = contact.name || "Unknown";
        const email = contact.email || "N/A";
        const phone = contact.phone || "N/A";
        const subject = contact.subject || "No Subject";
        const message = contact.message || "No Message Body";

        const embed = {
            title: "📬 New Contact Message!",
            description: `A new message has been submitted via the contact form.`,
            color: 0x3b82f6, // Blue
            fields: [
                {
                    name: "👤 From",
                    value: `${name}\n${email}`,
                    inline: true
                },
                {
                    name: "📞 Phone",
                    value: phone,
                    inline: true
                },
                {
                    name: "📝 Subject",
                    value: subject,
                    inline: false
                },
                {
                    name: "💬 Message",
                    value: message.length > 1024 ? message.substring(0, 1021) + "..." : message,
                    inline: false
                }
            ],
            timestamp: new Date().toISOString(),
            footer: {
                text: "Green Valley Seeds • Support Notification System",
            }
        };

        const response = await fetch(webhookUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: "Green Valley Support Bot",
                avatar_url: "https://greenvalleyseeds.pk/icon.svg",
                embeds: [embed]
            })
        });

        if (!response.ok) {
            throw new Error(`Discord Webhook failed with status ${response.status}`);
        }

        console.log(`✅ Discord notification sent for contact from ${name}`);
    } catch (error) {
        console.error("❌ Failed to send Discord notification for contact:", error);
    }
}

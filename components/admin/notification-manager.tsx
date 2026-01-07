"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";

export function NotificationManager() {
    const { data: session } = useSession();
    const [lastOrderCount, setLastOrderCount] = useState<number | null>(null);
    const [lastMessageCount, setLastMessageCount] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Create audio element for alerts
        audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    }, []);

    useEffect(() => {
        const isAdmin = (session?.user as any)?.isAdmin;
        if (!isAdmin) return;

        console.log("Admin Notification Manager active...");

        // Request notification permission if not granted
        if ("Notification" in window) {
            if (Notification.permission === "default") {
                Notification.requestPermission().then(permission => {
                    console.log("Notification permission:", permission);
                });
            }
        }

        const checkUpdates = async () => {
            try {
                // Fetch orders
                const ordersRes = await fetch("/api/orders");
                if (ordersRes.ok) {
                    const orders = await ordersRes.json();
                    const currentOrderCount = orders.length;

                    if (lastOrderCount !== null && currentOrderCount > lastOrderCount) {
                        const newOrder = orders[0];

                        // Play sound
                        audioRef.current?.play().catch(e => console.log("Audio play failed:", e));

                        // Browser notification
                        if (Notification.permission === "granted") {
                            new Notification("New Order Received! 📦", {
                                body: `Order #${newOrder.readableId || newOrder.id.slice(0, 8)} from ${newOrder.customerName}`,
                                icon: "/favicon.ico",
                                tag: "new-order"
                            });
                        }
                    }
                    setLastOrderCount(currentOrderCount);
                }

                // Fetch messages
                const messagesRes = await fetch("/api/contact");
                if (messagesRes.ok) {
                    const messages = await messagesRes.json();
                    const currentUnreadCount = messages.filter((m: any) => m.status === 'UNREAD').length;

                    if (lastMessageCount !== null && currentUnreadCount > lastMessageCount) {
                        const newMessage = messages[0];

                        // Play sound
                        audioRef.current?.play().catch(e => console.log("Audio play failed:", e));

                        // Browser notification
                        if (Notification.permission === "granted") {
                            new Notification("New Message! ✉️", {
                                body: `${newMessage.name} sent a new message: ${newMessage.subject}`,
                                icon: "/favicon.ico",
                                tag: "new-message"
                            });
                        }
                    }
                    setLastMessageCount(currentUnreadCount);
                }
            } catch (error) {
                console.error("Notification check error:", error);
            }
        };

        // Initial check
        checkUpdates();

        // Check every 20 seconds
        const interval = setInterval(checkUpdates, 20000);
        return () => clearInterval(interval);
    }, [session, lastOrderCount, lastMessageCount]);

    return null;
}

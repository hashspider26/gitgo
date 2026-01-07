"use client";

import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
    { label: "Pending", value: "PENDING", color: "bg-yellow-100 text-yellow-800" },
    { label: "Confirmed", value: "CONFIRMED", color: "bg-blue-100 text-blue-800" },
    { label: "Shipped", value: "SHIPPED", color: "bg-indigo-100 text-indigo-800" },
    { label: "Delivered", value: "DELIVERED", color: "bg-green-100 text-green-800" },
    { label: "Cancelled", value: "CANCELLED", color: "bg-red-100 text-red-800" },
];

export function OrderStatusManager({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();

    async function handleStatusChange(newStatus: string) {
        if (newStatus === status) return;

        setIsUpdating(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                setStatus(newStatus);
                router.refresh();
            } else {
                const data = await res.json();
                alert(`Failed to update status: ${data.details || data.error || "Unknown error"}`);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while updating status");
        } finally {
            setIsUpdating(false);
        }
    }

    return (
        <div className="flex items-center gap-2">
            <select
                value={status}
                disabled={isUpdating}
                onChange={(e) => handleStatusChange(e.target.value)}
                className={`text-xs font-medium rounded-full px-3 py-1 border-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer disabled:opacity-50 ${STATUS_OPTIONS.find(s => s.value === status)?.color || "bg-gray-100 text-gray-800"
                    }`}
            >
                {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {isUpdating && <Loader2 className="h-3 w-3 animate-spin text-zinc-500" />}
        </div>
    );
}

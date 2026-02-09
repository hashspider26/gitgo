"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DeleteOrderButton({ orderId }: { orderId: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Are you sure you want to delete this order? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: "DELETE",
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || "Failed to delete order");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred while deleting");
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-2 hover:bg-red-50 rounded-lg text-zinc-400 hover:text-red-600  transition-all active:scale-95 disabled:opacity-50"
            title="Delete order"
        >
            {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Trash2 className="h-4 w-4" />
            )}
        </button>
    );
}

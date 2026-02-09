"use client";

import { useState, useEffect } from "react";

export function LiveViewerCount() {
    const [count, setCount] = useState(3);

    useEffect(() => {
        // Initial random count between 2 and 5
        setCount(Math.floor(Math.random() * 4) + 2);

        const updateCount = () => {
            setCount(prev => {
                const change = Math.random() > 0.5 ? 1 : -1;
                const next = prev + change;
                if (next < 2) return 2;
                if (next > 5) return 5;
                return next;
            });
            
            // Schedule next update between 4s and 10s
            const delay = Math.random() * 6000 + 4000;
            timeoutId = setTimeout(updateCount, delay);
        };

        let timeoutId = setTimeout(updateCount, 4000);

        return () => clearTimeout(timeoutId);
    }, []);

    return (
        <div className="flex items-center gap-2 mb-4 animate-in fade-in duration-500">
            <div className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                {count} people are viewing this page
            </span>
        </div>
    );
}
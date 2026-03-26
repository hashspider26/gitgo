"use client";

import { useEffect, useState } from "react";

interface LocalTimeProps {
    date: string | Date;
    format?: "date" | "time" | "both";
}

export function LocalTime({ date, format = "both" }: LocalTimeProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        // Return a placeholder or server-rendered fallback during hydration
        // We use a blank space or a non-committal format to avoid hydration mismatch
        return <span className="opacity-0">---</span>;
    }

    const d = new Date(date);

    if (format === "date") {
        return <span>{d.toLocaleDateString()}</span>;
    }

    if (format === "time") {
        return <span>{d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>;
    }

    return (
        <span>
            {d.toLocaleDateString()} at {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
    );
}

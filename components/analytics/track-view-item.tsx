"use client";

import { useEffect, useRef } from "react";
import { trackViewItem } from "@/lib/analytics";

interface TrackViewItemProps {
    product: {
        id: string;
        title: string;
        price: number;
    };
}

export function TrackViewItem({ product }: TrackViewItemProps) {
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!hasTracked.current) {
            trackViewItem(product);
            hasTracked.current = true;
        }
    }, [product.id]);

    return null;
}

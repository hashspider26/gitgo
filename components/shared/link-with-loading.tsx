"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLoading } from "@/lib/loading-context";
import { ComponentProps } from "react";

type LinkProps = ComponentProps<typeof Link>;

export function LinkWithLoading({ href, onClick, ...props }: LinkProps) {
    const pathname = usePathname();
    const { startLoading } = useLoading();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Only trigger loading if navigating to a different route
        if (href !== pathname) {
            startLoading();
        }
        onClick?.(e);
    };

    return <Link href={href} onClick={handleClick} {...props} />;
}


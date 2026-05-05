"use client";

import { useState } from "react";
import { getRandomizedUrl } from "@/lib/cloudinary";

interface ImageGalleryProps {
    images: string[];
    title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
    const [activeImage, setActiveImage] = useState(images[0]);

    if (!images || images.length === 0) {
        return (
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                <span className="text-zinc-400">No images available</span>
            </div>
        );
    }

    return (
        <div className="relative group overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:shadow-lg">
            {/* Main Image */}
            <div className="aspect-square w-full bg-zinc-100 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={getRandomizedUrl(activeImage, "f_auto,q_auto,w_1200,c_limit") || activeImage}
                    alt={title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
            </div>

            {/* Floating Thumbnails Overlay */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 px-4">
                    <div className="mx-auto flex w-fit max-w-full items-center gap-2 rounded-2xl bg-white/40 backdrop-blur-md p-1.5 shadow-xl ring-1 ring-white/20 border border-white/30 dark:bg-black/40 dark:ring-white/10">
                        {images.map((url, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(url)}
                                className={`relative h-12 w-12 rounded-xl overflow-hidden transition-all duration-300 ${activeImage === url
                                    ? "ring-2 ring-primary scale-110 shadow-lg z-10"
                                    : "opacity-80 hover:opacity-100 hover:scale-105"
                                    }`}
                                aria-label={`View image ${idx + 1}`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={getRandomizedUrl(url, "f_auto,q_auto,w_150,c_fill") || url}
                                    alt={`${title} thumbnail ${idx + 1}`}
                                    loading="lazy"
                                    className="object-cover w-full h-full"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

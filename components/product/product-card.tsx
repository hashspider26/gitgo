import Link from "next/link";
import { Sprout } from "lucide-react";
import { AddToCart } from "@/components/cart/add-to-cart";

interface ProductCardProps {
    product: {
        id: string;
        title: string;
        slug: string;
        price: number;
        category: string;
        images: string; // JSON string
        deliveryFee?: number;
        weight?: number;
    };
}

function formatPrice(amount: number) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export function ProductCard({ product }: ProductCardProps) {
    let imageUrl = null;
    try {
        const images = product.images ? JSON.parse(product.images) : [];
        if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
    } catch (e) { }

    return (
        <div className="group flex h-full flex-col rounded-xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 overflow-hidden">
            {/* Image */}
            <Link href={`/product/${product.slug}`} className="block aspect-square w-full bg-zinc-100 relative overflow-hidden">
                {imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 bg-zinc-100 dark:bg-zinc-800">
                        <Sprout className="h-10 w-10 opacity-50" />
                    </div>
                )}
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
            </Link>

            {/* Content */}
            <div className="p-2 flex items-start flex-col gap-1 flex-1">
                <p className="text-[9px] uppercase tracking-wider font-semibold text-primary/80 line-clamp-1">
                    {product.category}
                </p>
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-medium text-xs text-zinc-900 dark:text-zinc-100 group-hover:text-primary line-clamp-2 leading-tight min-h-[2.5em] transition-colors">
                        {product.title}
                    </h3>
                </Link>

                <div className="mt-auto w-full pt-1.5 flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">
                        {formatPrice(product.price)}
                    </span>
                    <AddToCart
                        product={{
                            id: product.id,
                            title: product.title,
                            price: product.price,
                            image: imageUrl || undefined,
                            slug: product.slug,
                            deliveryFee: product.deliveryFee,
                            weight: product.weight
                        }}
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-full bg-zinc-100 hover:bg-primary hover:text-white dark:bg-zinc-800 dark:hover:bg-primary dark:hover:text-white transition-colors"
                    />
                </div>
            </div>
        </div>
    );
}

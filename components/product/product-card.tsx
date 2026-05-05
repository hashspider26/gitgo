import Link from "next/link";
import { Sprout } from "lucide-react";
import { AddToCart } from "@/components/cart/add-to-cart";
import { getRandomizedUrl } from "@/lib/cloudinary";

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
        salePrice?: number;
        advanceDiscount?: number;
        advanceDiscountType?: string;
        stock?: number;
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
        if (Array.isArray(images) && images.length > 0) {
            imageUrl = getRandomizedUrl(images[0], "f_auto,q_auto,w_500,c_limit");
        }
    } catch (e) { }

    const isOnSale = product.salePrice && product.salePrice > product.price;
    const discountPercentage = isOnSale
        ? Math.round(((product.salePrice! - product.price) / product.salePrice!) * 100)
        : 0;

    const isOutOfStock = (product.stock ?? 0) <= 0;

    return (
        <div className={`group flex h-full flex-col bg-white overflow-hidden transition-all duration-300 ${isOutOfStock ? 'opacity-75' : ''}`}>
            {/* Image & Badge */}
            <div className="relative aspect-[4/5] w-full bg-zinc-50 overflow-hidden rounded-2xl border border-zinc-100 group/image">
                <Link href={`/product/${product.slug}`} className="block h-full w-full">
                    {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src={imageUrl}
                            alt={product.title}
                            loading="lazy"
                            className={`object-cover w-full h-full transition-transform duration-700 ${!isOutOfStock ? 'group-hover:scale-105' : 'grayscale-[0.5]'}`}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
                            <Sprout className="h-8 w-8 opacity-50" />
                        </div>
                    )}
                </Link>

                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {isOutOfStock ? (
                        <div className="bg-zinc-900/80 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg backdrop-blur-sm shadow-lg">
                            Out of Stock
                        </div>
                    ) : discountPercentage > 0 && (
                        <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg shadow-lg">
                            {discountPercentage}% OFF
                        </div>
                    )}
                </div>

                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] pointer-events-none flex items-center justify-center">
                        <span className="bg-zinc-950 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full shadow-2xl">
                            Sold Out
                        </span>
                    </div>
                )}

                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black-[0.01] pointer-events-none" />
            </div>

            {/* Content simplified and high contrast */}
            <div className="pt-4 flex flex-col gap-1 flex-1 px-1">
                <Link href={`/product/${product.slug}`}>
                    <h3 className={`font-bold text-xs text-zinc-900 transition-colors line-clamp-2 leading-snug lowercase first-letter:uppercase ${!isOutOfStock ? 'group-hover:text-primary' : 'text-zinc-500'}`}>
                        {product.title}
                    </h3>
                </Link>

                <div className="flex flex-col gap-2 mt-auto pt-2 pb-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className={`font-black text-sm ${isOutOfStock ? 'text-zinc-400' : 'text-zinc-900'}`}>
                            {formatPrice(product.price)}
                        </span>
                        {isOnSale && !isOutOfStock && (
                            <span className="text-[10px] text-zinc-400 line-through decoration-1">
                                {formatPrice(product.salePrice!)}
                            </span>
                        )}
                    </div>

                    {!isOutOfStock && (
                        <div className="mt-4">
                            <AddToCart
                                product={{
                                    id: product.id,
                                    title: product.title,
                                    price: product.price,
                                    image: imageUrl || undefined,
                                    slug: product.slug,
                                    deliveryFee: product.deliveryFee,
                                    weight: product.weight,
                                    advanceDiscount: product.advanceDiscount,
                                    advanceDiscountType: product.advanceDiscountType
                                }}
                                isBuyNow={true}
                                variant="default"
                                className="w-full h-10 rounded-xl bg-zinc-950 text-white font-black hover:bg-zinc-900 transition-all text-[11px] uppercase tracking-widest shadow-lg shadow-black/10 hover:scale-[1.01] active:scale-95"
                                stock={product.stock}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}


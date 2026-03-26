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
            imageUrl = getRandomizedUrl(images[0]);
        }
    } catch (e) { }

    const isOnSale = product.salePrice && product.salePrice > product.price;
    const discountPercentage = isOnSale
        ? Math.round(((product.salePrice! - product.price) / product.salePrice!) * 100)
        : 0;

    return (
        <div className="group flex h-full flex-col bg-white overflow-hidden transition-all duration-300">
            {/* Image & Badge */}
            <Link href={`/product/${product.slug}`} className="block aspect-[4/5] w-full bg-zinc-50 relative overflow-hidden rounded-2xl border border-zinc-100">
                {imageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                        src={imageUrl}
                        alt={product.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
                        <Sprout className="h-8 w-8 opacity-50" />
                    </div>
                )}

                {discountPercentage > 0 && (
                    <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded-lg shadow-lg">
                        {discountPercentage}% OFF
                    </div>
                )}

                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black-[0.02]" />
            </Link>

            {/* Content simplified and high contrast */}
            <div className="pt-4 flex flex-col gap-1 flex-1 px-1">
                <Link href={`/product/${product.slug}`}>
                    <h3 className="font-bold text-xs text-zinc-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug lowercase first-letter:uppercase">
                        {product.title}
                    </h3>
                </Link>

                <div className="flex flex-col gap-2 mt-auto pt-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-black text-sm text-zinc-900">
                            {formatPrice(product.price)}
                        </span>
                        {isOnSale && (
                            <span className="text-[10px] text-zinc-400 line-through decoration-1">
                                {formatPrice(product.salePrice!)}
                            </span>
                        )}
                    </div>

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
                        isBuyNow
                        variant="buy-now"
                        size="default"
                        className="w-full h-9 rounded-xl bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all lg:opacity-0 lg:group-hover:opacity-100 lg:translate-y-2 lg:group-hover:translate-y-0"
                    />
                </div>
            </div>
        </div>
    );
}


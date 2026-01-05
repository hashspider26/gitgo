import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck, Sprout, Share2, Shield } from "lucide-react";
import { Metadata } from "next";
import { ImageGallery } from "@/components/shared/image-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";

// Force dynamic rendering to ensure fresh data and valid metadata generation on request
export const dynamic = 'force-dynamic';

interface Props {
    params: { slug: string };
}

// Generate SEO Metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const product = await prisma.product.findUnique({
        where: { slug: params.slug },
    });

    if (!product) {
        return {
            title: "Product Not Found | Green Valley Seeds",
        };
    }

    const p = product as any;
    let imageUrl = "https://placehold.co/600x600/e2e8f0/1e293b?text=" + encodeURIComponent(p.title);
    try {
        const images = p.images ? JSON.parse(p.images) : [];
        if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
    } catch (e) { }

    return {
        title: `${p.title} | Green Valley Seeds`,
        description: p.description.substring(0, 160),
        openGraph: {
            title: p.title,
            description: p.description,
            images: [imageUrl],
            type: "website",
            siteName: "Green Valley Seeds",
        },
        twitter: {
            card: "summary_large_image",
            title: p.title,
            description: p.description,
            images: [imageUrl],
        },
    };
}

function formatPrice(amount: number) {
    return new Intl.NumberFormat('en-PK', {
        style: 'currency',
        currency: 'PKR',
        minimumFractionDigits: 0,
    }).format(amount);
}

export default async function ProductPage({ params }: Props) {
    const product = await prisma.product.findUnique({
        where: { slug: params.slug },
    });

    if (!product) notFound();

    const p = product as any;

    // Fetch related products
    const relatedProducts = await prisma.product.findMany({
        where: {
            category: p.category,
            id: { not: p.id }
        },
        take: 4,
        orderBy: { createdAt: 'desc' }
    });

    let images: string[] = [];
    try {
        const parsedImages = p.images ? JSON.parse(p.images) : [];
        images = Array.isArray(parsedImages) ? parsedImages : [];
    } catch (e) { }

    if (images.length === 0) {
        images = ["https://placehold.co/600x600/e2e8f0/1e293b?text=" + encodeURIComponent(p.title)];
    }

    return (
        <div className="min-h-screen bg-white dark:bg-black pb-20">
            <div className="border-b border-zinc-200 dark:border-zinc-800">
                <div className="mx-auto max-w-6xl px-4 py-4">
                    <Link href="/shop" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Shop
                    </Link>
                </div>
            </div>

            <div className="mx-auto max-w-6xl p-4 mt-8">
                {/* Main Product Section: Image reduced to 40% width (2/5 cols) */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-16 mb-24">
                    {/* Image Gallery */}
                    <div className="md:col-span-2">
                        <div className="max-w-md mx-auto w-full">
                            <ImageGallery images={images} title={p.title} />
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-3 flex flex-col">
                        <div className="mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-6">
                            <span className="text-sm font-medium text-primary mb-2 block">{p.category}</span>
                            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">{p.title}</h1>
                            <div className="flex items-end gap-3">
                                <span className="text-3xl font-bold text-zinc-900 dark:text-white">
                                    {formatPrice(p.price)}
                                </span>
                                {p.salePrice && (
                                    <span className="text-lg text-zinc-500 line-through mb-1">
                                        {formatPrice(p.salePrice)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 mb-8">
                            <p>{p.description}</p>
                        </div>

                        <div className="space-y-6 mt-auto">
                            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                <div className="h-10 w-10 bg-white dark:bg-black rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-green-600">
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">
                                        {(p.deliveryFee || 0) === 0
                                            ? "Free Delivery"
                                            : `Delivery Fee: ${formatPrice(p.deliveryFee)}`
                                        }
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        {(p.deliveryFee || 0) === 0
                                            ? "Free shipping on this item"
                                            : "Standard delivery charges apply"
                                        }
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
                                <div className="h-10 w-10 bg-white dark:bg-black rounded-full flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-blue-600">
                                    <Shield className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">
                                        14-Day Return Policy
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                        Return unopened products within 14 days for a full refund
                                    </p>
                                </div>
                            </div>

                            <ProductActions
                                product={{
                                    id: p.id,
                                    title: p.title,
                                    price: p.price,
                                    image: images[0],
                                    slug: p.slug,
                                    stock: p.stock,
                                    weight: p.weight,
                                    deliveryFee: p.deliveryFee
                                }}
                            />
                        </div>

                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-16">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-8">You Might Also Like</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
                            {relatedProducts.map((relProduct: any) => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

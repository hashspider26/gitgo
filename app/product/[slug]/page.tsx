import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, Truck, Sprout, Share2, Shield } from "lucide-react";
import { Metadata } from "next";
import { ImageGallery } from "@/components/shared/image-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductCard } from "@/components/product/product-card";
import { LiveViewerCount } from "@/components/product/live-viewer-count";
import { TrackViewItem } from "@/components/analytics/track-view-item";

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
        <div className="min-h-screen bg-white pb-20">
            {/* Minimal Header Breadcrumb */}
            <div className="mx-auto max-w-6xl px-4 py-6">
                <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <Link href="/shop" className="hover:text-primary">Shop</Link>
                    <span>/</span>
                    <span className="text-zinc-900 truncate max-w-[150px]">{p.title}</span>
                </nav>
            </div>

            <div className="mx-auto max-w-6xl px-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-7">
                        <div className="rounded-3xl overflow-hidden bg-zinc-50 border border-zinc-100">
                            <ImageGallery images={images} title={p.title} />
                        </div>
                    </div>

                    {/* Right: Product Details & Conversion Box */}
                    <div className="lg:col-span-5 space-y-8">
                        <TrackViewItem product={{ id: p.id, title: p.title, price: p.price }} />
                        <div>
                            <LiveViewerCount />

                            <h1 className="text-3xl font-black text-zinc-900 leading-tight mb-2">{p.title}</h1>

                            <div className="flex items-baseline gap-4 mb-6">
                                <span className="text-4xl font-black text-primary">
                                    {formatPrice(p.price)}
                                </span>
                                {p.salePrice && p.salePrice > p.price && (
                                    <span className="text-xl text-orange-600 line-through decoration-2 font-bold">
                                        {formatPrice(p.salePrice)}
                                    </span>
                                )}
                                {p.salePrice && p.salePrice > p.price && (
                                    <span className="bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                                        Save {Math.round(((p.salePrice - p.price) / p.salePrice) * 100)}%
                                    </span>
                                )}
                            </div>

                            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-3 mb-8">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                                    <Truck className="h-4 w-4 text-primary" />
                                    <span>
                                        {(p.deliveryFee || 0) === 0 
                                            ? "Free Delivery" 
                                            : `Delivery Charges: ${formatPrice(p.deliveryFee)}`}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-600">
                                    <Shield className="h-4 w-4 text-primary" />
                                    <span>Safe & Secure Cash on Delivery</span>
                                </div>
                            </div>
                        </div>

                        {/* Conversion Section */}
                        <div className="space-y-6">
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

                        {/* Product Summary Tabs (Simplified) */}
                        <div className="space-y-4 pt-4 border-t border-zinc-100">
                            <details className="group" open>
                                <summary className="flex items-center justify-between font-black text-[11px] uppercase tracking-widest text-zinc-900 cursor-pointer list-none py-2">
                                    Product Description
                                    <span className="transition-transform group-open:rotate-180">+</span>
                                </summary>
                                <div className="pt-4 text-sm text-zinc-600 leading-relaxed font-medium">
                                    {p.description}
                                </div>
                            </details>

                            <details className="group">
                                <summary className="flex items-center justify-between font-black text-[11px] uppercase tracking-widest text-zinc-900 cursor-pointer list-none py-2">
                                    Delivery Info
                                    <span className="transition-transform group-open:rotate-180">+</span>
                                </summary>
                                <div className="pt-4 text-sm text-zinc-600 leading-relaxed font-medium">
                                    We deliver across Pakistan using TCS and Leopards.
                                    Average delivery time is 3-5 business days.
                                    Cash on delivery is available for all cities.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Related Strategy: Social Proof Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-32 pb-20 border-t border-zinc-100 pt-20">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-black text-zinc-900 mb-2 uppercase tracking-tighter italic">Customers also loved these</h2>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Hand-picked selections based on your style</p>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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

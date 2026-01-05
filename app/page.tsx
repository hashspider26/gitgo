import Link from "next/link";
import { ArrowRight, Leaf, Truck, ShieldCheck, Sprout } from "lucide-react";
import { prisma } from "@/lib/prisma";

function formatPrice(amount: number) {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export const revalidate = 0; // Ensure fresh data on every request

export default async function Home() {
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    take: 4,
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative w-full bg-stone-100 py-20 px-4 md:py-32 dark:bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg className="h-full w-full text-primary" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="mx-auto max-w-6xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sprout className="h-4 w-4" />
            <span>Premium Quality Seeds</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl md:text-6xl dark:text-white mb-6">
            Grow Your Own <span className="text-primary">Green Valley</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-300 mb-8">
            Shop the best quality vegetable seeds, flower seeds, and gardening tools in Pakistan.
            Delivered straight to your doorstep with Cash on Delivery.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:scale-105"
            >
              Shop Now <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-200 bg-white px-8 text-sm font-medium text-zinc-900 shadow-sm transition-colors hover:bg-zinc-50 hover:text-primary dark:border-zinc-800 dark:bg-black dark:text-zinc-100 dark:hover:bg-zinc-900"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-black border-y border-zinc-100 dark:border-zinc-800">
        <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-green-50 rounded-full text-green-600 dark:bg-green-900/20">
              <Leaf className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Organic & Pure</h3>
            <p className="text-zinc-600 text-sm">100% organic seeds sourced from the best farms.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-blue-50 rounded-full text-blue-600 dark:bg-blue-900/20">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Nationwide Delivery</h3>
            <p className="text-zinc-600 text-sm">Fast shipping to all cities in Pakistan via TCS/Leopards.</p>
          </div>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-orange-50 rounded-full text-orange-600 dark:bg-orange-900/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-lg">Quality Guarantee</h3>
            <p className="text-zinc-600 text-sm">High germination rate or your money back.</p>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 px-4 bg-stone-50 dark:bg-zinc-950">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Featured Products</h2>
            <Link href="/shop" className="text-primary hover:underline text-sm font-medium">View All</Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((p: any) => {
                const product = p;
                return (
                  <Link key={product.id} href={`/product/${product.slug}`} className="group block h-full">
                    <div className="rounded-xl border border-zinc-200 bg-white shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-black h-full overflow-hidden flex flex-col">
                      <div className="aspect-square w-full bg-zinc-100 relative overflow-hidden">
                        {(() => {
                          let imageUrl = null;
                          try {
                            const images = product.images ? JSON.parse(product.images) : [];
                            if (Array.isArray(images) && images.length > 0) imageUrl = images[0];
                          } catch (e) { }

                          if (imageUrl) {
                            /* eslint-disable-next-line @next/next/no-img-element */
                            return <img src={imageUrl} alt={product.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />;
                          }
                          return (
                            <div className="absolute inset-0 flex items-center justify-center text-zinc-300 bg-zinc-100">
                              <Sprout className="h-12 w-12" />
                            </div>
                          );
                        })()}
                        {/* Add overlay */}
                        <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-semibold text-zinc-900 dark:text-white group-hover:text-primary mb-1 line-clamp-1">
                          {product.title}
                        </h3>
                        <p className="text-xs text-zinc-500 mb-3">{product.category}</p>
                        <div className="mt-auto flex items-center justify-between">
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-1 rounded-full">
                            In Stock
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="col-span-4 text-center py-12 text-zinc-500">
                No products found. Run seed script!
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

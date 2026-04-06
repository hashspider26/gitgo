import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductList } from "@/components/admin/product-list";

export const revalidate = 0;

export default async function ProductsDashboard() {
    const products = await prisma.product.findMany({
        orderBy: [
            { position: 'asc' },
            { createdAt: 'desc' }
        ]
    });

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-4 sm:p-6">
            <div className="mx-auto max-w-6xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Products</h1>
                    <Link href="/admin/dashboard/products/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                        <Plus className="h-4 w-4" /> Add New Product
                    </Link>
                </div>

                <ProductList initialProducts={products as any} />
            </div>
        </div>
    );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(console.error);
    }, []);

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("Upload failed");

            const data = await res.json();
            setImages((prev) => [...prev, data.url]);
        } catch (error) {
            console.error(error);
            alert("Failed to upload image");
        } finally {
            setUploading(false);
        }
    }

    function removeImage(index: number) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSubmitting(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        // Basic slug generation
        const slug = (data.title as string).toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...data,
                    slug,
                    images: images
                }),
            });

            if (res.ok) {
                router.push("/admin/dashboard/products");
                router.refresh();
            } else {
                alert("Failed to create product");
            }
        } catch (e) {
            console.error(e);
            alert("Error creating product");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-6">
            <div className="mx-auto max-w-2xl">
                <Link href="/admin/dashboard/products" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
                </Link>

                <div className="bg-white dark:bg-black p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h1 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Add New Product</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <input name="title" required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea name="description" required rows={3} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Images</label>
                            <div className="flex flex-wrap gap-4 mb-2">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative w-24 h-24 border rounded-md overflow-hidden bg-zinc-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={url} alt="Product" className="object-cover w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="w-24 h-24 border-2 border-dashed border-zinc-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
                                    {uploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
                                    ) : (
                                        <>
                                            <Upload className="h-6 w-6 text-zinc-400 mb-1" />
                                            <span className="text-xs text-zinc-500">Add Image</span>
                                        </>
                                    )}
                                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Sale Price (PKR)</label>
                                <input name="price" type="number" required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" placeholder="Discounted Price" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Original Price (PKR)</label>
                                <input name="salePrice" type="number" className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" placeholder="Old Price (Optional)" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock</label>
                                <input name="stock" type="number" defaultValue={10} required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-600 font-bold">Advance Payment Discount</label>
                                <div className="flex gap-2">
                                    <input
                                        name="advanceDiscount"
                                        type="number"
                                        defaultValue={0}
                                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                    />
                                    <select
                                        name="advanceDiscountType"
                                        className="w-24 rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                    >
                                        <option value="PKR">PKR</option>
                                        <option value="PERCENT">%</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Delivery Fee (PKR)</label>
                                <input name="deliveryFee" type="number" defaultValue={0} required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Weight (grams)</label>
                                <input name="weight" type="number" defaultValue={0} required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category</label>
                                <select name="category" className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900">
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button type="submit" disabled={submitting} className="w-full mt-4 h-10 rounded-md bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Create Product
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

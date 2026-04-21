
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getRandomizedUrl } from "@/lib/cloudinary";

export default function EditProductPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);

    // Form states
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [salePrice, setSalePrice] = useState("");
    const [stock, setStock] = useState("");
    const [advanceDiscount, setAdvanceDiscount] = useState("0");
    const [advanceDiscountType, setAdvanceDiscountType] = useState("PKR");
    const [weight, setWeight] = useState("");
    const [deliveryFee, setDeliveryFee] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        // Fetch categories
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const res = await fetch(`/api/products/${params.id}`);
                if (!res.ok) throw new Error("Product not found");
                const product = await res.json();

                setTitle(product.title);
                setDescription(product.description);
                setPrice(product.price.toString());
                setSalePrice(product.salePrice ? product.salePrice.toString() : "");
                setStock(product.stock.toString());
                setAdvanceDiscount((product.advanceDiscount || 0).toString());
                setAdvanceDiscountType(product.advanceDiscountType || "PKR");
                setWeight((product.weight || 0).toString());
                setDeliveryFee((product.deliveryFee || 0).toString());
                setCategory(product.category);

                // Parse images safely
                try {
                    const parsedImages = product.images ? JSON.parse(product.images) : [];
                    if (Array.isArray(parsedImages)) setImages(parsedImages);
                } catch (e) {
                    // Fallback if images is not valid JSON
                    setImages([]);
                }

            } catch (error) {
                console.error(error);
                alert("Error loading product");
                router.push("/admin/dashboard/products");
            } finally {
                setLoading(false);
            }
        }
        fetchProduct();
    }, [params.id, router]);

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

            const data = await res.json().catch(() => ({}));

            if (!res.ok) {
                const msg = data?.details || data?.error || "Upload failed";
                throw new Error(msg);
            }

            setImages((prev) => [...prev, data.url]);
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : "Failed to upload image");
        } finally {
            setUploading(false);
        }
    }

    function removeImage(index: number) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`/api/products/${params.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    price: Math.floor(Number(price || "0")),
                    salePrice: salePrice ? Math.floor(Number(salePrice)) : null,
                    stock: Math.floor(Number(stock || "0")),
                    advanceDiscount: Math.floor(Number(advanceDiscount || "0")),
                    advanceDiscountType,
                    weight,
                    deliveryFee,
                    category,
                    images: images // API expects array and stringifies it but let's check API.. 
                    // Wait, APi route says: objects: JSON.stringify(body.images || [])
                    // So we can send the array directly.
                }),
            });

            if (res.ok) {
                router.push("/admin/dashboard/products");
                router.refresh();
            } else {
                alert("Failed to update product");
            }
        } catch (e) {
            console.error(e);
            alert("Error updating product");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50 dark:bg-zinc-950 p-6">
            <div className="mx-auto max-w-2xl">
                <Link href="/admin/dashboard/products" className="inline-flex items-center text-sm text-zinc-500 hover:text-zinc-900 mb-6">
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Products
                </Link>

                <div className="bg-white dark:bg-black p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h1 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">Edit Product</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Title</label>
                            <input
                                value={title} onChange={e => setTitle(e.target.value)}
                                required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea
                                value={description} onChange={e => setDescription(e.target.value)}
                                required rows={3} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Images</label>
                            <div className="flex flex-wrap gap-4 mb-2">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative w-24 h-24 border rounded-md overflow-hidden bg-zinc-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={getRandomizedUrl(url) || ''} alt="Product" className="object-cover w-full h-full" />
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
                                <input
                                    type="number" value={price} onChange={e => setPrice(e.target.value)}
                                    required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                    placeholder="Discounted Price"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Original Price (PKR)</label>
                                <input
                                    type="number" 
                                    value={salePrice} 
                                    onChange={e => setSalePrice(e.target.value)}
                                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                    placeholder="Old Price (Optional)"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Stock</label>
                                <input
                                    type="number" value={stock} onChange={e => setStock(e.target.value)}
                                    required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-600 font-bold">Advance Payment Discount</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={advanceDiscount}
                                        onChange={e => setAdvanceDiscount(e.target.value)}
                                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                        placeholder="0"
                                    />
                                    <select
                                        value={advanceDiscountType}
                                        onChange={e => setAdvanceDiscountType(e.target.value)}
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
                                <label className="text-sm font-medium">Weight (grams)</label>
                                <input
                                    type="number" value={weight} onChange={e => setWeight(e.target.value)}
                                    required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Delivery Fee (PKR)</label>
                                <input
                                    type="number" value={deliveryFee} onChange={e => setDeliveryFee(e.target.value)}
                                    required className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <select
                                value={category} onChange={e => setCategory(e.target.value)}
                                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                {categories.map((c) => (
                                    <option key={c.id} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full mt-4 h-10 rounded-md bg-primary text-white font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            Update Product
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

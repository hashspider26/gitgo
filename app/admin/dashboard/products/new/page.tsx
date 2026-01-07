"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Upload, X } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default function NewProductPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);

    // Form states for validation
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [advanceDiscount, setAdvanceDiscount] = useState("0");
    const [advanceDiscountType, setAdvanceDiscountType] = useState("PKR");

    const isFormValid = title.trim() !== "" &&
        description.trim() !== "" &&
        price !== "" &&
        category !== "" &&
        images.length > 0;

    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => setCategories(data))
            .catch(console.error);
    }, []);

    // Helper to resize image before upload
    async function resizeImage(file: File): Promise<Blob> {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    // Max dimension 1200px
                    const MAX_SIZE = 1200;
                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(blob || file);
                    }, 'image/jpeg', 0.8); // 80% quality JPEG
                };
            };
        });
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return;

        let file: File | Blob = e.target.files[0];

        // Resize if larger than 1MB to stay safe on Vercel Hobby limit
        if (file.size > 1 * 1024 * 1024) {
            setUploading(true);
            file = await resizeImage(e.target.files[0]);
        }

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file, "upload.jpg");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                let errorMessage = "Upload failed";
                let details = "";
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                    details = errorData.details ? `\n\nDetails: ${errorData.details}` : "";
                } catch (e) {
                    errorMessage = `Server Error (${res.status}): ${res.statusText}`;
                    details = "\n\nThis usually means the server crashed before sending JSON. Check Vercel logs.";
                }
                throw new Error(`${errorMessage}${details}`);
            }

            const data = await res.json();
            setImages((prev) => [...prev, data.url]);
        } catch (error: any) {
            console.error(error);
            alert(`Upload Error: ${error.message}`);
        } finally {
            setUploading(false);
        }
    }

    function removeImage(index: number) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!isFormValid) return;

        setSubmitting(true);
        const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const formData = new FormData(e.currentTarget);
        const formObj = Object.fromEntries(formData.entries());

        try {
            const res = await fetch("/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    description,
                    price: Math.floor(Number(price || "0")),
                    stock: Math.floor(Number(formObj.stock as string || "0")),
                    deliveryFee: Math.floor(Number(formObj.deliveryFee as string || "0")),
                    weight: Math.floor(Number(formObj.weight as string || "0")),
                    category,
                    slug,
                    images: images,
                    advanceDiscount: Math.floor(Number(advanceDiscount || "0")),
                    advanceDiscountType
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
                            <label className="text-sm font-medium">Title *</label>
                            <input
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                placeholder="Product Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description *</label>
                            <textarea
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                                rows={3}
                                className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                            />
                        </div>

                        {/* Image Upload Section */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Images * ({images.length} added)</label>
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
                                <label className="text-sm font-medium">Base Price (PKR) *</label>
                                <input
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    type="number"
                                    required
                                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Initial Stock</label>
                                <input name="stock" type="number" defaultValue={10} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-blue-600 dark:text-blue-400 font-bold">Advance Payment Discount</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={advanceDiscount}
                                        onChange={e => setAdvanceDiscount(e.target.value)}
                                        className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 font-bold"
                                    />
                                    <select
                                        value={advanceDiscountType}
                                        onChange={e => setAdvanceDiscountType(e.target.value)}
                                        className="rounded-md border border-zinc-200 px-2 py-2 text-xs focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 font-bold"
                                    >
                                        <option value="PKR">PKR</option>
                                        <option value="PERCENT">%</option>
                                    </select>
                                </div>
                                <p className="text-[10px] text-zinc-400 italic">Example: 50 PKR or 5% off</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Category *</label>
                                <select
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                    required
                                    className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Delivery Fee (PKR)</label>
                                <input name="deliveryFee" type="number" defaultValue={0} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Weight (grams)</label>
                                <input name="weight" type="number" defaultValue={0} className="w-full rounded-md border border-zinc-200 px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-zinc-800 dark:bg-zinc-900" />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !isFormValid}
                            className="w-full mt-6 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-30 disabled:grayscale transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                            {!isFormValid ? "Please fill all fields & add image" : "Create Product"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

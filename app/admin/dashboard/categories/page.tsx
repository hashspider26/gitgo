"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, GripVertical, Save } from "lucide-react";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export const dynamic = 'force-dynamic';

interface Category {
    id: string;
    name: string;
    displayOrder: number;
}

// Sortable Item Component
function SortableCategoryRow({
    cat,
    onDelete,
    deleting
}: {
    cat: Category,
    onDelete: (id: string) => void,
    deleting: string | null
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: cat.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
    };

    return (
        <tr
            ref={setNodeRef}
            style={style}
            className={`group ${isDragging ? 'bg-primary/5 shadow-inner' : ''}`}
        >
            <td className="py-3 px-4 w-10">
                <button
                    {...attributes}
                    {...listeners}
                    style={{ touchAction: 'none' }}
                    className="text-zinc-400 hover:text-primary cursor-grab active:cursor-grabbing p-1"
                >
                    <GripVertical className="h-4 w-4" />
                </button>
            </td>
            <td className="py-3 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 italic">
                {cat.name}
            </td>
            <td className="py-3 px-4 text-right">
                <button
                    onClick={() => onDelete(cat.id)}
                    disabled={deleting === cat.id}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                >
                    {deleting === cat.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </button>
            </td>
        </tr>
    );
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [savingOrder, setSavingOrder] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/categories");
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        setAdding(true);
        setError("");

        try {
            const res = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newCategory }),
            });

            if (res.ok) {
                setNewCategory("");
                fetchCategories();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to add category.");
            }
        } catch (err) {
            setError("Something went wrong");
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category? Any products using this category name will remain, but the category option will be gone.")) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
            if (res.ok) {
                setCategories(prev => prev.filter(c => c.id !== id));
            } else {
                alert("Failed to delete category");
            }
        } catch (err) {
            alert("Error deleting category");
        } finally {
            setDeleting(null);
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = categories.findIndex((c) => c.id === active.id);
            const newIndex = categories.findIndex((c) => c.id === over.id);

            const newCategories = arrayMove(categories, oldIndex, newIndex);
            setCategories(newCategories);

            // Persist the order immediately
            await saveOrder(newCategories);
        }
    };

    const saveOrder = async (orderedCats: Category[]) => {
        setSavingOrder(true);
        try {
            const res = await fetch("/api/categories", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    categoryIds: orderedCats.map(c => c.id)
                }),
            });
            if (!res.ok) throw new Error("Failed to save order");
        } catch (err) {
            console.error(err);
            alert("Failed to save new order to database.");
            // Revert on error
            fetchCategories();
        } finally {
            setSavingOrder(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 pb-20">
            <div className="flex justify-between items-end bg-white/50 dark:bg-zinc-900/50 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-800 backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Categories</h1>
                    <p className="text-zinc-500 font-medium pl-1">Manage and reorder your product categories</p>
                </div>
                {savingOrder && (
                    <div className="flex items-center gap-2 text-xs font-bold text-primary animate-pulse uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                        <Loader2 className="h-3 w-3 animate-spin" /> Saving Order...
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Add Category Form */}
                <div className="md:col-span-4 lg:col-span-3">
                    <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm sticky top-6">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" /> New Category
                        </h2>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 ml-1">Category Name</label>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full rounded-xl border border-zinc-100 bg-zinc-50/50 px-4 py-3 text-sm font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all dark:border-zinc-800 dark:bg-black dark:text-white"
                                    placeholder="e.g. Lawn Seeds"
                                />
                            </div>
                            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                            <button
                                type="submit"
                                disabled={adding || !newCategory.trim()}
                                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50"
                            >
                                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Category"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Categories List */}
                <div className="md:col-span-8 lg:col-span-9 space-y-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                            <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
                            <p className="mt-4 text-sm font-bold text-zinc-400 uppercase tracking-widest">Loading categories...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center p-20 bg-white dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
                            <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">No categories created yet.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-800/20 border-b border-zinc-100 dark:border-zinc-800">
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                    <GripVertical className="h-3 w-3" /> Tip: Drag the handles to reorder
                                </p>
                            </div>
                            <table className="w-full">
                                <thead className="bg-zinc-50/30 dark:bg-zinc-800/10">
                                    <tr>
                                        <th className="w-10"></th>
                                        <th className="text-left py-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Name</th>
                                        <th className="text-right py-4 px-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext
                                            items={categories}
                                            strategy={verticalListSortingStrategy}
                                        >
                                            {categories.map((cat) => (
                                                <SortableCategoryRow
                                                    key={cat.id}
                                                    cat={cat}
                                                    onDelete={handleDelete}
                                                    deleting={deleting}
                                                />
                                            ))}
                                        </SortableContext>
                                    </DndContext>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

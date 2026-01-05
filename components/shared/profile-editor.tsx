"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User as UserIcon, Mail, Phone, MapPin, Save, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ProfileEditorProps {
    user: {
        name?: string | null;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
        city?: string | null;
    };
}

export function ProfileEditor({ user }: ProfileEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
    });
    const router = useRouter();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                setIsEditing(false);
                router.refresh();
                // A full refresh might be needed to update session client-side
                setTimeout(() => window.location.reload(), 500);
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsLoading(false);
        }
    }

    if (!isEditing) {
        return (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                    <h3 className="font-semibold dark:text-zinc-100">Personal Information</h3>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="text-primary hover:text-primary hover:bg-primary/5 rounded-full"
                    >
                        Edit Profile
                    </Button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Full Name</p>
                            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-black rounded-xl border border-transparent dark:border-zinc-800 transition-colors">
                                <UserIcon className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-200 font-medium">{formData.name || "Not set"}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Email Address</p>
                            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-black rounded-xl border border-transparent dark:border-zinc-800 transition-colors opacity-70">
                                <Mail className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-200 font-medium">{user.email}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Phone Number</p>
                            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-black rounded-xl border border-transparent dark:border-zinc-800 transition-colors">
                                <Phone className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-200 font-medium">{formData.phone || "Not provided"}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">Address</p>
                            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-black rounded-xl border border-transparent dark:border-zinc-800 transition-colors">
                                <MapPin className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-200 font-medium">{formData.address || "Not provided"}</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-1">City</p>
                            <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-black rounded-xl border border-transparent dark:border-zinc-800 transition-colors">
                                <MapPin className="h-4 w-4 text-zinc-400" />
                                <span className="text-zinc-700 dark:text-zinc-200 font-medium">{formData.city || "Not provided"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-primary overflow-hidden shadow-xl shadow-primary/5 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
                <h3 className="font-bold text-primary">Edit Personal Info</h3>
                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isLoading}
                        onClick={() => setIsEditing(false)}
                        className="text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full"
                    >
                        <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-white rounded-full px-4"
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-1.5" /> Save Changes</>}
                    </Button>
                </div>
            </div>
            <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Full Name</label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-black focus:ring-primary"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Phone Number</label>
                        <Input
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="0300-1234567"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-black focus:ring-primary"
                        />
                    </div>
                    <div className="sm:col-span-2 space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Address</label>
                        <Input
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            placeholder="Street, City, Country"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-black focus:ring-primary"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">City</label>
                        <Input
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="Lahore"
                            className="rounded-xl border-zinc-200 dark:border-zinc-800 dark:bg-black focus:ring-primary"
                        />
                    </div>
                </div>
            </div>
        </form>
    );
}

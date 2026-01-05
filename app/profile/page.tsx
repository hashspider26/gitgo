import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User as UserIcon, ShieldCheck, ShoppingBag, Sprout } from "lucide-react";
import Link from "next/link";
import { ProfileEditor } from "@/components/shared/profile-editor";

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/login?callbackUrl=/profile");
    }

    const user = session.user;

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Account Settings</h1>
                    <Link href="/shop" className="text-sm font-medium text-primary hover:underline">
                        Return to Shop
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 flex flex-col items-center shadow-sm">
                            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 border-4 border-white dark:border-zinc-800 shadow-inner">
                                <UserIcon className="h-10 w-10" />
                            </div>
                            <h2 className="font-bold text-xl text-center dark:text-zinc-100 truncate w-full">{user.name}</h2>
                            <p className="text-sm text-zinc-500 text-center truncate w-full mt-1 font-medium">{user.email}</p>

                            {user.isAdmin && (
                                <span className="mt-4 inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary border border-primary/20 uppercase tracking-widest">
                                    <ShieldCheck className="mr-1.5 h-3 w-3" /> Admin Access
                                </span>
                            )}
                        </div>

                        <nav className="space-y-2">
                            <Link href="/profile" className="flex items-center gap-3 px-5 py-3.5 text-sm font-bold text-primary bg-primary/5 rounded-2xl transition-all shadow-sm shadow-primary/5">
                                <UserIcon className="h-4.5 w-4.5" /> Personal Settings
                            </Link>
                            <Link href="/orders" className="flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                                <ShoppingBag className="h-4.5 w-4.5" /> Track Orders
                            </Link>
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Interactive Editor */}
                        <ProfileEditor user={user} />

                        {/* Extra Section */}
                        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-3xl p-8 border border-primary/10 relative overflow-hidden group">
                            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500" />
                            <div className="relative">
                                <h3 className="font-bold text-primary text-lg mb-3 flex items-center gap-2">
                                    <Sprout className="h-6 w-6" /> Welcome to Green Valley Seeds!
                                </h3>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
                                    Ready to grow? Keep your shipping information up to date to ensure your seeds reach you as quickly as possible. We&apos;re happy to have you with us.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

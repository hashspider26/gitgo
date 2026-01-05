"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, LogIn, Menu, LogOut, Settings, User as UserIcon, Sprout, ShoppingBag } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CartSheet } from "@/components/cart/cart-sheet";

export function Navbar() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name || "User";
  const userInitial = userName.charAt(0).toUpperCase();
  const isLoading = status === "loading";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-zinc-800 dark:bg-black/60">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary transition-transform hover:scale-105">
          <Sprout className="h-6 w-6" />
          <span className="font-bold sm:inline">Green Valley Seeds</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-600 md:flex dark:text-zinc-300">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
          <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          {!isLoading && (
            <>
              {session ? (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger asChild>
                    <button className="flex items-center gap-2 outline-none">
                      <Avatar className="h-8 w-8 border border-zinc-200 dark:border-zinc-800">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {userInitial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:inline text-sm font-medium text-zinc-700 dark:text-zinc-300">{userName}</span>
                    </button>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-[200px] rounded-xl border border-zinc-200 bg-white p-2 text-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900 animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Account</div>
                    <DropdownMenu.Item asChild>
                      <Link href="/profile" className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none cursor-pointer">
                        <UserIcon className="h-4 w-4" /> My Profile
                      </Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link href="/orders" className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none cursor-pointer">
                        <ShoppingBag className="h-4 w-4" /> My Orders
                      </Link>
                    </DropdownMenu.Item>

                    {session.user.isAdmin && (
                      <>
                        <DropdownMenu.Separator className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                        <div className="px-2 py-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Admin</div>
                        <DropdownMenu.Item asChild>
                          <Link href="/admin/dashboard" className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 outline-none cursor-pointer text-primary">
                            <Settings className="h-4 w-4" /> Dashboard
                          </Link>
                        </DropdownMenu.Item>
                      </>
                    )}

                    <DropdownMenu.Separator className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <DropdownMenu.Item
                      onSelect={() => signOut()}
                      className="flex items-center gap-2 rounded-lg px-2 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 outline-none cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/auth/login" className="hidden sm:inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 transition-colors">
                    Log in
                  </Link>
                  <Link href="/auth/register" className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95">
                    Sign up
                  </Link>
                </div>
              )}
            </>
          )}


          <CartSheet />

          {/* Mobile Menu Toggle */}
          <div className="md:hidden">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button aria-label="Open menu" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900 shadow-sm transition-colors">
                  <Menu className="h-5 w-5" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" sideOffset={8} className="z-50 min-w-[240px] rounded-xl border border-zinc-200 bg-white p-2 text-sm shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
                <DropdownMenu.Item asChild>
                  <Link href="/" className="block rounded-lg px-3 py-3 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Home</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/shop" className="block rounded-lg px-3 py-3 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Shop</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/about" className="block rounded-lg px-3 py-3 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">About Us</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item asChild>
                  <Link href="/contact" className="block rounded-lg px-3 py-3 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800">Contact</Link>
                </DropdownMenu.Item>

                {!session && (
                  <>
                    <DropdownMenu.Separator className="my-1 h-px bg-zinc-100 dark:bg-zinc-800" />
                    <DropdownMenu.Item asChild>
                      <Link href="/auth/login" className="block rounded-lg px-3 py-3 font-medium text-primary hover:bg-primary/5">Log in</Link>
                    </DropdownMenu.Item>
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </header>
  );
}

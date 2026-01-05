"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Sprout, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const registered = searchParams.get("registered") === "true";

  // Redirect if already logged in
  useEffect(() => {
    if (session?.user && !loading) {
      const callbackUrl = searchParams.get("callbackUrl");
      if (callbackUrl && callbackUrl !== "/auth/login" && !callbackUrl.startsWith("/auth/")) {
        router.replace(callbackUrl);
      } else {
        router.replace(session.user.isAdmin ? "/admin/dashboard" : "/profile");
      }
    }
  }, [session, router, searchParams, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        // Need to fetch fresh session to know if admin
        const callbackUrl = searchParams.get("callbackUrl");
        if (callbackUrl && callbackUrl !== "/auth/login") {
          window.location.href = callbackUrl;
        } else {
          // We use window.location to force a full reload and get fresh session
          window.location.href = "/"; // The redirect logic will handle it on next load or we can check session here
        }
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="flex items-center gap-2 mb-6 transition-transform hover:scale-105">
            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <Sprout className="h-6 w-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-primary">Green Valley Seeds</span>
          </Link>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Sign in to manage your account and orders
          </p>
        </div>

        <div className="mt-8 bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl shadow-zinc-200/50 dark:shadow-none sm:rounded-2xl sm:px-10 border border-zinc-200 dark:border-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {registered && !error && (
              <div className="rounded-xl bg-green-50 dark:bg-green-900/10 p-4 text-sm text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/20 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Account created! You can now sign in.
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/10 p-4 text-sm text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/20">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Email address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="rounded-xl h-11 border-zinc-200 dark:border-zinc-800 dark:bg-black focus:ring-primary"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5 flex justify-between">
                Password
                <Link href="#" className="text-xs text-primary hover:underline">Forgot password?</Link>
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="rounded-xl h-11 border-zinc-200 dark:border-zinc-800 dark:bg-black focus:ring-primary"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 flex justify-center rounded-xl text-sm font-semibold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 disabled:opacity-50 transition-all hover:translate-y-[-1px]"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-zinc-900 px-4 text-zinc-500 font-medium">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/auth/register"
                className="flex w-full items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex justify-center min-h-screen items-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>}>
      <LoginContent />
    </Suspense>
  );
}

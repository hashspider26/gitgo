"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <motion.h1
        className="text-4xl font-semibold tracking-tight sm:text-6xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Connect Influencers with Dropshippers
      </motion.h1>
      <motion.p
        className="mx-auto mt-4 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        echauk is the marketplace for creators to curate products and earn, while dropshippers reach new audiences.
      </motion.p>
      <motion.div
        className="mt-8 flex items-center justify-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Button asChild>
          <Link href="/auth/register">Get Started</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/auth/login">Login</Link>
        </Button>
      </motion.div>
    </section>
  );
}



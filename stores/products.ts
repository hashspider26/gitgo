"use client";

import { create } from "zustand";
import { Product } from "@/types";
import { mockProducts } from "@/lib/mock";

type ProductState = {
  products: Product[];
  add: (p: Product) => void;
  update: (p: Product) => void;
  remove: (id: string) => void;
};

export const useProductStore = create<ProductState>((set) => ({
  products: mockProducts,
  add: (p) => set((s) => ({ products: [p, ...s.products] })),
  update: (p) => set((s) => ({ products: s.products.map((x) => (x.id === p.id ? p : x)) })),
  remove: (id) => set((s) => ({ products: s.products.filter((x) => x.id !== id) })),
}));



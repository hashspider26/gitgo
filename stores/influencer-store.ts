"use client";

import { create } from "zustand";
import { InfluencerStore } from "@/types";
import { mockStores } from "@/lib/mock";

type StoreState = {
  stores: InfluencerStore[];
  addProductToStore: (username: string, productId: string) => void;
  removeProductFromStore: (username: string, productId: string) => void;
};

export const useInfluencerStore = create<StoreState>((set) => ({
  stores: mockStores,
  addProductToStore: (username, productId) =>
    set((s) => ({
      stores: s.stores.map((st) =>
        st.username === username && !st.productIds.includes(productId)
          ? { ...st, productIds: [...st.productIds, productId] }
          : st
      ),
    })),
  removeProductFromStore: (username, productId) =>
    set((s) => ({
      stores: s.stores.map((st) =>
        st.username === username
          ? { ...st, productIds: st.productIds.filter((id) => id !== productId) }
          : st
      ),
    })),
}));



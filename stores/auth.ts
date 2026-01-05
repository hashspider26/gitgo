"use client";

import { create } from "zustand";
import { Role, User } from "@/types";

type AuthState = {
  user: User | null;
  setRole: (role: Role | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setRole: (role) =>
    set((state) => ({
      user: role
        ? {
            id: "dev",
            name: role === "influencer" ? "Dev Influencer" : "Dev Dropshipper",
            email: "dev@example.com",
            role,
            username: role === "influencer" ? "dev" : undefined,
          }
        : null,
    })),
}));



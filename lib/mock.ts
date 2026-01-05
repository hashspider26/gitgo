import { Product, User, InfluencerStore, Analytics } from "@/types";

export const mockDropshippers: User[] = [
  { id: "d1", name: "Nova Supply", email: "nova@example.com", role: "dropshipper" },
  { id: "d2", name: "Apex Merch", email: "apex@example.com", role: "dropshipper" },
];

export const mockInfluencers: User[] = [
  { id: "i1", name: "Alex Kim", username: "alex", email: "alex@example.com", role: "influencer", avatarUrl: "/vercel.svg", bio: "Creator in tech & lifestyle.", followers: 120000 },
  { id: "i2", name: "Maya Lee", username: "maya", email: "maya@example.com", role: "influencer", avatarUrl: "/next.svg", bio: "Fashion and wellness.", followers: 85000 },
];

export const mockProducts: Product[] = [
  {
    id: "00000001",
    title: "Ergo Desk Lamp — Adjustable, Minimal, and Designed for Long Work Sessions with Eye‑Care Illumination",
    description:
      "A minimalist LED desk lamp engineered for comfort: adjustable arm, multiple brightness modes, and low‑glare optics to reduce eye strain during extended focus. Built with durable materials, compact footprint, and a soft ambient glow that complements modern desks.",
    image: "https://www.shutterstock.com/image-photo/facial-cosmetic-products-containers-on-600nw-2566963627.jpg",
    price: 24500,
    category: "Home",
    supplierId: "d1",
    supplierName: "Nova Supply",
    rating: 4.6,
    ratingCount: 210,
  },
  {
    id: "00000002",
    title: "Gym Bottle Pro — Insulated Steel Hydration with Secure Lock Lid for Training, Hiking, and Daily Commutes",
    description: "Insulated steel bottle. Lock lid. Textured grip.",
    image: "https://www.shutterstock.com/image-photo/facial-cosmetic-products-containers-on-600nw-2566963627.jpg",
    price: 29,
    category: "Fitness",
    supplierId: "d2",
    supplierName: "Apex Merch",
    rating: 4.2,
    ratingCount: 154,
  },
  {
    id: "00000003",
    title: "Everyday Canvas Tote — Oversized, Reinforced Handles, and Interior Pockets for Laptops, Books, and Groceries",
    description:
      "A versatile carry‑all with sturdy stitching, inner organization pockets, and a flat base so it stands upright. Durable canvas resists tears and scuffs, making it ideal for campus, markets, beach days, or quick errands.",
    image: "https://www.shutterstock.com/image-photo/facial-cosmetic-products-containers-on-600nw-2566963627.jpg",
    price: 19,
    category: "Accessories",
    supplierId: "d1",
    supplierName: "Nova Supply",
    rating: 4.0,
    ratingCount: 97,
  },
  {
    id: "00000004",
    title: "Wireless Noise‑Cancelling Buds — Clear Calls, Deep Bass, and All‑Day Battery with Fast USB‑C Charging",
    description:
      "Experience immersive sound in a compact form. Active noise cancellation, low‑latency mode for videos, sweat‑resistant fit for workouts, and a pocketable case that delivers multiple recharges throughout the day.",
    image: "https://www.shutterstock.com/image-photo/facial-cosmetic-products-containers-on-600nw-2566963627.jpg",
    price: 99,
    category: "Electronics",
    supplierId: "d2",
    supplierName: "Apex Merch",
    rating: 4.8,
    ratingCount: 328,
  },
];

export const mockStores: InfluencerStore[] = [
  { influencerId: "i1", username: "alex", bannerUrl: "", productIds: ["00000001", "00000003"] },
  { influencerId: "i2", username: "maya", bannerUrl: "", productIds: ["00000002"] },
];

export const mockAnalytics: Analytics[] = [
  { productId: "00000001", views: 1200, sales: 84, shares: 50 },
  { productId: "00000002", views: 800, sales: 42, shares: 21 },
  { productId: "00000003", views: 560, sales: 18, shares: 10 },
  { productId: "00000004", views: 1440, sales: 110, shares: 61 },
];

export const testimonials = [
  {
    quote: "echauk made collaborations effortless. I doubled my affiliate revenue.",
    name: "Alex Kim",
    role: "Influencer",
  },
  {
    quote: "We reached new audiences and scaled without extra overhead.",
    name: "Nova Supply",
    role: "Dropshipper",
  },
];

export const faqs = [
  { q: "How does echauk work?", a: "Dropshippers list products, influencers add them to stores, and earn commissions." },
  { q: "Is there a monthly fee?", a: "The core is free during beta; platform fees apply per sale." },
  { q: "When are payouts sent?", a: "Influencer payouts are processed weekly to your connected account." },
];



export type Role = "influencer" | "dropshipper";

export type User = {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  bio?: string;
  socials?: { twitter?: string; instagram?: string; youtube?: string };
  followers?: number; // approximate combined followers across social platforms (mock)
};

export type Product = {
  id: string;
  title: string;
  description: string;
  image: string;
  price: number;
  category: string;
  supplierId: string; // dropshipper user id
  supplierName: string;
  rating?: number; // 0-5 stars
  ratingCount?: number; // total number of ratings
};

export type InfluencerStore = {
  influencerId: string;
  username: string;
  bannerUrl?: string;
  productIds: string[];
};

export type Analytics = {
  productId: string;
  views: number;
  sales: number;
  shares: number;
};



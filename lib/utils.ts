import { type ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number,
  options?: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  }
) {
  const {
    currency = "PKR",
    locale = "en-PK",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    currencyDisplay = "code",
  } = options || {};
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
    currencyDisplay,
  }).format(amount || 0);
}



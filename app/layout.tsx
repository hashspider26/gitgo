import type { Metadata } from "next";
import { Roboto, JetBrains_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { AppProviders } from "@/lib/providers";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { TopLoadingBar } from "@/components/shared/loading";
import { GlobalLinkHandler } from "@/components/shared/global-link-handler";

const geistSans = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Green Valley Seeds | Premium Gardening Store",
  description: "Your trusted online shop for high-quality seeds, gardening tools, and more in Pakistan. Cash on delivery available.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}>
        <AppProviders>
          <GlobalLinkHandler />
          <Suspense fallback={null}>
          <TopLoadingBar />
          </Suspense>
          <Navbar />
          <main className="min-h-[calc(100vh-7rem)]">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}

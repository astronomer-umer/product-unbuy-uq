import type { Metadata } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSeller } from "@/lib/catalog";
import "./globals.css";

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const seller = getSeller();

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:6969",
  ),
  title: {
    default: `${seller.name} · unbuy`,
    template: `%s · ${seller.name}`,
  },
  description: seller.bio,
  keywords: [
    "preloved",
    "sneakers",
    "pakistan",
    seller.handle,
    seller.name,
    "second hand shoes",
  ],
  authors: [{ name: seller.name }],
  openGraph: {
    type: "website",
    title: `${seller.name} · unbuy`,
    description: seller.bio,
    siteName: "unbuy",
  },
  twitter: {
    card: "summary_large_image",
    title: `${seller.name} · unbuy`,
    description: seller.bio,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebas.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
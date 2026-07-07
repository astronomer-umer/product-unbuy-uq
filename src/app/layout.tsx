import type { Metadata } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getActiveSellers } from "@/lib/catalog";
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

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:6969",
  ),
  title: {
    default: "unbuy · Preloved, on purpose",
    template: "%s · unbuy",
  },
  description:
    "A curated marketplace for preloved goods. Real sellers, real photos, no noise.",
  keywords: [
    "preloved",
    "secondhand",
    "marketplace",
    "pakistan",
    "vintage",
    "sneakers",
    "thrift",
  ],
  openGraph: {
    type: "website",
    title: "unbuy · Preloved, on purpose",
    description:
      "A curated marketplace for preloved goods. Real sellers, real photos, no noise.",
    siteName: "unbuy",
  },
  twitter: {
    card: "summary_large_image",
    title: "unbuy · Preloved, on purpose",
    description:
      "A curated marketplace for preloved goods. Real sellers, real photos, no noise.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sellers = await getActiveSellers();
  return (
    <html
      lang="en"
      className={`${inter.variable} ${bebas.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <SiteHeader sellers={sellers} />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
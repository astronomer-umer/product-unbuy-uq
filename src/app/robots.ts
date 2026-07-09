import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://unbuy-store.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // Block every crawler from /admin and the auth API entirely.
        // These routes have no public-facing content — only login
        // redirects and authenticated data.
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/admin", "/api/", "/messages", "/login", "/register"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
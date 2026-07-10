import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://unbuy-store.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          // Auth + private — not indexable
          "/admin/",
          "/admin",
          "/api/",
          "/messages",
          "/login",
          "/register",
        ],
      },
      // Explicitly allow the OG-image proxy and sitemap through.
      { userAgent: "*", allow: ["/uploads/"], disallow: [] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
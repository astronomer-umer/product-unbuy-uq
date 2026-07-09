// Fetches the real IG profile picture URL for a handle, downloads it,
// writes it to /public/uploads/, and updates the seller's logoUrl in DB.
// The image is served locally (no IG CDN dependency on the seller page).

import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

const HANDLE = process.argv[2] || "shoemonkey.pk2";
const UPLOADS = path.join(process.cwd(), "public", "uploads");

async function getProfilePicUrl(handle: string): Promise<string | null> {
  // Try web_profile_info first
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(handle)}`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "application/json",
          "x-ig-app-id": "936619743392459",
        },
      },
    );
    if (res.ok) {
      const j = (await res.json()) as {
        data?: { user?: { profile_pic_url?: string; profile_pic_url_hd?: string } };
      };
      const u = j?.data?.user;
      const hd = u?.profile_pic_url_hd ?? u?.profile_pic_url ?? null;
      if (hd) return hd;
    }
  } catch {
    // fall through
  }

  // OG image fallback
  try {
    const res = await fetch(`https://www.instagram.com/${handle}/?hl=en`, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
    });
    if (res.ok) {
      const html = await res.text();
      const m = html.match(
        /<meta\s+property="og:image"\s+content="([^"]+)"/i,
      );
      if (m && m[1]) return m[1];
    }
  } catch {
    // ignore
  }
  return null;
}

async function downloadToUploads(url: string): Promise<string> {
  await mkdir(UPLOADS, { recursive: true });
  const filename = `logo-${Date.now()}-${randomBytes(6).toString("hex")}.jpg`;
  const dest = path.join(UPLOADS, filename);
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: "https://www.instagram.com/",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return `/uploads/${filename}`;
}

async function main() {
  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });

  const picUrl = await getProfilePicUrl(HANDLE);
  if (!picUrl) {
    console.error("could not get profile pic URL");
    process.exit(1);
  }
  console.log(`profile pic URL: ${picUrl.slice(0, 100)}...`);

  const localPath = await downloadToUploads(picUrl);
  console.log(`downloaded to: ${localPath}`);

  const seller = await p.seller.findUnique({
    where: { slug: "shoemonkey" },
  });
  if (!seller) {
    console.error("Shoe Monkey PK not found");
    process.exit(1);
  }

  await p.seller.update({
    where: { id: seller.id },
    data: { logoUrl: localPath },
  });
  console.log("✓ saved logoUrl to DB");

  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
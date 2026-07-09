// Downloads a specific image URL via Chromium (cookies + signed-URL
// support) and writes it locally. Use when you have the exact CDN URL
// and just need the bytes on disk + the path written to Seller.logoUrl.

import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { writeFileSync } from "node:fs";
import path from "node:path";

// Usage: tsx scripts/download-and-set-logo.ts <imageUrl>
const url = process.argv[2];
if (!url) {
  console.error("usage: tsx scripts/download-and-set-logo.ts <imageUrl>");
  process.exit(1);
}
console.log(`target: ${url.slice(0, 100)}...`);

const UPLOADS = path.join(process.cwd(), "public", "uploads");

async function main() {
  // Build a tiny local HTML page that requests the image; intercept the
  // response so we capture the actual bytes that the browser got.
  const htmlPath = path.join(process.cwd(), "scripts", "_logo-fetch.html");
  writeFileSync(
    htmlPath,
    `<!doctype html><html><head><meta charset="utf-8"><title>fetch</title></head>
<body style="margin:0;background:#fff">
  <img id="x" src="${url}" referrerpolicy="no-referrer" crossorigin="anonymous" style="display:block">
  <script>
    window.__imgLoaded = false;
    document.getElementById('x').addEventListener('load', () => { window.__imgLoaded = true; });
    document.getElementById('x').addEventListener('error', () => { window.__imgLoaded = 'error'; });
  </script>
</body></html>`,
  );

  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-US",
  });
  const page = await ctx.newPage();

  let imageBuf: Buffer | null = null;
  let imageMime = "image/jpeg";
  page.on("response", async (resp) => {
    if (imageBuf !== null) return;
    if (resp.url() !== url) return;
    try {
      imageBuf = await resp.body();
      const ct = (resp.headers()["content-type"] ?? "").toLowerCase();
      if (ct.includes("png")) imageMime = "image/png";
      else if (ct.includes("webp")) imageMime = "image/webp";
    } catch {
      // ignore
    }
  });

  const fileUrl = `file://${htmlPath.replace(/\\/g, "/")}`;
  await page.goto(fileUrl, { waitUntil: "load", timeout: 30000 });
  try {
    await page.waitForFunction(
      () => (window as { __imgLoaded?: unknown }).__imgLoaded === true,
      undefined,
      { timeout: 20000 },
    );
  } catch {
    // ignore — could be cross-origin or other
  }
  await page.waitForTimeout(2000);
  await browser.close();

  if (!imageBuf) {
    console.error("could not capture bytes for that URL");
    process.exit(1);
  }

  console.log(`captured ${imageBuf.byteLength} bytes of ${imageMime}`);
  const ext = imageMime.includes("png")
    ? "png"
    : imageMime.includes("webp")
      ? "webp"
      : "jpg";
  const filename = `logo-real-${Date.now()}.${ext}`;
  const dest = path.join(UPLOADS, filename);
  writeFileSync(dest, imageBuf);
  const localPath = `/uploads/${filename}`;
  console.log(`saved to ${localPath}`);

  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });
  const seller = await p.seller.findUnique({
    where: { slug: "shoemonkey" },
  });
  if (!seller) {
    console.error("seller not found");
    process.exit(1);
  }
  await p.seller.update({
    where: { id: seller.id },
    data: { logoUrl: localPath },
  });
  console.log("✓ logoUrl replaced");

  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
// Loads the IG profile in Chromium (which has the right cookies), then
// forces the browser to fetch a specific image URL by injecting an
// <img> with the same referrer as a normal IG profile-page navigation.
// Captures the response body and saves it locally + updates Seller.logoUrl.

import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { writeFileSync } from "node:fs";
import path from "node:path";

const HANDLE = "shoemonkey.pk2";
const PROFILE_URL = `https://www.instagram.com/${HANDLE}/?hl=en`;
const TARGET = process.argv[2];
if (!TARGET) {
  console.error("usage: tsx scripts/set-logo-from-url.ts <imageUrl>");
  process.exit(1);
}

const UPLOADS = path.join(process.cwd(), "public", "uploads");

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-US",
  });
  const page = await ctx.newPage();

  let imageBuf: Buffer | null = null;
  let imageMime = "image/jpeg";

  page.on("response", async (resp) => {
    if (imageBuf !== null) return;
    if (resp.url() !== TARGET) return;
    try {
      imageBuf = await resp.body();
      const ct = (resp.headers()["content-type"] ?? "").toLowerCase();
      if (ct.includes("png")) imageMime = "image/png";
      else if (ct.includes("webp")) imageMime = "image/webp";
    } catch {
      // ignore
    }
  });

  // First load IG so we get cookies + an active session for the
  // cdn.instagram.com / fbcdn.net referrer/token checks.
  await page.goto(PROFILE_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.waitForTimeout(3000);

  // Now inject an <img> with the requested URL. Because we're on an
  // IG origin, the browser sends the right Referer + cookies for IG CDN
  // tokens.
  await page.evaluate((u) => {
    const img = document.createElement("img");
    img.id = "__target";
    img.src = u;
    img.style.display = "block";
    document.body.appendChild(img);
  }, TARGET);

  // Wait for the img load event (scripted by us)
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        const img = document.getElementById("__target") as HTMLImageElement | null;
        if (!img) return resolve();
        if (img.complete && img.naturalWidth > 0) return resolve();
        img.addEventListener("load", () => resolve());
        img.addEventListener("error", () => resolve());
        setTimeout(() => resolve(), 8000);
      }),
  );
  await page.waitForTimeout(2000);

  await browser.close();

  if (!imageBuf) {
    console.error("could not capture bytes for that URL");
    process.exit(1);
  }

  const buf: Buffer = imageBuf;
  console.log(`captured ${buf.byteLength} bytes of ${imageMime}`);
  const ext = imageMime.includes("png")
    ? "png"
    : imageMime.includes("webp")
      ? "webp"
      : "jpg";
  const filename = `logo-real-${Date.now()}.${ext}`;
  const dest = path.join(UPLOADS, filename);
  writeFileSync(dest, buf);
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
  console.log("✓ logoUrl replaced on Shoe Monkey PK");

  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
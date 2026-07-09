// Loads the IG profile in Chromium and intercepts the actual image
// response that IG renders into the page (the profile avatar inside
// the user header). Cookies are real, signed URL works.

import { chromium } from "playwright";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { writeFileSync } from "node:fs";
import path from "node:path";

const HANDLE = "shoemonkey.pk2";
const URL = `https://www.instagram.com/${HANDLE}/?hl=en`;
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
  let imageSource = "";

  page.on("response", async (resp) => {
    if (imageBuf !== null) return;
    const u = resp.url();
    const ct = (resp.headers()["content-type"] ?? "").toLowerCase();
    if (
      u.startsWith("https://scontent.cdninstagram.com/") &&
      ct.startsWith("image/") &&
      !u.includes("/v/t51.293-") // skip story thumbnails (~150x150)
    ) {
      try {
        const buf = await resp.body();
        if (buf.byteLength < 1000) return; // skip tiny icons
        imageBuf = buf;
        imageMime = ct;
        imageSource = u;
      } catch (e) {
        // ignore
      }
    }
  });

  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
  // Wait for the page to render the profile header (image loads inside it)
  await page.waitForTimeout(5000);

  // Force a re-fetch of profile image elements by scrolling
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(2500);

  await browser.close();

  if (!imageBuf) {
    console.error("no image bytes captured");
    process.exit(1);
  }

  const buf: Buffer = imageBuf;
  console.log(`captured ${buf.byteLength} bytes of ${imageMime} from ${imageSource.slice(0, 100)}...`);
  const ext = imageMime.includes("png")
    ? "png"
    : imageMime.includes("webp")
      ? "webp"
      : "jpg";
  const filename = `logo-${Date.now()}.${ext}`;
  const dest = path.join(UPLOADS, filename);
  writeFileSync(dest, buf);
  const localPath = `/uploads/${filename}`;
  console.log(`saved to ${localPath}`);

  const adapter = new PrismaLibSql({
    url: process.env.DATABASE_URL!,
    authToken: process.env.TURSO_TOKEN!,
  });
  const p = new PrismaClient({ adapter });
  const seller = await p.seller.findUnique({ where: { slug: "shoemonkey" } });
  if (!seller) {
    console.error("seller not found");
    process.exit(1);
  }
  await p.seller.update({
    where: { id: seller.id },
    data: { logoUrl: localPath },
  });
  console.log("✓ seller.logoUrl updated");

  await p.$disconnect();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
// Loads IG profile in Chromium and extracts the og:image URL.
// Parses the HTML string in Node (not page.evaluate) to avoid the
// esbuild/Playwright __name helper incompatibility.

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const HANDLE = process.argv[2] || "shoemonkey.pk2";
const URL = `https://www.instagram.com/${HANDLE}/?hl=en`;

async function main() {
  console.log(`▶ launching chromium...`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-US",
  });
  const page = await ctx.newPage();

  console.log(`▶ navigating to ${URL}`);
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3500);

  // Pull the raw HTML out via page.content() — Playwright serializes the
  // DOM as a string. No function-callback shim, so no __name issue.
  const html = await page.content();
  await browser.close();

  // Pull og:image + og:image:secure_url out of the response HTML.
  const grab = (re: RegExp) => {
    const m = html.match(re);
    return m && m[1] ? m[1] : "";
  };
  const ogImage =
    grab(/<meta\s+property="og:image:secure_url"\s+content="([^"]+)"/i) ||
    grab(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  const ogImageAlt = grab(/<meta\s+property="og:image:alt"\s+content="([^"]*)"/i);

  console.log("\n─── Result ───────────");
  console.log("ogImage:    ", ogImage);
  console.log("ogImageAlt: ", ogImageAlt);

  writeFileSync(
    "scripts/ig-logo.json",
    JSON.stringify(
      {
        handle: HANDLE,
        capturedAt: new Date().toISOString(),
        logoUrl: ogImage,
        alt: ogImageAlt,
      },
      null,
      2,
    ),
  );
  console.log("\n✓ saved to scripts/ig-logo.json");
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
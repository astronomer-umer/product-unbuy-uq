// IG profile scraper for shoemonkey.pk2
// Loads the profile in a real Chromium browser, scrolls to collect posts,
// extracts image URLs + captions + timestamps. Saves to scripts/ig-dump.json
// for the importer to consume.
//
// Single-use tool, not part of the running app. Run: pnpm tsx scripts/scrape-ig.ts

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const HANDLE = "shoemonkey.pk2";
const URL = `https://www.instagram.com/${HANDLE}/?hl=en`;
const MAX_POSTS = 50;

type Post = {
  shortcode: string;
  url: string;        // instagram.com/p/...
  imageUrl: string;
  caption: string;
  timestamp: string;
  likes: number;
  comments: number;
  isVideo: boolean;
};

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

  // Wait for at least one post anchor
  try {
    await page.waitForSelector('a[href^="/p/"]', { timeout: 20000 });
  } catch {
    console.log("⚠ no posts visible on first load — IG may be showing login wall");
  }

  // Scroll the page to load more posts (IG lazy-loads)
  console.log("▶ scrolling to load posts...");
  let lastCount = 0;
  let stableRounds = 0;
  const seenShortcodes = new Set<string>();

  for (let round = 0; round < 30; round++) {
    // IG uses window._sharedData / additionalData only sometimes; rely on rendered DOM
    const links = await page.$$eval(
      'a[href^="/' + HANDLE + '/p/"], a[href*="/p/"]',
      (as) => as.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""),
    );

    for (const href of links) {
      const m = href.match(/\/p\/([A-Za-z0-9_-]+)/);
      if (m && m[1]) seenShortcodes.add(m[1]);
    }

    const totalCount = seenShortcodes.size;
    console.log(`  round ${round}: ${totalCount} unique posts`);

    if (totalCount >= MAX_POSTS) break;
    if (totalCount === lastCount) {
      stableRounds++;
      if (stableRounds >= 4) break;
    } else {
      stableRounds = 0;
    }
    lastCount = totalCount;

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);
  }

  const shortcodes = Array.from(seenShortcodes).slice(0, MAX_POSTS);
  console.log(`▶ found ${shortcodes.length} posts, visiting each...`);

  const posts: Post[] = [];
  for (let i = 0; i < shortcodes.length; i++) {
    const sc = shortcodes[i];
    const postUrl = `https://www.instagram.com/p/${sc}/?hl=en`;
    try {
      const p = await ctx.newPage();
      await p.goto(postUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await p.waitForTimeout(2000);

      const data = await p.evaluate(() => {
        // Try to extract from meta tags + embed data
        const og = document.querySelector('meta[property="og:image"]');
        const ogTitle = document.querySelector('meta[property="og:title"]');
        const ogDesc = document.querySelector('meta[property="og:description"]');
        const articleTime = document.querySelector(
          'meta[property="article:published_time"]',
        );
        const ogVideo = document.querySelector('meta[property="og:video"]');
        return {
          image: (og as HTMLMetaElement | null)?.content ?? "",
          title: (ogTitle as HTMLMetaElement | null)?.content ?? "",
          desc: (ogDesc as HTMLMetaElement | null)?.content ?? "",
          ts: (articleTime as HTMLMetaElement | null)?.content ?? "",
          video: (ogVideo as HTMLMetaElement | null)?.content ?? "",
        };
      });

      posts.push({
        shortcode: sc,
        url: postUrl,
        imageUrl: data.video || data.image,
        caption: data.desc || data.title,
        timestamp: data.ts,
        likes: 0,
        comments: 0,
        isVideo: !!data.video,
      });
      await p.close();
    } catch (e) {
      console.log(`  ⚠ failed ${sc}: ${(e as Error).message}`);
    }
    if ((i + 1) % 10 === 0) {
      console.log(`  ${i + 1}/${shortcodes.length} done`);
    }
    await page.waitForTimeout(800);
  }

  await browser.close();

  writeFileSync(
    "scripts/ig-dump.json",
    JSON.stringify({ handle: HANDLE, capturedAt: new Date().toISOString(), posts }, null, 2),
  );

  console.log(`\n✓ ${posts.length} posts saved to scripts/ig-dump.json`);
  console.log(`  first post: ${posts[0]?.url}`);
  console.log(`  image sample: ${posts[0]?.imageUrl?.slice(0, 80)}...`);
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
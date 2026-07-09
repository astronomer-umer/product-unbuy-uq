// Loads shoemonkey.pk2 IG profile in Chromium and extracts the
// live-rendered profile data: bio, full name, IG handle, counts.
//
// IG renders profile data into the DOM only after JavaScript runs.
// The og:description meta tag only carries the footer suffix
// ("X Followers, Y Following, Z Posts - See Instagram photos and
// videos from @handle"), not the actual bio — so we pull from the DOM.

import { chromium } from "playwright";
import { writeFileSync } from "node:fs";

const HANDLE = process.argv[2] || "shoemonkey.pk2";
const URL = `https://www.instagram.com/${HANDLE}/?hl=en`;

type Profile = {
  username: string;
  fullName: string;
  biography: string;
  externalUrl: string | null;
  followers: number;
  follows: number;
  posts: number;
  isBusiness: boolean;
};

async function main() {
  console.log(`▶ launching chromium...`);
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 1280, height: 1400 },
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    locale: "en-US",
  });
  const page = await ctx.newPage();

  console.log(`▶ navigating to ${URL}`);
  await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 45000 });

  // Wait for either the profile header or the login wall
  try {
    await page.waitForSelector("header, section, main", {
      timeout: 15000,
    });
  } catch {
    // continue anyway
  }
  await page.waitForTimeout(3000);

  // Pull everything we need from the rendered DOM via server-side
  // fetch of the profile API (works if we're in a logged-out but
  // IG-recognized session).
  const apiData = await page.evaluate(async (handle) => {
    const url =
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=` +
      encodeURIComponent(handle);
    try {
      const r = await fetch(url, {
        headers: {
          Accept: "application/json",
          "x-ig-app-id": "936619743392459",
        },
      });
      if (!r.ok) return null;
      const j = await r.json();
      return j?.data?.user ?? null;
    } catch {
      return null;
    }
  }, HANDLE);

  let profile: Profile;

  if (apiData && typeof apiData === "object") {
    const u = apiData as Record<string, unknown>;
    profile = {
      username: String(u.username ?? HANDLE),
      fullName: String(u.full_name ?? ""),
      biography: String(u.biography ?? ""),
      externalUrl:
        typeof u.external_url === "string" && u.external_url
          ? u.external_url
          : null,
      followers: Number(u.follower_count ?? 0),
      follows: Number(u.following_count ?? 0),
      posts: Number(u.media_count ?? 0),
      isBusiness: Boolean(u.is_business_account ?? false),
    };
  } else {
    // Fallback: scrape the rendered DOM
    console.log("⚠ API failed, falling back to DOM scrape");
    const dom = await page.evaluate(() => {
      const grab = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? el.textContent?.trim() ?? "" : "";
      };
      const grabAll = (sel: string) =>
        Array.from(document.querySelectorAll(sel))
          .map((el) => el.textContent?.trim() ?? "")
          .filter(Boolean);
      const headerSection = document.querySelector("header section, main section");
      return {
        fullName: grab("header h2, h1, h2"),
        meta: grabAll('meta[property="og:description"]').join("|"),
        bioCandidate: grabAll('section span, section div[dir="auto"]').slice(0, 6),
      };
    });
    const m = dom.meta.match(
      /([\d,]+)\s+Followers,\s+([\d,]+)\s+Following,\s+([\d,]+)\s+Posts/,
    );
    profile = {
      username: HANDLE,
      fullName: dom.fullName,
      biography: dom.bioCandidate.find((s) => s.length > 20) ?? "",
      externalUrl: null,
      followers: m ? parseInt(m[1].replace(/,/g, ""), 10) : 0,
      follows: m ? parseInt(m[2].replace(/,/g, ""), 10) : 0,
      posts: m ? parseInt(m[3].replace(/,/g, ""), 10) : 0,
      isBusiness: false,
    };
  }

  console.log("\n─── Result ───────────");
  console.log(JSON.stringify(profile, null, 2));

  writeFileSync(
    "scripts/ig-profile.json",
    JSON.stringify(
      { handle: HANDLE, capturedAt: new Date().toISOString(), profile },
      null,
      2,
    ),
  );
  console.log("\n✓ saved to scripts/ig-profile.json");
  await browser.close();
}

main().catch((e) => {
  console.error("ERR:", e.message);
  process.exit(1);
});
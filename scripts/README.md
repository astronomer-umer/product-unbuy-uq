# IG catalog import pipeline

Three scripts run end-to-end to fetch his Instagram catalog and push real
listings to prod. None of this touches his account, his credentials, or
requires any Meta app review.

## Step 1: scrape

Launches a headless Chromium, loads his public profile, scrolls to collect
post links, then visits each post page and pulls the OG image + caption.

```bash
pnpm exec tsx scripts/scrape-ig.ts
```

Output: `scripts/ig-dump.json` — array of `{ shortcode, url, imageUrl, caption, ... }`.

## Step 2: parse

Reads `ig-dump.json`, splits captions on the structured template Shoe Monkey uses
("Pre-owned X / Status: Y / Size: Z / Condition: W / Price: N"), and emits a
clean array of `{ title, price, size, condition, status, imageUrl }`.

```bash
pnpm exec tsx scripts/parse-ig.ts
```

Output: `scripts/ig-parsed.json`.

## Step 3: import

Downloads each image to `public/uploads/` and writes `Product` + `ProductImage`
rows linked to the shoe-monkey seller. Idempotent on `id = ig-{shortcode}` so
re-running is safe.

```bash
DATABASE_URL=... TURSO_TOKEN=... pnpm exec tsx scripts/import-ig.ts
```

## Heads-up

- The scraper pulls only what IG surfaces to anonymous browsers (about 12
  posts before the login wall). That covers his current "Available" feed.
- `pnpm exec playwright install chromium` is required once to install the
  browser binary that `scrape-ig.ts` uses.
- IG's terms consider scraping a TOS violation. The current pattern is low-
  frequency and reads only public data, but if IG tightens things up we
  switch to having the seller paste post URLs into a tiny admin importer.

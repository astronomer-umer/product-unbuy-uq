// Parses the structured IG captions that Shoe Monkey posts follow.
// Caption format observed:
//   Pre-owned <Brand> <Model>
//   Status: Available | Reserved | Sold
//   Size: US 11.5 | UK 10.5 | EUR 46 | 29CM
//   Condition: Premium+ | Premium | Like New | Excellent | Good
//   Price: 15500
//   DM to place the order ...

import { readFileSync, writeFileSync } from "node:fs";

type Raw = {
  shortcode: string;
  url: string;
  imageUrl: string;
  caption: string;
  timestamp: string;
  isVideo: boolean;
};

type Parsed = {
  shortcode: string;
  url: string;
  imageUrl: string;
  title: string;       // brand + model, e.g. "Asics GEL-UPCOURT 4"
  description: string; // the raw caption (will be lightly edited)
  status: "AVAILABLE" | "RESERVED" | "SOLD";
  size: string | null;
  condition: string | null;
  price: number;
};

function cleanCaption(raw: string): string {
  // Strip the IG-envelope ("X likes, Y comments - handle on Mon DD, YYYY:")
  return raw.replace(
    /^\s*\d+\s+likes?,\s+\d+\s+comments?\s*-\s+\S+\s+on\s+\S+\s+\d+,\s+\d{4}:\s*"?/,
    "",
  ).replace(/"?\s*$/, "");
}

function parseSize(s: string): string {
  // Compact: "US 11.5 | UK 10.5 | EUR 46 | 29CM"
  return s.replace(/\s+/g, " ").trim();
}

function parseItem(raw: Raw): Parsed | null {
  const caption = cleanCaption(raw.caption);
  if (!caption) return null;
  const lines = caption.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // First line: "Pre-owned <Brand> <Model...>"
  const headerLine = lines.find((l) => /pre-owned/i.test(l)) ?? lines[0];
  const title = headerLine.replace(/^pre-?owned\s*/i, "").trim();
  if (!title) return null;

  // Structured key:value lines
  const get = (key: string) => {
    const line = lines.find((l) => new RegExp(`^${key}\\s*:?\\s*`, "i").test(l));
    return line ? line.replace(new RegExp(`^${key}\\s*:?\\s*`, "i"), "").trim() : "";
  };

  const statusRaw = get("Status").toLowerCase();
  const status: Parsed["status"] =
    statusRaw.includes("sold") ? "SOLD" :
    statusRaw.includes("reserved") ? "RESERVED" : "AVAILABLE";

  const size = get("Size") || null;
  const condition = get("Condition") || null;
  const priceMatch = get("Price").match(/\d[\d,]*\d|\d/);
  const price = priceMatch ? parseInt(priceMatch[0].replace(/,/g, ""), 10) : 0;

  return {
    shortcode: raw.shortcode,
    url: raw.url,
    imageUrl: raw.imageUrl,
    title,
    description: caption.trim(),
    status,
    size: size ? parseSize(size) : null,
    condition,
    price,
  };
}

const data = JSON.parse(readFileSync("scripts/ig-dump.json", "utf8"));
const items: Parsed[] = [];
for (const p of data.posts as Raw[]) {
  const parsed = parseItem(p);
  if (parsed && parsed.price > 0 && parsed.title) {
    items.push(parsed);
  }
}

console.log(`total posts: ${data.posts.length}`);
console.log(`parsed cleanly: ${items.length}`);
console.log("");
for (const it of items.slice(0, 6)) {
  console.log("───");
  console.log("title:   ", it.title);
  console.log("price:   ", it.price, "PKR");
  console.log("size:    ", it.size);
  console.log("cond:    ", it.condition);
  console.log("status:  ", it.status);
}

writeFileSync("scripts/ig-parsed.json", JSON.stringify({ items }, null, 2));
console.log(`\n✓ ${items.length} items saved to scripts/ig-parsed.json`);
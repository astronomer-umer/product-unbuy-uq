import { readFileSync } from "node:fs";
const data = JSON.parse(readFileSync("scripts/ig-dump.json", "utf8"));
console.log(`handle: ${data.handle}`);
console.log(`posts: ${data.posts.length}`);
console.log("");
for (const p of data.posts.slice(0, 5)) {
  console.log("───");
  console.log("shortcode:", p.shortcode);
  console.log("url:      ", p.url);
  console.log("ts:       ", p.timestamp);
  console.log("imageUrl: ", (p.imageUrl ?? "").slice(0, 90));
  console.log("caption:  ", (p.caption ?? "").slice(0, 200));
}

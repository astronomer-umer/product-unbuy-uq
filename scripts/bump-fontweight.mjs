// One-shot sweep: bump font-medium → font-semibold in all .tsx under src/
// Run: node scripts/bump-fontweight.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (p.endsWith(".tsx") || p.endsWith(".ts")) out.push(p);
  }
  return out;
}

const root = "src";
let changed = 0;
for (const f of walk(root)) {
  const orig = readFileSync(f, "utf8");
  // Only bump where it appears as a Tailwind utility, leave imports alone
  const next = orig.replace(/(?<![A-Za-z0-9_-])font-medium(?![A-Za-z0-9_-])/g, "font-semibold");
  if (next !== orig) {
    writeFileSync(f, next);
    changed++;
    console.log("patched: " + f);
  }
}
console.log("done, " + changed + " files changed");
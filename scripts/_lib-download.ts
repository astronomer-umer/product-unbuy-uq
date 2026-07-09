// Downloads a remote image to /public/uploads/ and returns the local
// /uploads/<file> path.

import { writeFile, mkdir } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";

const UPLOADS = path.join(process.cwd(), "public", "uploads");

export async function downloadToUploads(
  url: string,
  prefix = "img",
): Promise<string> {
  await mkdir(UPLOADS, { recursive: true });
  const ext = /\.(\w{2,5})(?:\?|$)/.test(url)
    ? `.${(RegExp.$1 ?? "jpg").toLowerCase()}`
    : ".jpg";
  const filename = `${prefix}-${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const dest = path.join(UPLOADS, filename);
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
      Referer: "https://www.instagram.com/",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return `/uploads/${filename}`;
}
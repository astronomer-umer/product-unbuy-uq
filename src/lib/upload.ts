import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

export type UploadResult = { url: string } | { error: string };

export async function saveUpload(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: `Unsupported image type: ${file.type}` };
  }
  if (file.size > MAX_BYTES) {
    return { error: `Image too large (max 10 MB)` };
  }

  const ext = file.type === "image/png"
    ? ".png"
    : file.type === "image/webp"
    ? ".webp"
    : file.type === "image/gif"
    ? ".gif"
    : ".jpg";

  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(uploadsDir, filename), buffer);

  return { url: `/uploads/${filename}` };
}
import { writeFile, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const UPLOADS_DIR = path.join(process.cwd(), "public", "uploads");

// Magic bytes for image formats we accept. This stops attackers from uploading
// e.g. an .html renamed to .jpg — we verify the file is actually an image
// before saving it.
const MAGIC: Array<{ ext: string; bytes: number[] }> = [
  { ext: "jpg", bytes: [0xff, 0xd8, 0xff] },
  { ext: "png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  { ext: "gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  // WebP: "RIFF....WEBP"
];

function detectExt(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (
    buf[0] === 0xff &&
    buf[1] === 0xd8 &&
    buf[2] === 0xff
  ) {
    return "jpg";
  }
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  ) {
    return "png";
  }
  if (
    buf[0] === 0x47 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x38
  ) {
    return "gif";
  }
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "webp";
  }
  return null;
}

export type UploadResult = { url: string } | { error: string };

export async function saveUpload(file: File): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: `Unsupported image type: ${file.type || "unknown"}` };
  }
  if (file.size > MAX_BYTES) {
    return { error: `Image too large (max 10 MB)` };
  }
  if (file.size === 0) {
    return { error: "Empty file" };
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectExt(buf);
  if (!ext) {
    return { error: "File does not look like a real image" };
  }

  // Ensure uploads directory exists and is writable
  await mkdir(UPLOADS_DIR, { recursive: true });
  try {
    const st = await stat(UPLOADS_DIR);
    if (!st.isDirectory()) return { error: "Uploads path is not a directory" };
  } catch {
    return { error: "Uploads directory unavailable" };
  }

  // Filename: timestamp + 16 random hex chars. No user input ever hits the
  // filesystem path.
  const filename = `${Date.now()}-${randomBytes(16).toString("hex")}.${ext}`;
  const dest = path.join(UPLOADS_DIR, filename);

  // Defense in depth: verify resolved path is inside UPLOADS_DIR.
  const resolved = path.resolve(dest);
  if (!resolved.startsWith(path.resolve(UPLOADS_DIR) + path.sep)) {
    return { error: "Invalid path" };
  }

  await writeFile(resolved, buf);

  return { url: `/uploads/${filename}` };
}
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const FEED_MEDIA_MAX_BYTES = 10 * 1024 * 1024;

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);
const VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

export type SavedMedia = { url: string; type: "image" | "video" };

export function mediaKind(mime: string): "image" | "video" | null {
  if (IMAGE_TYPES.has(mime)) return "image";
  if (VIDEO_TYPES.has(mime)) return "video";
  return null;
}

const EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
  "video/mp4": ".mp4",
  "video/webm": ".webm",
};

export async function saveFeedMedia(
  buffer: Buffer,
  mime: string,
  subdir: "feed" | "profile",
): Promise<SavedMedia> {
  const kind = mediaKind(mime);
  if (!kind) throw new Error("invalid_type");
  if (buffer.length > FEED_MEDIA_MAX_BYTES) throw new Error("too_large");

  const ext = EXT[mime] ?? (kind === "image" ? ".jpg" : ".mp4");
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });
  const name = `${randomUUID()}${ext}`;
  await writeFile(path.join(dir, name), buffer);
  return { url: `/uploads/${subdir}/${name}`, type: kind };
}

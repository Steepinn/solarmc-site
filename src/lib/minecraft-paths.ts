import { readFile } from "fs/promises";
import path from "path";

export type UserCacheEntry = { name: string; uuid: string; expiresOn?: string };

export function getServerRoot(): string | null {
  const explicit =
    process.env.MINECRAFT_SERVER_PATH?.trim() ||
    process.env.SOLAR_MC_SERVER_PATH?.trim();
  if (explicit) return explicit;
  return null;
}

export function getAdvancementsDir(): string | null {
  const dir = process.env.MINECRAFT_ADVANCEMENTS_DIR?.trim();
  if (dir) return dir;
  const root = getServerRoot();
  if (!root) return null;
  return path.join(root, "world", "advancements");
}

export function getDatapacksDir(): string | null {
  const dir = process.env.MINECRAFT_DATAPACKS_DIR?.trim();
  if (dir) return dir;
  const root = getServerRoot();
  if (!root) return null;
  return path.join(root, "world", "datapacks");
}

export function getUsercachePath(): string | null {
  const file = process.env.MINECRAFT_USERCACHE?.trim();
  if (file) return file;
  const root = getServerRoot();
  if (!root) return null;
  return path.join(root, "usercache.json");
}

let cacheAt = 0;
let cacheEntries: UserCacheEntry[] = [];

export async function loadUsercache(): Promise<UserCacheEntry[]> {
  const file = getUsercachePath();
  if (!file) return [];
  try {
    const raw = await readFile(file, "utf8");
    const data = JSON.parse(raw) as UserCacheEntry[];
    cacheEntries = Array.isArray(data) ? data : [];
    cacheAt = Date.now();
    return cacheEntries;
  } catch {
    return cacheEntries;
  }
}

export async function uuidByMcNick(nick: string): Promise<string | null> {
  const n = nick.trim().toLowerCase();
  if (!n) return null;
  const list =
    Date.now() - cacheAt < 30_000 ? cacheEntries : await loadUsercache();
  const hit = list.find((e) => e.name.toLowerCase() === n);
  return hit?.uuid ?? null;
}

export async function mcNickByUuid(uuid: string): Promise<string | null> {
  const id = uuid.trim().toLowerCase();
  const list =
    Date.now() - cacheAt < 30_000 ? cacheEntries : await loadUsercache();
  const hit = list.find((e) => e.uuid.toLowerCase() === id);
  return hit?.name ?? null;
}

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

const FILE = path.join(process.cwd(), "data", "site-users.json");

export type SiteUserRecord = {
  discordId: string;
  username: string;
  mcNick?: string;
  avatar?: string;
  lastSeenAt: string;
};

type Store = Record<string, SiteUserRecord>;

async function readStore(): Promise<Store> {
  try {
    return JSON.parse(await readFile(FILE, "utf8")) as Store;
  } catch {
    return {};
  }
}

async function writeStore(store: Store) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function upsertSiteUser(input: {
  discordId: string;
  username: string;
  mcNick?: string | null;
  avatar?: string | null;
}) {
  const store = await readStore();
  const prev = store[input.discordId];
  store[input.discordId] = {
    discordId: input.discordId,
    username: input.username || prev?.username || input.discordId,
    mcNick: input.mcNick?.trim() || prev?.mcNick,
    avatar: input.avatar || prev?.avatar,
    lastSeenAt: new Date().toISOString(),
  };
  await writeStore(store);
  return store[input.discordId];
}

export async function listSiteUsers(): Promise<SiteUserRecord[]> {
  const store = await readStore();
  return Object.values(store).sort(
    (a, b) => Date.parse(b.lastSeenAt) - Date.parse(a.lastSeenAt),
  );
}

export async function getSiteUserByDiscordId(discordId: string) {
  const store = await readStore();
  return store[discordId] ?? null;
}

export async function getSiteUserBySlug(slug: string) {
  const q = decodeURIComponent(slug).trim().toLowerCase();
  if (!q) return null;
  const store = await readStore();
  for (const u of Object.values(store)) {
    if (u.discordId === q) return u;
    if (u.mcNick?.toLowerCase() === q) return u;
    if (u.username.toLowerCase() === q) return u;
  }
  return null;
}

export function profilePath(user: { mcNick?: string; discordId: string; username?: string }) {
  const slug = user.mcNick?.trim() || user.username?.trim() || user.discordId;
  return `/u/${encodeURIComponent(slug)}`;
}

import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type SiteBlock = {
  discordId: string;
  reason: string;
  blockedBy: string;
  blockedByName: string;
  blockedAt: string;
};

type Store = Record<string, SiteBlock>;

const FILE = path.join(process.cwd(), "data", "site-blocks.json");

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

export async function isUserBlocked(discordId: string) {
  const store = await readStore();
  return Boolean(store[discordId]);
}

export async function getUserBlock(discordId: string) {
  const store = await readStore();
  return store[discordId] ?? null;
}

export async function blockUser(input: {
  discordId: string;
  reason?: string;
  blockedBy: string;
  blockedByName: string;
}) {
  const store = await readStore();
  const item: SiteBlock = {
    discordId: input.discordId,
    reason: input.reason?.trim() || "Нарушение правил",
    blockedBy: input.blockedBy,
    blockedByName: input.blockedByName,
    blockedAt: new Date().toISOString(),
  };
  store[input.discordId] = item;
  await writeStore(store);
  return item;
}

export async function unblockUser(discordId: string) {
  const store = await readStore();
  if (!store[discordId]) return false;
  delete store[discordId];
  await writeStore(store);
  return true;
}

export async function listBlockedUsers() {
  const store = await readStore();
  return Object.values(store).sort(
    (a, b) => Date.parse(b.blockedAt) - Date.parse(a.blockedAt),
  );
}

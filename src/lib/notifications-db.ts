import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type SiteNotification = {
  id: string;
  /** discordId получателя; null = staff / all */
  userId: string | null;
  audience: "user" | "staff" | "all";
  title: string;
  body: string;
  href: string;
  createdAt: string;
  readBy: string[];
};

type Store = { notifications: SiteNotification[] };

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "notifications.json");

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<Store> {
  await ensureDataDir();
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return { notifications: parsed.notifications ?? [] };
  } catch {
    return { notifications: [] };
  }
}

async function writeStore(store: Store) {
  await ensureDataDir();
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function createNotification(input: {
  audience: "user" | "staff" | "all";
  userId?: string | null;
  title: string;
  body: string;
  href: string;
}) {
  const store = await readStore();
  const item: SiteNotification = {
    id: randomUUID(),
    audience: input.audience,
    userId: input.audience === "user" ? (input.userId ?? null) : null,
    title: input.title.trim(),
    body: input.body.trim(),
    href: input.href,
    createdAt: new Date().toISOString(),
    readBy: [],
  };
  store.notifications.unshift(item);
  // храним последние 300
  store.notifications = store.notifications.slice(0, 300);
  await writeStore(store);
  return item;
}

export async function getNotificationsForUser(input: {
  discordId: string;
  isStaff: boolean;
}) {
  const store = await readStore();
  return store.notifications
    .filter((n) => {
      if (n.audience === "all") return true;
      if (n.audience === "staff") return input.isStaff;
      return n.userId === input.discordId;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function markNotificationsRead(
  discordId: string,
  ids?: string[],
) {
  const store = await readStore();
  for (const n of store.notifications) {
    if (ids && !ids.includes(n.id)) continue;
    if (!n.readBy.includes(discordId)) {
      n.readBy.push(discordId);
    }
  }
  await writeStore(store);
}

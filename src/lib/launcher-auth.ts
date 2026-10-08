import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type { SessionUser } from "@/lib/types";

const FILE = path.join(process.cwd(), "data", "launcher-devices.json");
const TTL_MS = 1000 * 60 * 10;

export type LauncherDeviceRecord = {
  device: string;
  status: "pending" | "ok" | "error";
  createdAt: number;
  completedAt?: number;
  error?: string;
  nick?: string;
  discordId?: string;
  username?: string;
  avatar?: string;
};

type Store = Record<string, LauncherDeviceRecord>;

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

function prune(store: Store): Store {
  const now = Date.now();
  const next: Store = {};
  for (const [k, v] of Object.entries(store)) {
    if (now - v.createdAt < TTL_MS) next[k] = v;
  }
  return next;
}

export async function createLauncherDevice(device: string) {
  const id = device.trim();
  if (!id || id.length < 8 || id.length > 128) {
    throw new Error("invalid_device");
  }
  const store = prune(await readStore());
  store[id] = {
    device: id,
    status: "pending",
    createdAt: Date.now(),
  };
  await writeStore(store);
  return store[id];
}

export async function completeLauncherDevice(
  device: string,
  user: SessionUser,
  nick: string,
) {
  const id = device.trim();
  const store = prune(await readStore());
  const prev = store[id];
  if (!prev) {
    store[id] = {
      device: id,
      status: "ok",
      createdAt: Date.now(),
      completedAt: Date.now(),
      nick,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
    };
  } else {
    store[id] = {
      ...prev,
      status: "ok",
      completedAt: Date.now(),
      error: undefined,
      nick,
      discordId: user.discordId,
      username: user.username,
      avatar: user.avatar,
    };
  }
  await writeStore(store);
  return store[id];
}

export async function failLauncherDevice(device: string, error: string) {
  const id = device.trim();
  const store = prune(await readStore());
  const prev = store[id] ?? {
    device: id,
    status: "pending" as const,
    createdAt: Date.now(),
  };
  store[id] = {
    ...prev,
    status: "error",
    completedAt: Date.now(),
    error,
  };
  await writeStore(store);
  return store[id];
}

export async function getLauncherDevice(device: string) {
  const id = device.trim();
  if (!id) return null;
  const store = prune(await readStore());
  await writeStore(store);
  return store[id] ?? null;
}

export function parseLauncherState(state: string | null): string | null {
  if (!state) return null;
  if (!state.startsWith("launcher:")) return null;
  const device = state.slice("launcher:".length).trim();
  return device || null;
}

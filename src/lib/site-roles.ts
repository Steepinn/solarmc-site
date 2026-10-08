import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { setMemberWhitelist, syncSiteRolesToDiscord } from "@/lib/discord-bot";
import type { ProjectRoleKey } from "@/lib/roles";

const FILE = path.join(process.cwd(), "data", "site-roles.json");

type Store = Record<string, ProjectRoleKey[]>;

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

export async function getSiteRoleKeys(discordId: string): Promise<ProjectRoleKey[]> {
  const store = await readStore();
  return store[discordId] ?? [];
}

export async function setSiteRoleKeys(discordId: string, roles: ProjectRoleKey[]) {
  const store = await readStore();
  const unique = [...new Set(roles)];
  if (unique.length === 0) {
    delete store[discordId];
  } else {
    store[discordId] = unique;
  }
  await writeStore(store);
  await syncSiteRolesToDiscord(discordId, unique);
  return unique;
}

export async function grantPlayerPass(discordId: string) {
  const current = await getSiteRoleKeys(discordId);
  const next: ProjectRoleKey[] = current.includes("player")
    ? current
    : [...current, "player"];
  const store = await readStore();
  store[discordId] = next;
  await writeStore(store);
  await setMemberWhitelist(discordId, true);
  return next;
}

export async function revokePlayerPass(discordId: string) {
  const current = await getSiteRoleKeys(discordId);
  const next = current.filter((k) => k !== "player");
  const store = await readStore();
  if (next.length === 0) {
    delete store[discordId];
  } else {
    store[discordId] = next;
  }
  await writeStore(store);
  await setMemberWhitelist(discordId, false);
  return next;
}

export async function listSiteRoleUsers() {
  const store = await readStore();
  return Object.entries(store).map(([discordId, roles]) => ({ discordId, roles }));
}

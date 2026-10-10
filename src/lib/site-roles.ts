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

/** Есть запись в site-roles — проходку считаем по сайту, не только по Discord. */
export async function isSiteRolesTracked(discordId: string): Promise<boolean> {
  const store = await readStore();
  return Object.prototype.hasOwnProperty.call(store, discordId);
}

/** Проходка: player на сайте; иначе Discord, если роли не ведутся на сайте. */
export function resolveHasWhitelist(opts: {
  siteKeys: ProjectRoleKey[];
  siteTracked: boolean;
  discordApproved: boolean;
}): boolean {
  if (opts.siteKeys.includes("player")) return true;
  if (opts.siteTracked) return false;
  return opts.discordApproved;
}

export async function setSiteRoleKeys(discordId: string, roles: ProjectRoleKey[]) {
  const store = await readStore();
  const unique = [...new Set(roles)];
  store[discordId] = unique;
  await writeStore(store);
  await syncSiteRolesToDiscord(discordId, unique);
  await setMemberWhitelist(discordId, unique.includes("player"));
  return unique;
}

export async function grantPlayerPass(discordId: string) {
  const current = await getSiteRoleKeys(discordId);
  const withoutStranger = current.filter((k) => k !== "stranger");
  const next: ProjectRoleKey[] = withoutStranger.includes("player")
    ? withoutStranger
    : [...withoutStranger, "player"];
  const store = await readStore();
  store[discordId] = next;
  await writeStore(store);
  await syncSiteRolesToDiscord(discordId, next);
  await setMemberWhitelist(discordId, true);
  return next;
}

export async function revokePlayerPass(discordId: string) {
  const current = await getSiteRoleKeys(discordId);
  const next = current.filter((k) => k !== "player");
  const store = await readStore();
  store[discordId] = next;
  await writeStore(store);
  await syncSiteRolesToDiscord(discordId, next);
  await setMemberWhitelist(discordId, false);
  return next;
}

export async function listSiteRoleUsers() {
  const store = await readStore();
  return Object.entries(store).map(([discordId, roles]) => ({ discordId, roles }));
}

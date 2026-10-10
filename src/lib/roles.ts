import rolesConfig from "@/config/roles.json";
import { discordConfig } from "@/lib/bot-config";

export type ProjectRoleKey = keyof typeof rolesConfig;

export type ProjectRole = {
  key: ProjectRoleKey;
  label: string;
  color: string;
};

const entries = Object.entries(rolesConfig) as [
  ProjectRoleKey,
  { id: string | null; label: string; color: string },
][];

export const projectRoles: Record<
  ProjectRoleKey,
  { id: string | null; label: string; color: string }
> = rolesConfig;

/** Discord role ID для ключа (Player = проходка / whitelist). */
export function discordRoleIdForKey(key: ProjectRoleKey): string | null {
  if (key === "player") return discordConfig.approvedRoleId;
  if (key === "stranger") {
    const fromEnv = discordConfig.strangerRoleId?.trim();
    if (fromEnv) return fromEnv;
  }
  const id = projectRoles[key]?.id;
  return id?.trim() ? id : null;
}

export function roleKeysToProjectRoles(keys: ProjectRoleKey[]): ProjectRole[] {
  return keys.map((key) => ({
    key,
    label: projectRoles[key]?.label ?? key,
    color: projectRoles[key]?.color ?? "#9ca3af",
  }));
}

export function resolveUserProjectRoles(memberRoleIds: string[]): ProjectRole[] {
  const found: ProjectRole[] = [];
  for (const [key] of entries) {
    const id = discordRoleIdForKey(key);
    if (id && memberRoleIds.includes(id)) {
      found.push({
        key,
        label: projectRoles[key].label,
        color: projectRoles[key].color,
      });
    }
  }
  return found;
}

export function mergeProjectRoles(
  siteKeys: ProjectRoleKey[],
  discordRoles: ProjectRole[],
): ProjectRole[] {
  const byKey = new Map<ProjectRoleKey, ProjectRole>();
  for (const r of roleKeysToProjectRoles(siteKeys)) byKey.set(r.key, r);
  for (const r of discordRoles) if (!byKey.has(r.key)) byKey.set(r.key, r);
  return [...byKey.values()];
}

export function roleIdsFromKeys(keys: ProjectRoleKey[]): string[] {
  return keys
    .map((k) => discordRoleIdForKey(k))
    .filter((id): id is string => Boolean(id));
}

export function allRoleIds(): string[] {
  const ids = new Set<string>();
  for (const [key] of entries) {
    const id = discordRoleIdForKey(key);
    if (id) ids.add(id);
  }
  return [...ids];
}

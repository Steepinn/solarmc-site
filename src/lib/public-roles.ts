import { fetchGuildMemberByBot, memberFlags } from "@/lib/auth";
import {
  mergeProjectRoles,
  resolveUserProjectRoles,
  type ProjectRole,
} from "@/lib/roles";
import { getSiteRoleKeys } from "@/lib/site-roles";

/** Роли для публичного профиля (сайт + Discord). */
export async function getPublicProjectRoles(discordId: string): Promise<{
  roles: ProjectRole[];
  hasWhitelist: boolean;
}> {
  const [siteKeys, member] = await Promise.all([
    getSiteRoleKeys(discordId),
    fetchGuildMemberByBot(discordId),
  ]);
  const discordRoles = member ? resolveUserProjectRoles(member.roles) : [];
  const roles = mergeProjectRoles(siteKeys, discordRoles);
  const flags = member ? memberFlags(member.roles) : { hasWhitelist: false };
  return {
    roles,
    hasWhitelist: siteKeys.includes("player") || flags.hasWhitelist,
  };
}

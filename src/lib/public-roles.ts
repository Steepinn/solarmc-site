import { fetchGuildMemberByBot, memberFlags } from "@/lib/auth";
import {
  mergeProjectRoles,
  resolveUserProjectRoles,
  type ProjectRole,
} from "@/lib/roles";
import {
  getSiteRoleKeys,
  isSiteRolesTracked,
  resolveHasWhitelist,
} from "@/lib/site-roles";

/** Роли для публичного профиля (сайт + Discord). */
export async function getPublicProjectRoles(discordId: string): Promise<{
  roles: ProjectRole[];
  hasWhitelist: boolean;
}> {
  const [siteKeys, siteTracked, member] = await Promise.all([
    getSiteRoleKeys(discordId),
    isSiteRolesTracked(discordId),
    fetchGuildMemberByBot(discordId),
  ]);
  const discordRoles = member ? resolveUserProjectRoles(member.roles) : [];
  const roles = mergeProjectRoles(siteKeys, discordRoles);
  const flags = member ? memberFlags(member.roles) : { hasWhitelist: false };
  return {
    roles,
    hasWhitelist: resolveHasWhitelist({
      siteKeys,
      siteTracked,
      discordApproved: flags.hasWhitelist,
    }),
  };
}

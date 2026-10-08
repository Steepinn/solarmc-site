import {
  loadPlayerAdvancementsByDiscordId,
  loadPlayerAdvancementsByMcNick,
  loadPlayerAdvancementsByUuid,
} from "@/lib/minecraft-advancements";
import { mcNickByUuid, uuidByMcNick } from "@/lib/minecraft-paths";
import { getSiteUserBySlug, type SiteUserRecord } from "@/lib/site-users";
import { uuidByDiscordId } from "@/lib/spsolards-db";

export type PublicProfile = {
  slug: string;
  displayName: string;
  username: string;
  mcNick: string | null;
  discordId: string | null;
  avatar: string | null;
  siteUser: SiteUserRecord | null;
};

export async function resolvePublicProfile(slugRaw: string): Promise<PublicProfile | null> {
  const slug = decodeURIComponent(slugRaw).trim();
  if (!slug) return null;

  const siteUser = await getSiteUserBySlug(slug);
  if (siteUser) {
    let mcNick = siteUser.mcNick?.trim() || null;
    if (!mcNick) {
      const uuid = await uuidByDiscordId(siteUser.discordId);
      if (uuid) mcNick = (await mcNickByUuid(uuid)) ?? null;
    }
    return {
      slug: mcNick || siteUser.username || siteUser.discordId,
      displayName: mcNick || siteUser.username,
      username: siteUser.username,
      mcNick,
      discordId: siteUser.discordId,
      avatar: siteUser.avatar ?? null,
      siteUser,
    };
  }

  const uuid = await uuidByMcNick(slug);
  if (uuid) {
    const nick = (await mcNickByUuid(uuid)) ?? slug;
    return {
      slug: nick,
      displayName: nick,
      username: nick,
      mcNick: nick,
      discordId: null,
      avatar: null,
      siteUser: null,
    };
  }

  return null;
}

export async function loadAdvancementsForProfile(profile: PublicProfile) {
  // discordId → SPSolards links → uuid надёжнее, чем только ник
  if (profile.discordId) {
    const byDiscord = await loadPlayerAdvancementsByDiscordId(profile.discordId);
    if (byDiscord.uuid) return byDiscord;
  }
  if (profile.mcNick) {
    return loadPlayerAdvancementsByMcNick(profile.mcNick);
  }
  return {
    total: 0,
    byCategory: {},
    items: [],
    source: "empty" as const,
    uuid: null as string | null,
    mcNick: null as string | null,
  };
}

export async function loadAdvancementsByUuid(uuid: string) {
  return loadPlayerAdvancementsByUuid(uuid);
}

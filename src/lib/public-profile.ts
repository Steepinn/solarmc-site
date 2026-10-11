import {
  loadPlayerAdvancementsByDiscordId,
  loadPlayerAdvancementsByMcNick,
  loadPlayerAdvancementsByUuid,
} from "@/lib/minecraft-advancements";
import { mcNickByUuid, uuidByMcNick } from "@/lib/minecraft-paths";
import {
  getSiteUserByDiscordId,
  getSiteUserBySlug,
  type SiteUserRecord,
} from "@/lib/site-users";
import { MC_NICK_RE, discordIdByMcNick } from "@/lib/solards-links";
import { discordIdByUuid, uuidByDiscordId } from "@/lib/spsolards-db";

export type PublicProfile = {
  slug: string;
  displayName: string;
  username: string;
  mcNick: string | null;
  discordId: string | null;
  avatar: string | null;
  siteUser: SiteUserRecord | null;
};

async function profileFromMcNick(
  nickRaw: string,
  discordIdHint?: string | null,
): Promise<PublicProfile | null> {
  const nick = nickRaw.trim();
  if (!MC_NICK_RE.test(nick)) return null;

  let discordId = discordIdHint?.trim() || null;
  if (!discordId) discordId = await discordIdByMcNick(nick);

  const uuid = await uuidByMcNick(nick);
  if (uuid && !discordId) {
    discordId = await discordIdByUuid(uuid);
  }

  let siteUser: SiteUserRecord | null = null;
  if (discordId) {
    siteUser = await getSiteUserByDiscordId(discordId);
  }

  const canonicalNick = uuid ? ((await mcNickByUuid(uuid)) ?? nick) : nick;

  return {
    slug: canonicalNick,
    displayName: canonicalNick,
    username: siteUser?.username ?? canonicalNick,
    mcNick: canonicalNick,
    discordId: siteUser?.discordId ?? discordId,
    avatar: siteUser?.avatar ?? null,
    siteUser,
  };
}

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

  const byNick = await profileFromMcNick(slug);
  if (byNick) return byNick;

  return null;
}

export async function loadAdvancementsForProfile(profile: PublicProfile) {
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

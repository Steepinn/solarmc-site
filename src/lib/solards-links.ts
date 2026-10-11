import { fetchGuildMemberByBot } from "./auth";
import { getSiteUserByDiscordId } from "@/lib/site-users";
import { uuidByDiscordId } from "@/lib/spsolards-db";
import { mcNickByUuid } from "@/lib/minecraft-paths";
import { solardsFetch } from "@/lib/solards-client";

export const MC_NICK_RE = /^[A-Za-z0-9_]{3,16}$/;

type SolardsLinkResponse = {
  linked?: boolean;
  mcNick?: string;
  accounts?: { nick?: string }[];
};

/** MC-ник по Discord: site-users → SPSolards DB → usercache → HTTP API → Discord nick. */
export async function resolveMcNickForDiscord(
  discordId: string,
  discordNick?: string | null,
) {
  const site = await getSiteUserByDiscordId(discordId);
  if (site?.mcNick?.trim() && MC_NICK_RE.test(site.mcNick.trim())) {
    return site.mcNick.trim();
  }

  const uuid = await uuidByDiscordId(discordId);
  if (uuid) {
    const fromCache = await mcNickByUuid(uuid);
    if (fromCache?.trim() && MC_NICK_RE.test(fromCache.trim())) {
      return fromCache.trim();
    }
  }

  const link = await solardsFetch<SolardsLinkResponse>(
    `/api/link/discord/${encodeURIComponent(discordId)}`,
    2500,
  );
  if (link?.mcNick?.trim() && MC_NICK_RE.test(link.mcNick.trim())) {
    return link.mcNick.trim();
  }
  const first = link?.accounts?.find((a) => a.nick && MC_NICK_RE.test(a.nick.trim()));
  if (first?.nick?.trim()) return first.nick.trim();

  if (discordNick?.trim() && MC_NICK_RE.test(discordNick.trim())) {
    return discordNick.trim();
  }

  const member = await fetchGuildMemberByBot(discordId);
  if (member?.nick?.trim() && MC_NICK_RE.test(member.nick.trim())) {
    return member.nick.trim();
  }

  return null;
}

type BalanceLookup = {
  discordId?: string;
  discord_id?: string;
};

/** Discord ID по MC-нику через SOLARDS (если игрок привязал /dslink). */
export async function discordIdByMcNick(nick: string): Promise<string | null> {
  const n = nick.trim();
  if (!MC_NICK_RE.test(n)) return null;
  const data = await solardsFetch<BalanceLookup>(
    `/api/balance/player/${encodeURIComponent(n)}`,
    2500,
  );
  const id = data?.discordId ?? data?.discord_id;
  return id?.trim() || null;
}

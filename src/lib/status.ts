import { fetchDiscordAdminSnapshot, fetchDiscordServerStatus } from "./discord-status";
import { fetchMinecraftPing } from "./minecraft-ping";
import { solardsFetch, type SolardsStatusResponse } from "./solards-client";
import { botConfig, discordConfig, serverConfig } from "./bot-config";
import type { ServerStatus } from "./types";

export { botConfig, discordConfig, serverConfig };

export async function fetchServerStatus(): Promise<ServerStatus> {
  const [discord, ping] = await Promise.all([
    fetchDiscordServerStatus(),
    fetchMinecraftPing(),
  ]);

  if (discord && ping) {
    return {
      online: ping.online && discord.online,
      players: {
        online: Math.max(discord.players.online, ping.players.online),
        max: ping.players.max || discord.players.max,
        list: discord.players.list?.length
          ? discord.players.list
          : ping.players.list ?? [],
      },
      tps: ping.tps,
      version: ping.version,
      maintenance: discord.maintenance,
      source: "discord",
    };
  }

  if (discord) return discord;
  if (ping) return ping;

  const solards = await trySolardsStatus();
  if (solards) return solards;

  return {
    online: false,
    players: { online: 0, max: 0, list: [] },
    source: "offline",
  };
}

async function trySolardsStatus(): Promise<ServerStatus | null> {
  const data = await solardsFetch<SolardsStatusResponse>("/api/status", 4000);
  if (!data) return null;
  return parseSolardsResponse(data);
}

function parseSolardsResponse(data: SolardsStatusResponse): ServerStatus {
  const list = data.players?.list ?? data.player_list ?? [];
  const online =
    !data.maintenance &&
    (data.status === "online" || data.online === true);

  return {
    online,
    players: {
      online: Number(data.players?.online ?? data.online_players ?? 0),
      max: Number(data.players?.max ?? data.max_players ?? 0),
      list,
    },
    tps: data.tps != null ? Number(data.tps) : undefined,
    version: data.version ? String(data.version) : undefined,
    source: "solards",
  };
}

export async function fetchAdminOverview() {
  const discord = await fetchDiscordAdminSnapshot();
  if (discord) return discord;

  return solardsFetch<import("./solards-client").SolardsAdminOverview>(
    "/api/admin/overview",
    2000,
  );
}

export async function fetchBaltop(limit = 10) {
  const { fetchBaltopFromDiscordExport } = await import("./discord-balance");
  const fromDiscord = await fetchBaltopFromDiscordExport(limit);
  if (fromDiscord?.entries.length) return fromDiscord;

  return solardsFetch<import("./solards-client").SolardsBaltopResponse>(
    `/api/baltop?limit=${limit}`,
    4000,
  );
}

export async function fetchBalanceByDiscord(discordId: string) {
  const { fetchBalanceFromDiscordExport } = await import("./discord-balance");
  const fromDiscord = await fetchBalanceFromDiscordExport(discordId);
  if (fromDiscord) return fromDiscord;

  return solardsFetch<import("./solards-client").SolardsBalanceResponse>(
    `/api/balance/discord/${discordId}`,
    4000,
  );
}

export async function fetchBalanceByNick(nick: string) {
  const { fetchBalanceFromDiscordExport } = await import("./discord-balance");
  const fromDiscord = await fetchBalanceFromDiscordExport(undefined, nick);
  if (fromDiscord) return fromDiscord;

  return solardsFetch<import("./solards-client").SolardsBalanceResponse>(
    `/api/balance/player/${encodeURIComponent(nick)}`,
    4000,
  );
}

export { solardsFetch } from "./solards-client";

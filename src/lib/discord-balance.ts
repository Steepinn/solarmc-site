import botSync from "@/config/bot-sync.json";
import { discordBotHeaders, discordFetch } from "./discord-api";
import type { SolardsBalanceResponse, SolardsBaltopResponse } from "./solards-client";

type BankExport = {
  v: number;
  at: number;
  symbol: string;
  ok: boolean;
  top: { r: number; p: string; b: number }[];
  discord: Record<string, { n: string; b: number | null; c: boolean }>;
  nick: Record<string, { b: number; c: boolean }>;
};

type DiscordMessage = {
  attachments?: { filename: string; url: string }[];
};

let cache: { data: BankExport; at: number } | null = null;
const CACHE_MS = 45_000;

function bankChannelId(): string {
  return (
    process.env.DISCORD_BANK_CHANNEL_ID?.trim() ||
    botSync.channels.status?.trim() ||
    ""
  );
}

export async function fetchBankExportFromDiscord(): Promise<BankExport | null> {
  if (cache && Date.now() - cache.at < CACHE_MS) {
    return cache.data;
  }

  const channelId = bankChannelId();
  if (!channelId) return null;

  const messages = await discordFetch<DiscordMessage[]>(
    `/channels/${channelId}/messages?limit=15`,
    5000,
  );
  if (!messages?.length) return null;

  const headers = discordBotHeaders();
  if (!headers) return null;

  for (const msg of messages) {
    const att = msg.attachments?.find((a) => a.filename === "solarmc-bank.json");
    if (!att?.url) continue;

    try {
      const res = await fetch(att.url, {
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as BankExport;
      if (data?.v !== 1) continue;
      cache = { data, at: Date.now() };
      return data;
    } catch {
      /* next message */
    }
  }

  return null;
}

export async function fetchBalanceFromDiscordExport(
  discordId?: string,
  nick?: string,
): Promise<SolardsBalanceResponse | null> {
  const data = await fetchBankExportFromDiscord();
  if (!data?.ok) return null;

  if (discordId && data.discord[discordId]) {
    const p = data.discord[discordId];
    return {
      linked: true,
      player: p.n,
      balance: p.b,
      hasCell: p.c,
      symbol: data.symbol,
      spmoney: true,
    };
  }

  const key = nick?.trim();
  if (key && data.nick[key]) {
    const p = data.nick[key];
    return {
      linked: Boolean(discordId),
      player: key,
      balance: p.b,
      hasCell: p.c,
      symbol: data.symbol,
      spmoney: true,
    };
  }

  return null;
}

export async function fetchBaltopFromDiscordExport(
  limit = 10,
): Promise<SolardsBaltopResponse | null> {
  const data = await fetchBankExportFromDiscord();
  if (!data?.ok) return null;

  return {
    symbol: data.symbol,
    available: true,
    entries: data.top.slice(0, limit).map((e) => ({
      rank: e.r,
      player: e.p,
      balance: e.b,
    })),
  };
}

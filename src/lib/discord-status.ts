import { discordConfig } from "./bot-config";
import { discordFetch } from "./discord-api";
import { fetchMinecraftPing } from "./minecraft-ping";
import type { ServerStatus } from "./types";

type DiscordMessage = {
  id: string;
  embeds?: {
    title?: string;
    description?: string;
    color?: number;
  }[];
  components?: {
    type: number;
    components?: {
      type: number;
      custom_id?: string;
      options?: { label: string; value: string }[];
    }[];
  }[];
};

function parseStatusEmbed(description: string) {
  const online =
    description.includes("Сервер онлайн") && !description.includes("Сервер недоступен");
  const maintenance = description.includes("техработ");
  const countMatch = description.match(/Игроков в сети:\s*\*\*(\d+)\*\*/i);
  const onlineCount = countMatch ? Number(countMatch[1]) : 0;
  return { online, maintenance, onlineCount };
}

function parsePlayerList(msg: DiscordMessage): string[] {
  for (const row of msg.components ?? []) {
    for (const comp of row.components ?? []) {
      if (!comp.custom_id?.startsWith("solards:players")) continue;
      return (comp.options ?? [])
        .map((o) => o.value)
        .filter((v) => v && v !== "empty");
    }
  }
  return [];
}

export async function fetchDiscordServerStatus(): Promise<ServerStatus | null> {
  const channelId = discordConfig.statusChannelId;
  if (!channelId) return null;

  const messages = await discordFetch<DiscordMessage[]>(
    `/channels/${channelId}/messages?limit=8`,
    3500,
  );
  if (!messages?.length) return null;

  const msg = messages.find((m) =>
    m.embeds?.some((e) => e.title?.includes("Minecraft")),
  );
  const embed = msg?.embeds?.find((e) => e.title?.includes("Minecraft"));
  if (!embed?.description) return null;

  const parsed = parseStatusEmbed(embed.description);
  const list = msg ? parsePlayerList(msg) : [];

  return {
    online: parsed.online && !parsed.maintenance,
    players: {
      online: parsed.onlineCount || list.length,
      max: 0,
      list,
    },
    source: "discord",
    maintenance: parsed.maintenance,
  };
}

function mergePlayerLists(...lists: (string[] | undefined)[]) {
  const out = new Set<string>();
  for (const list of lists) {
    for (const name of list ?? []) {
      const n = name?.trim();
      if (n && n !== "empty") out.add(n);
    }
  }
  return [...out].sort((a, b) => a.localeCompare(b, "ru"));
}

export async function fetchDiscordAdminSnapshot() {
  const [status, ping] = await Promise.all([
    fetchDiscordServerStatus(),
    fetchMinecraftPing(),
  ]);
  if (!status) return null;

  const onlinePlayers = mergePlayerLists(
    status.players.list,
    ping?.players?.list,
  );

  return {
    maintenance: Boolean(status.maintenance),
    linkedAccounts: null as number | null,
    pendingLinkCodes: null as number | null,
    spmoneyAvailable: null as boolean | null,
    onlinePlayers,
    status: {
      online: status.online,
      players: { online: status.players.online, max: status.players.max },
      tps: status.tps,
    },
    source: "discord" as const,
  };
}

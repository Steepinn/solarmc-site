import { serverConfig } from "./bot-config";
import type { ServerStatus } from "./types";

type McStatusResponse = {
  online: boolean;
  players?: { online?: number; max?: number; list?: string[] };
  version?: { name?: string };
};

export async function fetchMinecraftPing(): Promise<ServerStatus | null> {
  const host = `${serverConfig.ip}:${serverConfig.port}`;
  const url = `https://api.mcstatus.io/v2/status/java/${encodeURIComponent(host)}`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as McStatusResponse;
    if (!data.online) {
      return {
        online: false,
        players: { online: 0, max: data.players?.max ?? 0, list: [] },
        source: "ping",
      };
    }
    return {
      online: true,
      players: {
        online: data.players?.online ?? 0,
        max: data.players?.max ?? 0,
        list: data.players?.list ?? [],
      },
      version: data.version?.name,
      source: "ping",
    };
  } catch {
    return null;
  }
}

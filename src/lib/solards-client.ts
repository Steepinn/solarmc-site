import { serverConfig } from "./bot-config";

function apiToken(): string {
  return (
    process.env.SOLARDS_API_TOKEN?.trim() ||
    process.env.SOLARDS_WEB_API_TOKEN?.trim() ||
    ""
  );
}

function authHeaders(): HeadersInit {
  const token = apiToken();
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function buildUrls(path: string): string[] {
  const token = apiToken();
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  const urls: string[] = [];

  if (serverConfig.solardsUrl) {
    const base = serverConfig.solardsUrl.replace(/\/$/, "").replace(/\/api\/status$/, "");
    urls.push(`${base}${path}${qs}`);
  }

  const host = `http://${serverConfig.ip}:${serverConfig.solardsPort}`;
  urls.push(`${host}${path}${qs}`);

  return [...new Set(urls)];
}

export async function solardsFetch<T>(
  path: string,
  timeoutMs = 2000,
  init?: RequestInit,
): Promise<T | null> {
  const headers = { ...authHeaders(), ...(init?.headers as Record<string, string> | undefined) };

  for (const url of buildUrls(path)) {
    try {
      const res = await fetch(url, {
        ...init,
        headers,
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("json")) continue;
      return (await res.json()) as T;
    } catch {
      /* next */
    }
  }

  return null;
}

export type SolardsStatusResponse = {
  online: boolean;
  maintenance?: boolean;
  status?: string;
  players?: { online: number; max: number; list?: string[] };
  online_players?: number;
  max_players?: number;
  player_list?: string[];
  tps?: number;
  version?: string;
  spmoney?: boolean;
};

export type SolardsBalanceResponse = {
  linked?: boolean;
  player?: string;
  mcNick?: string;
  balance?: number | null;
  hasCell?: boolean;
  symbol?: string;
  spmoney?: boolean;
};

export type SolardsBaltopResponse = {
  symbol: string;
  available: boolean;
  entries: { rank: number; player: string; balance: number }[];
};

export type SolardsAdminOverview = {
  maintenance: boolean;
  linkedAccounts: number;
  pendingLinkCodes: number;
  spmoneyAvailable: boolean;
  onlinePlayers: string[];
  status: SolardsStatusResponse;
};

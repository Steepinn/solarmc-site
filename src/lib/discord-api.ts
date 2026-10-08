const DISCORD_API = "https://discord.com/api/v10";

export function discordBotHeaders(): HeadersInit | null {
  const token = process.env.DISCORD_BOT_TOKEN?.trim();
  if (!token) return null;
  return { Authorization: `Bot ${token}` };
}

export async function discordFetch<T>(
  path: string,
  timeoutMs = 4000,
): Promise<T | null> {
  const headers = discordBotHeaders();
  if (!headers) return null;

  try {
    const res = await fetch(`${DISCORD_API}${path}`, {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

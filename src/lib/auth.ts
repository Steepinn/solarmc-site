import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "./types";
import { discordConfig } from "@/lib/bot-config";
import { getSiteRoleKeys } from "@/lib/site-roles";
import { mergeProjectRoles, resolveUserProjectRoles } from "@/lib/roles";
import { resolveMcNickForDiscord } from "@/lib/solards-links";
import { isUserBlocked } from "@/lib/site-blocks";

const DISCORD_API = "https://discord.com/api/v10";
const SESSION_COOKIE = "solarmc_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
const ENRICH_TTL_MS = 45_000;
const enrichCache = new Map<string, { at: number; user: SessionUser }>();

function getSecret() {
  const secret = process.env.SESSION_SECRET ?? "dev-secret-change-in-production";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.user as SessionUser) ?? null;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getEnrichedSession(): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session) return null;
  if (await isUserBlocked(session.discordId)) {
    await clearSessionCookie();
    return null;
  }
  return enrichSessionUser(session);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
}

/** Ставит cookie на Redirect-ответ (надёжнее в Route Handlers). */
export function attachSessionCookie(res: {
  cookies: { set: (name: string, value: string, options: Record<string, unknown>) => void };
}, token: string) {
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
}

function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Origin за reverse-proxy (Render/Vercel): https + реальный host. */
export function buildPublicOrigin(
  host: string | null | undefined,
  proto: string | null | undefined,
  fallbackOrigin: string,
): string {
  const h = host?.split(",")[0]?.trim();
  if (!h) return fallbackOrigin.replace(/\/$/, "");
  let p = proto?.split(",")[0]?.trim();
  if (!p) {
    p = h.includes("localhost") || h.startsWith("127.") ? "http" : "https";
  }
  return `${p}://${h}`.replace(/\/$/, "");
}

export function getPublicOriginFromRequest(req: {
  headers: { get(name: string): string | null };
  nextUrl: { origin: string };
}) {
  return buildPublicOrigin(
    req.headers.get("x-forwarded-host") ?? req.headers.get("host"),
    req.headers.get("x-forwarded-proto"),
    req.nextUrl.origin,
  );
}

function callbackForSiteBase(base: string) {
  return `${base.replace(/\/$/, "")}/api/auth/callback`;
}

/** Значение DISCORD_REDIRECT_URI в env (может не совпадать с тем, что уходит в Discord). */
export function getEnvDiscordRedirectUri(): string | null {
  const fixed = process.env.DISCORD_REDIRECT_URI?.trim();
  return fixed ? fixed.replace(/\/$/, "") : null;
}

export function getDiscordRedirectUri(origin: string) {
  const fromOrigin = origin?.trim().replace(/\/$/, "");
  if (fromOrigin && /^https?:\/\//i.test(fromOrigin)) {
    return callbackForSiteBase(fromOrigin);
  }

  const fixed = getEnvDiscordRedirectUri();
  if (fixed) return fixed;

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();
  if (siteUrl) {
    return callbackForSiteBase(siteUrl);
  }

  return "/api/auth/callback";
}

export function getDiscordOAuthUrl(origin: string, state?: string) {
  const clientId = process.env.DISCORD_CLIENT_ID;
  if (!clientId) return null;

  const redirectUri = getDiscordRedirectUri(origin);

  // без prompt=consent — Discord не спрашивает снова, если уже авторизован
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify guilds.members.read",
  });
  if (state?.trim()) params.set("state", state.trim());

  return `https://discord.com/api/oauth2/authorize?${params}`;
}

export async function fetchGuildMember(discordId: string, accessToken: string) {
  const res = await fetch(
    `${DISCORD_API}/users/@me/guilds/${discordConfig.guildId}/member`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) return null;
  return res.json() as Promise<{ roles: string[]; nick?: string | null }>;
}

export async function fetchGuildMemberByBot(discordId: string) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;

  const res = await fetch(
    `${DISCORD_API}/guilds/${discordConfig.guildId}/members/${discordId}`,
    {
      headers: { Authorization: `Bot ${token}` },
      next: { revalidate: 45 },
      signal: AbortSignal.timeout(4000),
    },
  );
  if (!res.ok) return null;
  return res.json() as Promise<{ roles: string[]; nick?: string | null }>;
}

export function memberFlags(roles: string[] = []) {
  const isModerator = roles.includes(discordConfig.moderatorRoleId);
  const isAdministrator = roles.includes(discordConfig.adminRoleId);
  return {
    isModerator,
    isAdministrator,
    isAdmin: isModerator || isAdministrator,
    hasWhitelist: roles.includes(discordConfig.approvedRoleId),
  };
}

/** Вики /docs/admin — хелпер, модер, админ (Discord или роль сайта). */
export function canAccessStaffWiki(user: {
  isAdmin?: boolean;
  isModerator?: boolean;
  isAdministrator?: boolean;
  projectRoles?: { key: string }[];
} | null): boolean {
  if (!user) return false;
  if (user.isModerator || user.isAdministrator || user.isAdmin) return true;
  const keys = new Set(user.projectRoles?.map((r) => r.key) ?? []);
  return (
    keys.has("helper") ||
    keys.has("moderator") ||
    keys.has("administrator")
  );
}

export async function enrichSessionUser(session: SessionUser): Promise<SessionUser> {
  const cached = enrichCache.get(session.discordId);
  if (cached && Date.now() - cached.at < ENRICH_TTL_MS) {
    return cached.user;
  }

  const member = await fetchGuildMemberByBot(session.discordId);
  const roles = member?.roles ?? [];
  const flags = member ? memberFlags(roles) : {
    isModerator: session.isModerator ?? session.isAdmin,
    isAdministrator: session.isAdministrator ?? false,
    isAdmin: session.isAdmin,
    hasWhitelist: session.hasWhitelist,
  };

  const mcNick =
    (await resolveMcNickForDiscord(session.discordId, member?.nick)) ??
    session.mcNick;

  const siteKeys = await getSiteRoleKeys(session.discordId);
  const discordRoles = member ? resolveUserProjectRoles(member.roles) : [];
  const projectRoles = mergeProjectRoles(siteKeys, discordRoles);
  const hasWhitelistFromSite = siteKeys.includes("player");

  const user: SessionUser = {
    ...session,
    ...flags,
    mcNick: mcNick ?? undefined,
    projectRoles,
    hasWhitelist: hasWhitelistFromSite || flags.hasWhitelist,
  };
  enrichCache.set(session.discordId, { at: Date.now(), user });
  return user;
}

export async function buildSessionUser(input: {
  id: string;
  username: string;
  globalName?: string;
  avatar: string;
  roles?: string[];
  discordNick?: string | null;
}) {
  const flags = memberFlags(input.roles ?? []);
  const mcNick = await resolveMcNickForDiscord(input.id, input.discordNick);

  return {
    id: input.id,
    discordId: input.id,
    username: input.globalName ?? input.username,
    globalName: input.globalName,
    avatar: input.avatar,
    mcNick: mcNick ?? undefined,
    ...flags,
  } satisfies SessionUser;
}

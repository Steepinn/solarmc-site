import { getPassApplications } from "@/lib/db";
import { loadUsercache, mcNickByUuid } from "@/lib/minecraft-paths";
import { listSiteUsers } from "@/lib/site-users";
import { discordIdByUuid, uuidByDiscordId } from "@/lib/spsolards-db";

export type AdminDirectoryUser = {
  discordId: string | null;
  username: string;
  mcNick?: string;
  avatar?: string;
  lastSeenAt?: string;
  sources: ("site" | "application" | "dslink" | "usercache")[];
  profileHref: string;
};

function slugOf(u: { mcNick?: string; username?: string; discordId?: string | null }) {
  const slug = u.mcNick?.trim() || u.username?.trim() || u.discordId || "unknown";
  return `/u/${encodeURIComponent(slug)}`;
}

export async function listAdminDirectory(): Promise<AdminDirectoryUser[]> {
  /** индекс по discordId и по lower(mcNick) */
  const byDiscord = new Map<string, AdminDirectoryUser>();
  const byNick = new Map<string, AdminDirectoryUser>();

  function touch(entry: AdminDirectoryUser) {
    if (entry.discordId) byDiscord.set(entry.discordId, entry);
    if (entry.mcNick) byNick.set(entry.mcNick.toLowerCase(), entry);
  }

  function upsert(partial: {
    discordId?: string | null;
    username?: string;
    mcNick?: string | null;
    avatar?: string | null;
    lastSeenAt?: string;
    source: AdminDirectoryUser["sources"][number];
  }) {
    const discordId = partial.discordId?.trim() || null;
    const mcNick = partial.mcNick?.trim() || undefined;
    const username =
      partial.username?.trim() || mcNick || discordId || "unknown";

    let existing: AdminDirectoryUser | undefined;
    if (discordId) existing = byDiscord.get(discordId);
    if (!existing && mcNick) existing = byNick.get(mcNick.toLowerCase());

    if (!existing) {
      const created: AdminDirectoryUser = {
        discordId,
        username,
        mcNick,
        avatar: partial.avatar || undefined,
        lastSeenAt: partial.lastSeenAt,
        sources: [partial.source],
        profileHref: slugOf({ mcNick, username, discordId }),
      };
      touch(created);
      return;
    }

    // склеить nick-only с discord-записью
    if (existing.discordId && mcNick) {
      const orphan = byNick.get(mcNick.toLowerCase());
      if (orphan && orphan !== existing && !orphan.discordId) {
        existing.sources = [...new Set([...existing.sources, ...orphan.sources])];
        byNick.set(mcNick.toLowerCase(), existing);
      }
    }

    existing.discordId = existing.discordId || discordId;
    existing.mcNick = existing.mcNick || mcNick;
    if (partial.username?.trim()) {
      const u = partial.username.trim();
      if (!existing.username || existing.username === existing.mcNick || existing.username === existing.discordId) {
        existing.username = u;
      }
    }
    existing.avatar = existing.avatar || partial.avatar || undefined;
    if (partial.lastSeenAt) {
      if (
        !existing.lastSeenAt ||
        Date.parse(partial.lastSeenAt) > Date.parse(existing.lastSeenAt)
      ) {
        existing.lastSeenAt = partial.lastSeenAt;
      }
    }
    if (!existing.sources.includes(partial.source)) {
      existing.sources.push(partial.source);
    }
    existing.profileHref = slugOf(existing);
    touch(existing);
  }

  const [siteUsers, apps, cache] = await Promise.all([
    listSiteUsers(),
    getPassApplications(),
    loadUsercache(),
  ]);

  for (const u of siteUsers) {
    upsert({
      discordId: u.discordId,
      username: u.username,
      mcNick: u.mcNick,
      avatar: u.avatar,
      lastSeenAt: u.lastSeenAt,
      source: "site",
    });
  }

  for (const app of apps) {
    upsert({
      discordId: app.discordId,
      username: app.discordUsername,
      mcNick: app.mcNick,
      avatar: app.discordAvatar,
      lastSeenAt: app.createdAt,
      source: "application",
    });
  }

  for (const e of cache) {
    const discordId = await discordIdByUuid(e.uuid);
    upsert({
      discordId,
      username: e.name,
      mcNick: e.name,
      source: discordId ? "dslink" : "usercache",
    });
    if (!discordId) {
      upsert({
        discordId: null,
        username: e.name,
        mcNick: e.name,
        source: "usercache",
      });
    }
  }

  for (const u of siteUsers) {
    if (u.mcNick) continue;
    const uuid = await uuidByDiscordId(u.discordId);
    if (!uuid) continue;
    const nick = await mcNickByUuid(uuid);
    if (!nick) continue;
    upsert({
      discordId: u.discordId,
      username: u.username,
      mcNick: nick,
      avatar: u.avatar,
      lastSeenAt: u.lastSeenAt,
      source: "dslink",
    });
  }

  // уникальные записи: предпочитаем byDiscord, плюс nick-only без discord
  const out = new Map<string, AdminDirectoryUser>();
  for (const u of byDiscord.values()) {
    out.set(`d:${u.discordId}`, u);
  }
  for (const u of byNick.values()) {
    if (u.discordId) continue;
    out.set(`m:${(u.mcNick || u.username).toLowerCase()}`, u);
  }

  return [...out.values()].sort((a, b) => {
    const an = (a.mcNick || a.username).toLowerCase();
    const bn = (b.mcNick || b.username).toLowerCase();
    return an.localeCompare(bn, "ru");
  });
}

export function filterDirectory(
  users: AdminDirectoryUser[],
  qRaw: string,
): AdminDirectoryUser[] {
  const q = qRaw.trim().toLowerCase();
  if (!q) return users;
  return users.filter((u) => {
    const hay = [u.discordId ?? "", u.username, u.mcNick ?? "", ...u.sources]
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((part) => hay.includes(part));
  });
}

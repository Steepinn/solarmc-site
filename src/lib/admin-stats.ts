import { readdir } from "fs/promises";
import { getPassApplications } from "@/lib/db";
import { isTechnicalAdvancement } from "@/lib/advancement-meta";
import { loadPlayerAdvancementsByUuid } from "@/lib/minecraft-advancements";
import {
  getAdvancementsDir,
  getServerRoot,
  loadUsercache,
} from "@/lib/minecraft-paths";
import { getCities } from "@/lib/cities-db";
import { listSiteUsers } from "@/lib/site-users";
import { getSupportTickets } from "@/lib/support-db";
import { readFile } from "fs/promises";
import path from "path";

export type AdminSiteStats = {
  apps: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  support: {
    total: number;
    open: number;
    closed: number;
  };
  siteUsers: number;
  cities: number;
  mc: {
    configured: boolean;
    advancementsFiles: number;
    usercachePlayers: number;
  };
};

export type AdminMcPlayerRow = {
  nick: string;
  uuid: string;
  achievements: number;
  profileHref: string;
};

export async function getAdminSiteStats(): Promise<AdminSiteStats> {
  const [apps, support, users, cities] = await Promise.all([
    getPassApplications(),
    getSupportTickets(),
    listSiteUsers(),
    getCities(),
  ]);

  let advancementsFiles = 0;
  const dir = getAdvancementsDir();
  if (dir) {
    try {
      const files = await readdir(dir);
      advancementsFiles = files.filter((f) => f.endsWith(".json")).length;
    } catch {
      advancementsFiles = 0;
    }
  }

  const usercache = await loadUsercache();

  return {
    apps: {
      total: apps.length,
      pending: apps.filter((a) => a.status === "pending").length,
      approved: apps.filter((a) => a.status === "approved").length,
      rejected: apps.filter((a) => a.status === "rejected").length,
    },
    support: {
      total: support.length,
      open: support.filter((t) => t.status !== "closed").length,
      closed: support.filter((t) => t.status === "closed").length,
    },
    siteUsers: users.length,
    cities: cities.length,
    mc: {
      configured: Boolean(getServerRoot() || getAdvancementsDir()),
      advancementsFiles,
      usercachePlayers: usercache.length,
    },
  };
}

/** Быстрый подсчёт done без полного meta-resolve (для списка). */
async function countDoneAdvancements(uuid: string): Promise<number> {
  const dir = getAdvancementsDir();
  if (!dir) return 0;
  try {
    const raw = JSON.parse(
      await readFile(path.join(dir, `${uuid}.json`), "utf8"),
    ) as Record<string, { done?: boolean }>;
    let n = 0;
    for (const [id, v] of Object.entries(raw)) {
      if (v?.done && !isTechnicalAdvancement(id)) n += 1;
    }
    return n;
  } catch {
    return 0;
  }
}

export async function listAdminMcPlayers(): Promise<AdminMcPlayerRow[]> {
  const cache = await loadUsercache();
  const rows: AdminMcPlayerRow[] = [];
  for (const e of cache) {
    const achievements = await countDoneAdvancements(e.uuid);
    rows.push({
      nick: e.name,
      uuid: e.uuid,
      achievements,
      profileHref: `/u/${encodeURIComponent(e.name)}`,
    });
  }
  rows.sort((a, b) => b.achievements - a.achievements || a.nick.localeCompare(b.nick));
  return rows;
}

export async function listAdminSiteUsersDetailed() {
  const users = await listSiteUsers();
  return users.map((u) => ({
    ...u,
    profileHref: `/u/${encodeURIComponent(u.mcNick?.trim() || u.username || u.discordId)}`,
  }));
}

/** Полный разбор одной ачивки — если понадобится детали */
export async function peekPlayerAdvancements(uuid: string) {
  return loadPlayerAdvancementsByUuid(uuid);
}

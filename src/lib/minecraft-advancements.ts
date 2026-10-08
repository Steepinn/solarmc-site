import { readFile } from "fs/promises";
import path from "path";
import {
  advancementIconUrl,
  advancementMeta,
  isTechnicalAdvancement,
} from "@/lib/advancement-meta";
import { datapackMetaFor, categoryHintForId } from "@/lib/datapack-advancement-meta";
import {
  getAdvancementsDir,
  mcNickByUuid,
  uuidByMcNick,
} from "@/lib/minecraft-paths";
import { uuidByDiscordId } from "@/lib/spsolards-db";

export type PlayerAdvancement = {
  id: string;
  title: string;
  description?: string;
  category: string;
  iconUrl: string;
  doneAt?: string;
};

export type AdvancementsSummary = {
  total: number;
  byCategory: Record<string, number>;
  items: PlayerAdvancement[];
  source: "server" | "empty" | "unavailable";
};

type RawAdv = {
  criteria?: Record<string, string>;
  done?: boolean;
};

function pickDoneAt(raw: RawAdv): string | undefined {
  if (!raw.criteria) return undefined;
  const times = Object.values(raw.criteria);
  if (!times.length) return undefined;
  return times.sort().at(-1);
}

async function resolveMeta(id: string) {
  const fromPack = await datapackMetaFor(id);
  if (fromPack) return fromPack;
  const base = advancementMeta(id);
  const hint = categoryHintForId(id);
  if (hint) return { ...base, category: hint };
  return base;
}

export async function loadPlayerAdvancementsByUuid(
  uuid: string,
): Promise<AdvancementsSummary> {
  const dir = getAdvancementsDir();
  if (!dir) {
    return { total: 0, byCategory: {}, items: [], source: "unavailable" };
  }

  const file = path.join(dir, `${uuid}.json`);
  let data: Record<string, RawAdv>;
  try {
    data = JSON.parse(await readFile(file, "utf8")) as Record<string, RawAdv>;
  } catch {
    return { total: 0, byCategory: {}, items: [], source: "empty" };
  }

  const items: PlayerAdvancement[] = [];
  for (const [id, raw] of Object.entries(data)) {
    if (!raw?.done) continue;
    if (isTechnicalAdvancement(id)) continue;
    const meta = await resolveMeta(id);
    items.push({
      id,
      title: meta.title,
      description: meta.description,
      category: meta.category,
      iconUrl: advancementIconUrl(meta.icon),
      doneAt: pickDoneAt(raw),
    });
  }

  items.sort((a, b) => {
    const ca = a.category.localeCompare(b.category, "ru");
    if (ca !== 0) return ca;
    return a.title.localeCompare(b.title, "ru");
  });

  const byCategory: Record<string, number> = {};
  for (const a of items) {
    byCategory[a.category] = (byCategory[a.category] ?? 0) + 1;
  }

  return {
    total: items.length,
    byCategory,
    items,
    source: "server",
  };
}

export async function loadPlayerAdvancementsByMcNick(nick: string) {
  const uuid = await uuidByMcNick(nick);
  if (!uuid) {
    return {
      total: 0,
      byCategory: {},
      items: [],
      source: "empty" as const,
      uuid: null as string | null,
      mcNick: nick,
    };
  }
  const summary = await loadPlayerAdvancementsByUuid(uuid);
  const resolvedNick = (await mcNickByUuid(uuid)) ?? nick;
  return { ...summary, uuid, mcNick: resolvedNick };
}

export async function loadPlayerAdvancementsByDiscordId(discordId: string) {
  const uuid = await uuidByDiscordId(discordId);
  if (!uuid) {
    return {
      total: 0,
      byCategory: {},
      items: [],
      source: "empty" as const,
      uuid: null as string | null,
      mcNick: null as string | null,
    };
  }
  const summary = await loadPlayerAdvancementsByUuid(uuid);
  const mcNick = await mcNickByUuid(uuid);
  return { ...summary, uuid, mcNick };
}

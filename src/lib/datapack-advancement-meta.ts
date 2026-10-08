import { readdir, readFile } from "fs/promises";
import path from "path";
import type { AdvancementMeta } from "@/lib/advancement-meta";
import { getDatapacksDir } from "@/lib/minecraft-paths";

type TextComponent = string | { text?: string; translate?: string };

type DatapackAdv = {
  parent?: string;
  display?: {
    icon?: { id?: string; item?: string; count?: number };
    title?: TextComponent;
    description?: TextComponent;
  };
};

/** Папки solar:* → русские категории на сайте */
const SOLAR_FOLDER_RU: Record<string, string> = {
  combat: "Бой",
  world: "Мир",
  end: "Энд",
  nether: "Нижний мир",
  fish: "Рыбалка",
  food: "Еда",
  memes: "Мемы",
  mods: "Моды",
  main: "Основное",
};

/** Неймспейсы модов → категория «Моды» (ветка solar:mods) */
const MOD_NS = new Set([
  "artifacts",
  "betterdungeons",
  "dungeons_arise",
  "farmersdelight",
  "tide",
  "bomd",
  "incendium",
  "rpg_series",
  "levelz",
  "origins",
  "create",
  "alexsmobs",
]);

let cacheAt = 0;
let cache = new Map<string, AdvancementMeta>();
let parents = new Map<string, string>();

function textOf(comp?: TextComponent): string | undefined {
  if (!comp) return undefined;
  if (typeof comp === "string") return comp;
  return comp.text || comp.translate || undefined;
}

function iconOf(raw?: { id?: string; item?: string }): string | undefined {
  const id = raw?.id || raw?.item;
  if (!id) return undefined;
  const leaf = id.includes(":") ? id.split(":")[1] : id;
  return leaf || undefined;
}

async function walkJsonFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walkJsonFiles(full)));
    else if (e.isFile() && e.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function categoryForId(id: string, parent?: string): string {
  // solar:mods/* и всё, что привязано к solar:mods/root
  if (id === "solar:mods/root" || id.startsWith("solar:mods/")) return "Моды";
  if (parent === "solar:mods/root" || parent?.startsWith("solar:mods/")) {
    return "Моды";
  }

  const [ns, ...rest] = id.split(":");
  const pathPart = rest.join(":");

  if (ns === "solar") {
    if (!pathPart || pathPart === "root") return "Solar";
    const folder = pathPart.split("/")[0] ?? "";
    return SOLAR_FOLDER_RU[folder] ?? "Solar";
  }

  if (ns && MOD_NS.has(ns)) return "Моды";

  return "Другое";
}

/** Читает display + parent из datapack solar_achievements (все namespace). */
export async function loadDatapackAdvancementMeta(): Promise<
  Map<string, AdvancementMeta>
> {
  if (Date.now() - cacheAt < 30_000 && cache.size) return cache;

  const packs = getDatapacksDir();
  const next = new Map<string, AdvancementMeta>();
  const nextParents = new Map<string, string>();
  if (!packs) {
    cache = next;
    parents = nextParents;
    cacheAt = Date.now();
    return cache;
  }

  const dataRoot = path.join(packs, "solar_achievements", "data");
  let namespaces: string[] = [];
  try {
    namespaces = (await readdir(dataRoot, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    cache = next;
    parents = nextParents;
    cacheAt = Date.now();
    return cache;
  }

  for (const ns of namespaces) {
    const advRoot = path.join(dataRoot, ns, "advancement");
    const files = await walkJsonFiles(advRoot);
    for (const file of files) {
      try {
        const raw = JSON.parse(await readFile(file, "utf8")) as DatapackAdv;
        const rel = path.relative(advRoot, file).replace(/\\/g, "/");
        const idPath = rel.replace(/\.json$/i, "");
        const id = `${ns}:${idPath}`;
        if (raw.parent) nextParents.set(id, raw.parent);
        if (!raw.display) continue;
        const title = textOf(raw.display.title);
        if (!title) continue;
        next.set(id, {
          title,
          description: textOf(raw.display.description),
          icon: iconOf(raw.display.icon),
          category: categoryForId(id, raw.parent),
        });
      } catch {
        /* skip */
      }
    }
  }

  // второй проход: если parent → Моды, а категория ещё нет
  for (const [id, meta] of next) {
    const p = nextParents.get(id);
    if (p && (p === "solar:mods/root" || p.startsWith("solar:mods/"))) {
      meta.category = "Моды";
    }
  }

  cache = next;
  parents = nextParents;
  cacheAt = Date.now();
  return cache;
}

export async function datapackMetaFor(id: string): Promise<AdvancementMeta | null> {
  const map = await loadDatapackAdvancementMeta();
  const hit = map.get(id);
  if (hit) return hit;

  // мод без своего display в datapack, но parent в links / по ns
  const [ns] = id.split(":");
  if (ns && MOD_NS.has(ns)) {
    return null; // пусть caller подставит title, а category через resolveCategory
  }
  return null;
}

export function categoryHintForId(id: string): string | null {
  const p = parents.get(id);
  if (id.startsWith("solar:mods/") || id === "solar:mods/root") return "Моды";
  if (p === "solar:mods/root" || p?.startsWith("solar:mods/")) return "Моды";
  const [ns] = id.split(":");
  if (ns && MOD_NS.has(ns)) return "Моды";
  if (ns === "solar") {
    const pathPart = id.slice("solar:".length);
    if (!pathPart || pathPart === "root") return "Solar";
    const folder = pathPart.split("/")[0] ?? "";
    return SOLAR_FOLDER_RU[folder] ?? "Solar";
  }
  return null;
}

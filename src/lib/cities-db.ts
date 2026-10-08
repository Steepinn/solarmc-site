import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

export type City = {
  id: string;
  slug: string;
  name: string;
  description: string;
  law: string;
  founderDiscordId: string;
  founderName: string;
  founderMcNick?: string;
  image?: string;
  mapX?: number;
  mapZ?: number;
  createdAt: string;
  /** старые slug для редиректа */
  aliases?: string[];
};

const FILE = path.join(process.cwd(), "data", "cities.json");

async function readCities(): Promise<City[]> {
  try {
    const raw = await readFile(FILE, "utf8");
    return (JSON.parse(raw) as { cities: City[] }).cities ?? [];
  } catch {
    return [];
  }
}

async function writeCities(cities: City[]) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify({ cities }, null, 2), "utf8");
}

export async function getCities() {
  return readCities();
}

export async function getCityBySlug(slugRaw: string) {
  const cities = await readCities();
  let slug = slugRaw.trim();
  try {
    slug = decodeURIComponent(slug);
  } catch {
    /* already decoded */
  }
  // иногда приходит double-encoded
  try {
    if (/%[0-9A-Fa-f]{2}/.test(slug)) slug = decodeURIComponent(slug);
  } catch {
    /* ignore */
  }
  const norm = slug.toLowerCase();
  return (
    cities.find(
      (c) =>
        c.slug === slug ||
        c.slug.toLowerCase() === norm ||
        c.aliases?.some((a) => a === slug || a.toLowerCase() === norm),
    ) ?? null
  );
}

export async function createCity(
  data: Omit<City, "id" | "slug" | "createdAt"> & { slug?: string },
) {
  const cities = await readCities();
  let base = (data.slug?.trim() || slugify(data.name)).slice(0, 48);
  if (!base) base = randomUUID().slice(0, 8);
  let slug = base;
  let i = 2;
  while (cities.some((c) => c.slug === slug)) {
    slug = `${base}-${i++}`.slice(0, 48);
  }

  const city: City = {
    id: randomUUID(),
    slug,
    name: data.name,
    description: data.description,
    law: data.law,
    founderDiscordId: data.founderDiscordId,
    founderName: data.founderName,
    founderMcNick: data.founderMcNick,
    image: data.image?.trim() && isUsableImage(data.image) ? data.image.trim() : undefined,
    mapX: data.mapX,
    mapZ: data.mapZ,
    createdAt: new Date().toISOString(),
  };
  cities.unshift(city);
  await writeCities(cities);
  return city;
}

function isUsableImage(src: string) {
  const s = src.trim();
  if (!s || s === "нет" || s === "-" || s === "null") return false;
  return /^https?:\/\//i.test(s) || s.startsWith("/");
}

const CYR: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh",
  з: "z", и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o",
  п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts",
  ч: "ch", ш: "sh", щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu",
  я: "ya",
};

export function slugify(name: string) {
  const latin = name
    .toLowerCase()
    .split("")
    .map((ch) => CYR[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return latin || randomUUID().slice(0, 8);
}

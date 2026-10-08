import fs from "fs";
import path from "path";
import {
  shopDurations,
  shopOriginItem,
  shopPlans,
  shopSkillResetItem,
  formatShopPrice,
} from "@/lib/shop-catalog";
import {
  redactSecrets,
  type SolAudience,
  isStaffAudience,
} from "@/lib/solnyshko/policy";

export type KnowledgeChunk = {
  title: string;
  href: string;
  text: string;
  section: string;
  staffOnly?: boolean;
};

const WIKI_ROOT = path.join(process.cwd(), "content", "wiki");
const EXTRA_ROOT = path.join(process.cwd(), "content", "solnyshko");
const SKIP_FILES = new Set([
  "navigation.json",
  "manifest.json",
  "images.json",
]);

let cache: { at: number; chunks: KnowledgeChunk[] } | null = null;
const CACHE_MS = 45_000;

function stripMd(raw: string) {
  return raw
    .replace(/^#+\s+/gm, "")
    .replace(/\{%[\s\S]*?%\}/g, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~>|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pushChunks(
  out: KnowledgeChunk[],
  title: string,
  href: string,
  section: string,
  plain: string,
  staffOnly?: boolean,
) {
  const clean = redactSecrets(plain);
  if (clean.length < 40) return;
  const window = 1200;
  for (let i = 0; i < clean.length; i += window - 200) {
    const slice = clean.slice(i, i + window).trim();
    if (slice.length < 40) continue;
    out.push({ title, href, text: slice, section, staffOnly });
    if (i + window >= clean.length) break;
  }
}

function walkMd(
  dir: string,
  parts: string[],
  out: KnowledgeChunk[],
  opts: { staffTree?: boolean },
) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_FILES.has(entry.name) || entry.name.includes("--")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const staffTree = opts.staffTree || entry.name === "admin";
      walkMd(full, [...parts, entry.name], out, { staffTree });
      continue;
    }
    if (!entry.name.endsWith(".md")) continue;
    const name = entry.name.replace(/\.md$/, "");
    const slug = [...parts, name];
    if (slug[0] === "informaciya" && slug.length === 1) continue;
    const raw = fs.readFileSync(full, "utf8");
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const title = titleMatch?.[1]?.replace(/\*\*/g, "").trim() ?? name;
    const staffOnly = Boolean(
      opts.staffTree ||
        slug[0] === "admin" ||
        name.startsWith("staff") ||
        parts.includes("staff"),
    );
    const href =
      slug[0] === "admin" || parts[0] === "admin"
        ? `/docs/${slug.join("/")}`
        : staffOnly
          ? `/docs/admin/home`
          : `/docs/${slug.join("/")}`;
    // extra solnyshko files without wiki path
    const finalHref = full.includes(`${path.sep}solnyshko${path.sep}`)
      ? staffOnly
        ? "/docs/admin/home"
        : "/docs/informaciya/home"
      : href;
    pushChunks(
      out,
      title,
      finalHref,
      parts[0] ?? "wiki",
      stripMd(raw),
      staffOnly,
    );
  }
}

function shopChunks(): KnowledgeChunk[] {
  const lines: string[] = [
    "Магазин /shop. Донат без P2W.",
    `Перерождение: ${shopOriginItem.description} Цена ${formatShopPrice(shopOriginItem.price)}. Покупка на сайте, не /give.`,
    ...shopOriginItem.privileges.map((p) => `Перерождение: ${p}`),
    `Сфера перепрокачки: ${shopSkillResetItem.description} Цена ${formatShopPrice(shopSkillResetItem.price)}.`,
    ...shopSkillResetItem.privileges.map(
      (p) => `Сфера перепрокачки: ${p}`,
    ),
  ];
  for (const plan of shopPlans) {
    lines.push(`${plan.name}: ${plan.privileges.join("; ")}.`);
    for (const d of shopDurations) {
      lines.push(
        `${plan.name} ${d.label}: ${formatShopPrice(plan.prices[d.id])}.`,
      );
    }
  }
  lines.push(
    "SONNE/SONNE+: нет nick, ec, fly, kits, homes, tpa. Sit/lay у всех игроков.",
  );
  return [
    {
      title: "Магазин",
      href: "/shop",
      text: lines.join(" "),
      section: "shop",
    },
  ];
}

function coreFacts(): KnowledgeChunk {
  return {
    title: "Solar кратко",
    href: "/docs/informaciya/home",
    text: [
      "Solar Season 3 PvE, MC Java 1.21.1 Fabric.",
      "Проходка: войти через Discord на сайте, затем подать заявку на /applications. Вики /docs, карта /map, поддержка /support, магазин /shop.",
      "Скиллы K (Puffish). Origin при входе, активка часто G. Голос V. Меню команд /cd.",
      "Игрок: /bal /pay /report /ask /msg /skin /sit /lay. Discord https://discord.gg/DjmJzUARCy",
    ].join(" "),
    section: "core",
  };
}

export function getAllKnowledgeChunks(): KnowledgeChunk[] {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.chunks;
  const chunks: KnowledgeChunk[] = [coreFacts(), ...shopChunks()];
  walkMd(WIKI_ROOT, [], chunks, {});
  walkMd(EXTRA_ROOT, [], chunks, {});
  cache = { at: Date.now(), chunks };
  return chunks;
}

export function getKnowledgeForAudience(audience: SolAudience): KnowledgeChunk[] {
  const all = getAllKnowledgeChunks();
  if (isStaffAudience(audience)) return all;
  return all.filter((c) => !c.staffOnly);
}

const STOP = new Set([
  "ты",
  "что",
  "как",
  "это",
  "для",
  "или",
  "не",
  "на",
  "по",
  "из",
  "за",
  "от",
  "до",
  "же",
  "ли",
  "бы",
  "то",
  "вс",
  "все",
  "мне",
  "меня",
  "мой",
  "моя",
  "есть",
  "был",
  "была",
  "будет",
  "про",
  "при",
  "без",
  "если",
  "уже",
  "еще",
  "ещё",
  "чем",
  "чего",
  "какой",
  "какая",
  "какие",
  "можно",
  "надо",
  "нужно",
  "просто",
  "the",
  "and",
  "for",
  "with",
]);

function tokenize(q: string) {
  return q
    .toLowerCase()
    .replace(/ё/g, "е")
    .split(/[^a-zа-я0-9+/]+/i)
    .filter((t) => t.length >= 3 && !STOP.has(t));
}

const BOOST: Record<string, string[]> = {
  перерожден: ["перерожден", "рас", "origin", "происхожден", "shop", "орб", "rebirth"],
  орб: ["перерожден", "origin", "рас", "shop"],
  рас: ["перерожден", "origin", "происхожден", "орб"],
  sonne: ["sonne", "донат", "привилег", "магазин"],
  донат: ["sonne", "магазин", "привилег"],
  проходк: ["заявк", "applications", "discord", "старт"],
  скилл: ["puffish", "клавиш", "прокач"],
  бан: ["moderator", "ban", "модерац"],
  кик: ["helper", "kick"],
  mute: ["helper", "мут"],
  lp: ["luckperms", "ранг", "групп"],
  лодк: ["shippy", "кораб", "парус", "верф", "sailboat"],
  кораб: ["shippy", "лодк", "парус", "верф", "sailboat", "caravel"],
  парус: ["shippy", "кораб", "верф"],
  квест: ["questlog", "задани", "журнал"],
  данж: ["arise", "yung", "dungeon", "структур"],
};

export function searchKnowledge(
  query: string,
  audience: SolAudience,
  limit = 8,
): KnowledgeChunk[] {
  const q = query.toLowerCase().replace(/ё/g, "е");
  let tokens = tokenize(query);
  for (const [key, extra] of Object.entries(BOOST)) {
    if (q.includes(key)) tokens = [...tokens, ...extra];
  }
  tokens = [...new Set(tokens)];
  if (!tokens.length) return [];

  const pool = getKnowledgeForAudience(audience);
  const scored = pool
    .map((chunk) => {
      const hay = `${chunk.title} ${chunk.text}`.toLowerCase().replace(/ё/g, "е");
      let score = 0;
      for (const t of tokens) {
        if (hay.includes(t)) score += t.length > 3 ? 3 : 1;
        if (chunk.title.toLowerCase().includes(t)) score += 5;
      }
      if (
        chunk.section === "shop" &&
        /магазин|донат|sonne|перерожден|рас|origin/i.test(q)
      ) {
        score += 8;
      }
      if (chunk.staffOnly && isStaffAudience(audience)) score += 2;
      return { chunk, score };
    })
    .filter((x) => x.score >= 5)
    .sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const out: KnowledgeChunk[] = [];
  for (const { chunk } of scored) {
    const key = `${chunk.href}:${chunk.text.slice(0, 48)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(chunk);
    if (out.length >= limit) break;
  }
  return out;
}

export type WikiChunk = KnowledgeChunk;
export function searchWiki(query: string, limit = 8) {
  return searchKnowledge(query, "player", limit);
}

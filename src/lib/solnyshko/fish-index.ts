import fs from "fs";
import path from "path";

export type FishEntry = {
  name: string;
  id: string;
  group: string;
  rarity: string;
  place: string;
  ban: string;
  depth: string;
  season: string;
  when: string;
  weight?: string;
};

type Manifest = {
  updated?: string;
  count?: number;
  fish: FishEntry[];
};

const FILE = path.join(
  process.cwd(),
  "content",
  "solnyshko",
  "fish-manifest.json",
);

const GROUP_RU: Record<string, string> = {
  freshwater: "реки и озёра",
  saltwater: "океан",
  lava: "лава",
  underground: "под землёй",
  void: "Край",
};

let cache: Manifest | null = null;

function load(): Manifest {
  if (cache) return cache;
  cache = JSON.parse(
    fs.readFileSync(FILE, "utf8").replace(/^\uFEFF/, ""),
  ) as Manifest;
  return cache!;
}

function norm(s: string) {
  return s
    .toLocaleLowerCase("ru-RU")
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я\s]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ALIASES: Record<string, string[]> = {
  группер: ["deep_grouper", "глубинный групер", "групер"],
  групер: ["deep_grouper", "глубинный групер", "групер"],
  grouper: ["deep_grouper", "глубинный групер"],
  лосось: ["salmon", "лосось", "slimy_salmon"],
  форель: ["trout", "форель"],
  щука: ["pike", "щука"],
  сом: ["catfish", "сом"],
  карп: ["carp", "карп"],
  окунь: ["bass", "perch", "окунь"],
  треска: ["cod", "треска"],
  тунец: ["tuna", "тунец"],
  акула: ["shark", "акула"],
  целакант: ["coelacanth", "целакант"],
  удильщик: ["angler", "удильщик"],
  марстилус: ["marstilus", "марстилус"],
  краппи: ["crappie", "краппи"],
};

function scoreFish(q: string, f: FishEntry): number {
  const nq = norm(q);
  const hay = norm(`${f.name} ${f.id}`);
  let s = 0;

  for (const [alias, keys] of Object.entries(ALIASES)) {
    if (!nq.includes(alias)) continue;
    if (keys.some((k) => hay.includes(norm(k)) || f.id.includes(k))) s += 50;
  }

  for (const t of nq.split(" ").filter((x) => x.length >= 4)) {
    if (/где|поим|лов|пойм|искать|води|рыб|удоч|какая|какой|какую/.test(t)) {
      continue;
    }
    if (hay.includes(t)) s += Math.min(t.length, 16);
  }

  const nameCompact = norm(f.name).replace(/\s+/g, "");
  if (nameCompact.length >= 4 && nq.replace(/\s+/g, "").includes(nameCompact)) {
    s += 40;
  }
  return s;
}

export function findFish(question: string): FishEntry | null {
  const m = load();
  let best: FishEntry | null = null;
  let bestS = 0;
  for (const f of m.fish) {
    const sc = scoreFish(question, f);
    if (sc > bestS) {
      bestS = sc;
      best = f;
    }
  }
  return bestS >= 14 ? best : null;
}

function formatFishAnswer(f: FishEntry): string {
  const zone = GROUP_RU[f.group] ?? f.group;
  const lines = [
    `**${f.name}** — ${f.rarity} (раздел: ${zone}).`,
    "",
    `• Место: ${f.place}`,
  ];
  if (f.ban && f.ban !== "—") lines.push(`• Не клюёт: ${f.ban}`);
  if (f.depth) lines.push(`• Высота: ${f.depth}`);
  if (f.season) lines.push(`• Сезон: ${f.season}`);
  if (f.when) lines.push(`• Когда: ${f.when}`);
  lines.push("", `Все рыбы: [список рыб](/docs/mods/tide/ryby).`);
  return lines.join("\n");
}

export function answerFishQuestion(question: string): {
  answer: string;
  sources: { title: string; href: string }[];
} | null {
  const aboutFish =
    /(где|как)\s+(поим|пойм|лов|искать|водит)|пойм\w*|поим\w*|ловит\w*|води\w*|улов|рыб\w*|форел|лосос|групер|группер|grouper|удильщик|целакант|акул|крапп|марстил/i.test(
      question,
    );
  if (!aboutFish) return null;

  const hit = findFish(question);
  if (!hit) {
    if (/рыбалк|как\s+лов/i.test(question)) {
      return {
        answer: `Рыбалка с мини-игрой. Как ловить — [рыбалка](/docs/mods/tide). Где какая рыба — [список рыб](/docs/mods/tide/ryby).\n\nНапиши название рыбы — скажу точечно.`,
        sources: [
          { title: "Рыбалка", href: "/docs/mods/tide" },
          { title: "Список рыб", href: "/docs/mods/tide/ryby" },
        ],
      };
    }
    return null;
  }

  return {
    answer: formatFishAnswer(hit),
    sources: [{ title: "Список рыб", href: "/docs/mods/tide/ryby" }],
  };
}

export function fishPromptBlurb(): string {
  const m = load();
  return `РЫБАЛКА: ${m.count ?? m.fish.length} видов. Отвечай по колонкам: место, не клюёт, высота, сезон, когда. Без «почти везде». Пример: глубинный групер — подземные озёра, высота не выше 30.`;
}

/**
 * Generate fishing guide + fish list page + Solnyshko manifest
 * node scripts/generate-fish-wiki.mjs
 *
 * → content/wiki/mods/tide.md        (как ловить)
 * → content/wiki/mods/tide/ryby.md   (список рыб)
 * → content/solnyshko/fish-manifest.json
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const raw = fs.readFileSync(path.join(__dirname, "FISH-GUIDE.txt"), "utf8");

const BIOME_GLOSSARY = {
  "#solar_fish:trout_salmon": "холодные реки",
  "#solar_fish:temperate_freshwater": "обычные реки и озёра",
  "#solar_fish:cold_freshwater": "холодные пресные воды",
  "#solar_fish:warm_freshwater": "тёплые пресные воды",
  "#solar_fish:swamp_mangrove": "болото и мангры",
  "#solar_fish:cold_ocean": "холодный океан",
  "#solar_fish:lukewarm_ocean": "умеренный океан",
  "#solar_fish:warm_ocean": "тёплый океан",
  "#solar_fish:tropical_catch": "тропики и кораллы",
  "#solar_fish:exclude_warm_tropics": "мангры, джунгли, тёплый океан, пустыня",
  "#tide:has_jungle_fish": "джунгли",
  "#tide:has_frozen_fish": "замёрзшие биомы",
  "#tide:has_coastal_fish": "побережье",
  "#tide:has_cherry_grove_fish": "вишнёвая роща",
  "#tide:has_desert_fish": "пустыня",
  "#tide:has_mushroom_fish": "грибной остров",
  "#tide:has_dripstone_fish": "сталактитовые пещеры",
  "#minecraft:is_river": "реки",
  "#minecraft:is_deep_ocean": "глубокий океан",
};

const GROUP_PLACE = {
  freshwater: "любые реки и озёра",
  saltwater: "любой океан",
  lava: "лава (Нижний мир)",
  underground: "подземные озёра и пещеры",
  void: "В Краю",
};

const GROUP_META = {
  freshwater: {
    title: "Реки и озёра",
    blurb: "Пресная вода на поверхности.",
  },
  saltwater: {
    title: "Океан",
    blurb: "Море и берег.",
  },
  lava: {
    title: "Лава",
    blurb: "Ловишь в лаве — обычно в Нижнем мире.",
  },
  underground: {
    title: "Под землёй",
    blurb: "Пещерные воды. Смотри высоту (Y).",
  },
  void: {
    title: "Край",
    blurb: "Рыбалка в Краю.",
  },
};

function translateTags(s) {
  let out = s;
  out = out.replace(
    /#solar_fish:exclude_warm_tropics\s*\([^)]*\)/g,
    "#solar_fish:exclude_warm_tropics",
  );
  for (const [tag, ru] of Object.entries(BIOME_GLOSSARY)) {
    out = out.split(tag).join(ru);
  }
  return out;
}

function placeParts(rawBiomes, group) {
  const fallback = GROUP_PLACE[group] || "см. раздел";
  if (!rawBiomes?.trim()) return { place: fallback, ban: "" };

  if (/любые подходящие по FW\/SW\/измерению/i.test(rawBiomes)) {
    return { place: fallback, ban: "" };
  }

  let ban = "";
  let place = rawBiomes;
  const banSplit = place.split(/\|\s*ЗАПРЕТ:\s*/);
  if (banSplit.length > 1) {
    place = banSplit[0];
    ban = translateTags(banSplit[1]).replace(/\s+/g, " ").trim();
  }
  place = translateTags(place)
    .replace(/,\s*/g, ", ")
    .replace(/\s{2,}/g, " ")
    .trim();
  return { place: place || fallback, ban };
}

function ticksToPlain(range) {
  const m = range.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return range.trim();
  const a = +m[1];
  const b = +m[2];
  if (a === 0 && b === 12000) return "днём";
  if (a === 12000 && b === 24000) return "ночью";
  if (a === 0 && b === 24000) return "всегда";
  if (a <= 2000 && b >= 11000 && b <= 13000) return "днём";
  if (a >= 11000 && a <= 13000 && b >= 23000) return "ночью";
  if (a < 12000 && b <= 15000) return "днём";
  if (a >= 12000) return "ночью";
  return "особое время";
}

function humanTime(s) {
  if (!s || /не влияет/i.test(s)) return "";
  const parts = s.split(/;/).map((p) => p.trim()).filter(Boolean);
  const plain = [...new Set(parts.map(ticksToPlain))];
  if (plain.includes("днём") && plain.includes("ночью")) return "днём и ночью";
  return plain.join(", ");
}

function humanMoon(s) {
  if (!s || /не влияет/i.test(s)) return "";
  return s
    .replace(/0=полнолуние/g, "полнолуние")
    .replace(/1=убывающая выпуклая/g, "убывающая луна")
    .replace(/2=последняя четверть/g, "последняя четверть")
    .replace(/3=убывающий серп/g, "убывающий серп")
    .replace(/4=новолуние/g, "новолуние")
    .replace(/5=растущий серп/g, "растущий серп")
    .replace(/6=первая четверть/g, "первая четверть")
    .replace(/7=растущая выпуклая/g, "растущая луна");
}

function humanSeason(s) {
  if (!s || /все|не ограничено/i.test(s)) return "весь год";
  return s;
}

function humanDepth(s) {
  if (!s || /без явного/i.test(s)) return "любая";
  let d = s
    .replace(/^Y\s*/i, "")
    .replace(/\.\./g, "–")
    .replace(/>=\s*/g, "от ")
    .replace(/<=\s*/g, "не выше ")
    .replace(/Глубина:\s*/i, "")
    .trim();
  if (/^\d/.test(d) || /^от |^не выше /.test(d)) return `Y ${d}`;
  return d;
}

function whenOf(f) {
  const bits = [];
  const t = humanTime(f.time);
  const m = humanMoon(f.moon);
  if (t) bits.push(t);
  if (m) bits.push(`луна: ${m}`);
  return bits.length ? bits.join("; ") : "всегда";
}

function parseBlock(block) {
  const lines = block
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return null;
  const m = lines[0].match(/^(.+?)\s+\(([^)]+)\)/);
  if (!m) return null;
  const get = (key) => {
    const line = lines.find(
      (l) => l.startsWith(key + ":") || l.startsWith(key + " "),
    );
    if (!line) return "";
    return line.slice(key.length).replace(/^\s*:?\s*/, "").trim();
  };
  return {
    name: m[1].replace(/\s*\[ПАТЧ[^\]]*\]\s*$/, "").trim(),
    id: m[2].trim(),
    group: get("Группа"),
    rarity: get("Редкость"),
    biomes: get("Биомы/места"),
    depth: get("Глубина"),
    season: get("Сезон"),
    moon: get("Луна"),
    time: get("Время"),
    weight: get("Базовый вес выбора"),
  };
}

const rarityOrder = {
  обычная: 1,
  необычная: 2,
  редкая: 3,
  "очень редкая": 4,
  легендарная: 5,
};

const blocks = raw.split(/^-{20,}$/m).slice(1);
const fish = blocks.map(parseBlock).filter(Boolean);
const enriched = fish.map((f) => {
  const { place, ban } = placeParts(f.biomes, f.group);
  return {
    ...f,
    place,
    ban,
    depthH: humanDepth(f.depth),
    seasonH: humanSeason(f.season),
    whenH: whenOf(f),
  };
});

function fishCard(f) {
  const lines = [
    `<div class="wiki-fish">`,
    ``,
    `#### ${f.name}`,
    ``,
    `*${f.rarity}*`,
    ``,
    `- **Место:** ${f.place}`,
  ];
  if (f.ban) lines.push(`- **Не клюёт:** ${f.ban}`);
  lines.push(`- **Высота:** ${f.depthH}`);
  lines.push(`- **Сезон:** ${f.seasonH}`);
  lines.push(`- **Когда:** ${f.whenH}`);
  lines.push(``, `</div>`);
  return lines.join("\n");
}

function section(groupKey) {
  const meta = GROUP_META[groupKey];
  const list = enriched
    .filter((f) => f.group === groupKey)
    .sort(
      (a, b) =>
        (rarityOrder[a.rarity] ?? 9) - (rarityOrder[b.rarity] ?? 9) ||
        a.place.localeCompare(b.place, "ru") ||
        a.name.localeCompare(b.name, "ru"),
    );
  if (!list.length) return "";

  // подгруппы по первому месту
  const byPlace = new Map();
  for (const f of list) {
    const key = f.place.split(",")[0].trim();
    if (!byPlace.has(key)) byPlace.set(key, []);
    byPlace.get(key).push(f);
  }

  let body = "";
  for (const [place, items] of byPlace) {
    const title = place.charAt(0).toUpperCase() + place.slice(1);
    body += `\n### ${title}\n\n`;
    body += items.map(fishCard).join("\n\n");
    body += "\n";
  }

  return `## ${meta.title}

${meta.blurb}
${body}`;
}

const guideMd = `# Рыбалка

Мини-игра: удочка → клюнуло → попади в зелёную зону.

{% hint style="danger" %}
Авторыбалка запрещена.
{% endhint %}

## Как ловить

1. Удочка + вода (или лава / пещера / Край).
2. Клюнуло — кликай в зелёную зону.
3. Чем точнее — тем лучше улов.

## Где какая рыба

Всего **${fish.length}** видов. Полный список с местом, высотой, сезоном и временем:

→ **[Список рыб](/docs/mods/tide/ryby)**

## Советы

* Начни с обычных рек — там больше простых рыб.
* Редкости чаще ночью или при нужной луне.
* Под землёй смотри **высоту** — без неё многие виды не клюют.
* В списке у каждой рыбы отдельно: **Место**, **Не клюёт**, **Высота**, **Сезон**, **Когда**.
`;

const listMd = `# Список рыб

**${fish.length}** видов. Разбиты по зонам — у каждой рыбы свой блок.

1. **Место** — куда идти  
2. **Не клюёт** — где мимо (если есть)  
3. **Высота** — уровень Y  
4. **Сезон**  
5. **Когда** — день / ночь / луна

Как ловить: [Рыбалка](/docs/mods/tide).

${section("freshwater")}
${section("saltwater")}
${section("lava")}
${section("underground")}
${section("void")}
`;

const wikiMods = path.join(__dirname, "..", "content", "wiki", "mods");
const listDir = path.join(wikiMods, "tide");
fs.mkdirSync(listDir, { recursive: true });

fs.writeFileSync(path.join(wikiMods, "tide.md"), guideMd, "utf8");
fs.writeFileSync(path.join(listDir, "ryby.md"), listMd, "utf8");

fs.writeFileSync(
  path.join(__dirname, "..", "content", "solnyshko", "fish-manifest.json"),
  `${JSON.stringify(
    {
      source: "console/FISH-GUIDE.txt",
      updated: new Date().toISOString().slice(0, 10),
      count: fish.length,
      fish: enriched.map((f) => ({
        name: f.name,
        id: f.id,
        group: f.group,
        rarity: f.rarity,
        place: f.place,
        ban: f.ban || "—",
        depth: f.depthH,
        season: f.seasonH,
        when: f.whenH,
        weight: f.weight,
      })),
    },
    null,
    2,
  )}\n`,
  "utf8",
);

console.log("ok", fish.length, "guide + list");

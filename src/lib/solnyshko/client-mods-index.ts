import {
  loadClientPack,
  type PackModEntry,
} from "@/lib/solnyshko/pack-mods";

export type ClientModEntry = PackModEntry;

/** Нормализация + русские/англ. алиасы → id мода. */
export function normalizeModQuery(q: string): string {
  return q
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/маус\s*твик(?:с|а|и)?/g, "mousetweaks")
    .replace(/мауствйк/g, "mousetweaks")
    .replace(/mouse\s*tweaks?/g, "mousetweaks")
    .replace(/динамическ[а-я]*\s*свет[а-я]*/g, "lambdynamiclights")
    .replace(/динамик[а-я]*\s*лайт[а-я]*/g, "lambdynamiclights")
    .replace(/lamb\s*dynamic\s*lights?/g, "lambdynamiclights")
    .replace(/ламб[а-я]*\s*динамик[а-я]*/g, "lambdynamiclights")
    .replace(/(?<![a-z])dynamic\s*lights?(?![a-z])/g, "lambdynamiclights")
    .replace(/шейдер[а-я]*/g, "iris")
    .replace(/шадер[а-я]*/g, "iris")
    .replace(/голос(?:овой)?\s*чат/g, "voicechat")
    .replace(/voice\s*chat/g, "voicechat")
    .replace(/simple\s*voice/g, "voicechat")
    .replace(/лайт\s*матик[а-я]*/g, "litematica")
    .replace(/схем[а-я]*/g, "litematica")
    .replace(/эмоц[а-я]*|эмоут[а-я]*/g, "emotecraft")
    .replace(/farmers?\s*delight/g, "farmersdelight")
    .replace(/фармерс?\s*делайт/g, "farmersdelight")
    .replace(/кухн[а-я]*\s*фермер/g, "farmersdelight")
    .replace(/sodium\s*extra/g, "sodiumextra")
    .replace(/immediately\s*fast/g, "immediatelyfast")
    .replace(/better\s*f3/g, "betterf3")
    .replace(/smooth\s*scroll/g, "smoothscroll")
    .replace(/mod\s*menu/g, "modmenu")
    .replace(/inv\s*move/g, "invmove")
    .replace(/shippy\s*ships?/g, "shippy")
    .replace(/dungeons?\s*arise/g, "dungeonsarise")
    .replace(/[^a-z0-9а-я\s]+/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hayOf(entry: ClientModEntry): string {
  return `${entry.file} ${entry.id} ${entry.note ?? ""}`
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, "");
}

/** alias → что должно совпасть в имени файла (строго). */
const ALIASES: Record<string, RegExp> = {
  mousetweaks: /mousetweak/i,
  invmove: /invmove/i,
  sodium: /^sodium-fabric/i,
  sodiumextra: /sodium-extra/i,
  iris: /^iris-/i,
  litematica: /litematica/i,
  syncmatica: /syncmatica/i,
  emotecraft: /emotecraft/i,
  shippy: /shippy/i,
  questlog: /questlog/i,
  betterf3: /betterf3/i,
  smoothscroll: /smoothscroll/i,
  modmenu: /modmenu/i,
  voicechat: /voicechat/i,
  lambdynamiclights: /lambdynamiclights/i,
  lithium: /^lithium-/i,
  continuity: /continuity/i,
  immediatelyfast: /immediatelyfast/i,
  ferritecore: /ferritecore/i,
  soundphysics: /sound-physics|soundphysics/i,
  origins: /^origins-/i,
  farmersdelight: /farmersdelight/i,
  tide: /^tide-/i,
  bomd: /^bomd-/i,
  dungeonsarise: /dungeonsarise/i,
  solarauth: /solarauth/i,
  solardiary: /solardiary/i,
  artifacts: /^artifacts-/i,
  trinkets: /trinkets/i,
  sereneseasons: /sereneseasons/i,
  yungs: /yungs/i,
  clothconfig: /cloth-config/i,
};

const STOP = new Set([
  "есть",
  "нету",
  "нет",
  "ли",
  "на",
  "сервере",
  "сервер",
  "сборке",
  "сборки",
  "клиенте",
  "лаунчере",
  "мод",
  "мода",
  "моды",
  "нужен",
  "нужно",
  "можно",
  "качать",
  "скачать",
  "поставить",
  "стоит",
  "входит",
  "лежит",
  "уже",
  "какой",
  "какие",
  "что",
  "это",
  "про",
  "для",
  "как",
]);

function scoreEntry(nq: string, tokens: string[], entry: ClientModEntry) {
  const h = hayOf(entry);
  let s = 0;
  for (const [alias, re] of Object.entries(ALIASES)) {
    if (nq.includes(alias) && re.test(entry.file)) s += 50;
  }
  for (const t of tokens) {
    const clean = t.replace(/[^a-z0-9а-я]/gi, "");
    if (clean.length < 4 || STOP.has(clean)) continue;
    if (h.includes(clean)) s += Math.min(clean.length, 14);
  }
  return s;
}

/** Есть ли мод в обязательной клиентской папке (не optional). */
export function findClientMod(question: string): {
  hit: ClientModEntry | null;
  optionalHit: ClientModEntry | null;
} {
  const m = loadClientPack();
  const nq = normalizeModQuery(question);
  const tokens = nq.split(" ").filter((t) => t.length >= 4);

  let best: ClientModEntry | null = null;
  let bestS = 0;
  for (const e of m.mods) {
    const s = scoreEntry(nq, tokens, e);
    if (s > bestS) {
      bestS = s;
      best = e;
    }
  }
  let opt: ClientModEntry | null = null;
  let optS = 0;
  for (const e of m.optional) {
    const s = scoreEntry(nq, tokens, e);
    if (s > optS) {
      optS = s;
      opt = e;
    }
  }

  return {
    hit: bestS >= 14 ? best : null,
    optionalHit: optS >= 14 ? opt : null,
  };
}

/** Имя мода из вопроса, которого нет в jar. */
function absentModLabel(question: string): string | null {
  const nq = normalizeModQuery(question);
  const tokens = nq.split(" ").filter((t) => t.length >= 3 && !STOP.has(t));
  if (!tokens.length) return null;

  // алиас в вопросе, но файла нет
  for (const alias of Object.keys(ALIASES)) {
    if (!nq.includes(alias)) continue;
    const m = loadClientPack();
    const re = ALIASES[alias]!;
    if (m.mods.some((e) => re.test(e.file))) continue;
    if (m.optional.some((e) => re.test(e.file))) continue;
    return alias;
  }

  const needle = tokens.join("").replace(/[^a-z0-9а-я]/gi, "");
  if (needle.length < 3) return null;
  const m = loadClientPack();
  const all = [...m.mods, ...m.optional];
  if (all.some((e) => hayOf(e).includes(needle))) return null;
  // латиница / короткое имя мода — честный «нет»
  if (
    /^[a-z0-9]+$/i.test(needle) ||
    /create|jei|optifine|sodium|iris|fabric/i.test(needle)
  ) {
    return tokens.join(" ");
  }
  return null;
}

/** Полный список jar — источник правды для Gemini. */
export function clientModsPromptBlurb(): string {
  const m = loadClientPack();
  const files = m.mods.map((x) => x.file);
  const opt = m.optional.map((x) => x.file);
  const src = m.live ? "live-папка" : "JSON fallback";
  return [
    `КЛИЕНТСКАЯ СБОРКА — источник правды (${src}, ${m.updated}, ${files.length} jar).`,
    `ПОЛНЫЙ СПИСОК (если jar есть — мод УЖЕ в сборке/лаунчере; НЕ говори «нет», НЕ выдумывай чужие моды вроде Limbos):`,
    files.join(", "),
    opt.length ? `optional/: ${opt.join(", ")}` : "optional/: пусто или только FWA.",
    "Явно: динамический свет = **LambDynamicLights** — ЕСТЬ. Sodium/Iris/Mouse Tweaks/InvMove/Litematica/Syncmatica/Emotecraft/Voice Chat — ЕСТЬ.",
    "Если мода нет в списке jar — честно скажи НЕТ (Create/JEI/OptiFine обычно нет).",
  ].join("\n");
}

export function answerClientModPresence(question: string): {
  answer: string;
  sources: { title: string; href: string }[];
} | null {
  // Геймплей («как крафтить / готовить FD») — НЕ ответ про jar
  if (
    /рецепт|скрафт|крафт|готов|книг[ауеи]|как\s+(найти|узнать|свар|пожар|сделать|приготовить)|где\s+смотреть|кастрюл|нож|доск|плит/i.test(
      question,
    )
  ) {
    return null;
  }

  const aboutPresence =
    /(есть|нету|нет\s+ли|лежит|входит|в\s+сборк|в\s+лаунчер|поставлен|включ|стоит\s+ли|нужно\s+ли\s+качать|а\s+есть|качать\s+ли)/i.test(
      question,
    ) ||
    /mouse\s*tweak|маус\s*твик|invmove|sodium|iris|litematica|smooth\s*scroll|betterf3|динамическ[а-я]*\s*свет|dynamic\s*light|lamb\s*dynamic|шейдер|voice\s*chat|immediately\s*fast/i.test(
      question,
    );

  if (!aboutPresence) return null;

  const { hit, optionalHit } = findClientMod(question);
  const sources = [
    { title: "Клиентские моды", href: "/docs/mods/client-mods" },
    {
      title: "Разрешённые моды",
      href: "/docs/informaciya/rules/allowed-mods",
    },
    { title: "Лаунчер", href: "/launcher" },
  ];

  if (hit) {
    const isDyn = /lambdynamiclights/i.test(hit.file);
    const extra = isDyn
      ? " Это и есть динамический свет от факелов/предметов в руке — клиентский мод, уже в лаунчере Solar."
      : "";
    return {
      answer: `Да. В клиентской сборке Solar уже есть **${hit.file}** (папка \`client-mods\` / лаунчер).${extra} Отдельно качать не надо, если ставил пакет с [лаунчера](/launcher).\n\nПодробнее: [клиентские моды](/docs/mods/client-mods), [разрешённые моды](/docs/informaciya/rules/allowed-mods).`,
      sources,
    };
  }

  if (optionalHit) {
    return {
      answer: `В обязательной сборке нет, но в **optional** есть **${optionalHit.file}** — по желанию. См. [клиентские моды](/docs/mods/client-mods).`,
      sources: [{ title: "Клиентские моды", href: "/docs/mods/client-mods" }],
    };
  }

  const absent = absentModLabel(question);
  if (absent) {
    return {
      answer: `Нет — в клиентской сборке Solar jar под **${absent}** не лежит. Не ставь левые моды без проверки [правил](/docs/informaciya/rules/allowed-mods). Что уже есть — в [лаунчере](/launcher) / [клиентских модах](/docs/mods/client-mods).`,
      sources,
    };
  }

  return null;
}

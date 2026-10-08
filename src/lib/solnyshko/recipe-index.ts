import fs from "fs";
import path from "path";

type FdRecipe = {
  id: string;
  station: string;
  results: string[];
  ingredients: string[];
};

const RU: Record<string, string> = {
  "farmersdelight:ham": "ветчина",
  "farmersdelight:smoked_ham": "копчёная ветчина",
  "farmersdelight:bacon": "бекон",
  "farmersdelight:cooked_bacon": "жареный бекон",
  "farmersdelight:honey_glazed_ham_block": "ветчина в меду (пир)",
  "farmersdelight:hamburger": "гамбургер",
  "farmersdelight:bacon_sandwich": "сэндвич с беконом",
  "farmersdelight:bacon_and_eggs": "бекон с яйцами",
  "farmersdelight:cooked_rice": "варёный рис",
  "farmersdelight:beef_patty": "котлета",
  "minecraft:porkchop": "сырая свинина",
  "minecraft:cooked_porkchop": "жареная свинина",
  "minecraft:sweet_berries": "сладкие ягоды",
  "minecraft:honey_bottle": "бутылка мёда",
  "minecraft:bowl": "миска",
  "minecraft:bone": "кость",
  "minecraft:bread": "хлеб",
  "#c:foods/bread": "хлеб",
  "#c:foods/cooked_bacon": "жареный бекон",
  "#c:foods/leafy_green": "зелень/капуста",
  "#c:crops/tomato": "томат",
  "#c:crops/onion": "лук",
};

const ALIAS: Record<string, string[]> = {
  ветчин: ["farmersdelight:ham", "ham"],
  ham: ["farmersdelight:ham", "ham"],
  бекон: ["bacon", "farmersdelight:bacon"],
  bacon: ["bacon"],
  рис: ["rice", "cooked_rice"],
  гамбургер: ["hamburger"],
  hamburger: ["hamburger"],
  свинин: ["porkchop", "ham"],
  мёд: ["honey"],
  мед: ["honey"],
};

function niceId(id: string) {
  if (RU[id]) return RU[id];
  return id.replace(/^[^:]+:/, "").replace(/^#c:[^/]+\//, "").replace(/_/g, " ");
}

let cache: FdRecipe[] | null = null;

function loadRecipes(): FdRecipe[] {
  if (cache) return cache;
  const file = path.join(process.cwd(), "content", "solnyshko", "fd-recipes.json");
  if (!fs.existsSync(file)) {
    cache = [];
    return cache;
  }
  let raw = fs.readFileSync(file, "utf8");
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  cache = JSON.parse(raw) as FdRecipe[];
  return cache;
}

function matchQuery(q: string): string[] {
  const keys: string[] = [];
  const lower = q.toLowerCase().replace(/ё/g, "е");
  for (const [alias, ids] of Object.entries(ALIAS)) {
    if (lower.includes(alias)) keys.push(...ids);
  }
  // свободные слова 4+
  for (const t of lower.split(/[^a-zа-я0-9]+/i)) {
    if (t.length >= 4) keys.push(t);
  }
  return [...new Set(keys)];
}

function hayHasKey(hay: string, k: string) {
  const key = k.toLowerCase();
  // "ham" не должен матчить "hamburger"
  if (key === "ham") {
    return /(?:^|[^a-z]):?ham(?:[^a-z]|$)|(?:^|_)ham(?:[^a-z]|$)/.test(hay);
  }
  if (key.length <= 3) {
    return new RegExp(`(?:^|[^a-z0-9])${key}(?:[^a-z0-9]|$)`).test(hay);
  }
  return hay.includes(key);
}

const COOK_HOWTO = `Рецепты кухни смотри так:

1. Команда **\`/fdguide\`** (или **\`/fdbook\`**) — меню «как готовить»: доска, кастрюля, плита и примеры блюд
2. Поставь **кастрюлю** на плиту/огонь — слева книга рецептов (супы/рагу)
3. База: **нож** + **доска** + **плита** + **кастрюля** — гайд [кухня](/docs/mods/farmers-delight)
4. JEI в сборке нет — конкретное блюдо спроси у меня («ветчина», «рис»)

Отдельной книги-предмета FD нет (бумага+холст = ванильная книга). Аддоны: Ocean / More / Pumpkin / Display. Вино — [виноградник](/docs/mods/vinery).`;

/** Как готовить / где рецепты FD — до поиска по продуктам. */
export function answerCookingHowto(question: string): {
  answer: string;
  sources: { title: string; href: string }[];
} | null {
  const q = question.toLowerCase().replace(/ё/g, "е");
  const aboutFd =
    /farmers?\s*delight|фармер|кухн|кастрюл|готов|еда\s*fd|\bfd\b/i.test(q);
  const howto =
    /где\s+(смотреть|найти|взять)|как\s+(найти|узнать|смотреть|готовить|скрафтить|открыть)|книг[ауеи].*рецепт|рецепт.*книг|книга\s+рецепт|cooking\s*book|cookbook|как\s+готовить|\/?fdguide|\/?fdbook/i.test(
      q,
    );
  if (!(howto && (aboutFd || /рецепт/i.test(q)))) return null;
  // «как скрафтить гамбургер» — не howto, а конкретный рецепт
  if (
    /гамбургер|ветчин|бекон|рис|суп|сэндвич|котлет|hamburger|bacon|\bham\b/i.test(
      q,
    ) &&
    !/книг/i.test(q)
  ) {
    return null;
  }
  return {
    answer: COOK_HOWTO,
    sources: [{ title: "Кухня", href: "/docs/mods/farmers-delight" }],
  };
}

/** Ищем рецепты FD по ингредиенту/результату (ветчина, бекон…). */
export function searchFoodRecipes(question: string, limit = 6): {
  answer: string;
  sources: { title: string; href: string }[];
} | null {
  const howto = answerCookingHowto(question);
  if (howto) return howto;

  const q = question.toLowerCase().replace(/ё/g, "е");
  const foodAsk =
    /рецепт|скрафт|сварить|пожарить|приготовить|кухн|еда|блюд|farmers|delight|ветчин|бекон|гамбургер|рис|суп|кастрюл|доск|нож|что.*(сделать|приготовить|свар)|можно.*(сделать|свар|пожар)|у меня /i.test(
      q,
    ) ||
    Object.keys(ALIAS).some((a) => q.includes(a));

  if (!foodAsk && !/ветчин|бекон|ham|bacon|hamburger|гамбургер/i.test(q)) {
    return null;
  }

  const keys = matchQuery(question).filter(
    (k) =>
      !/^(farmers?|delight|рецепт|рецепты|книг[ауеи]?|скрафтить|найти|узнать|готовить|готов|кухн[а-я]*)$/i.test(
        k,
      ),
  );
  if (!keys.length) {
    return {
      answer: COOK_HOWTO,
      sources: [{ title: "Кухня", href: "/docs/mods/farmers-delight" }],
    };
  }

  const fromItem = /у меня |что (с|из) |из |сделать (с|из)/i.test(q);
  const recipes = loadRecipes();
  const scored = recipes
    .map((r) => {
      const hay = `${r.id} ${r.results.join(" ")} ${r.ingredients.join(" ")}`.toLowerCase();
      let score = 0;
      for (const k of keys) {
        if (hayHasKey(hay, k)) score += k.length >= 5 ? 4 : 2;
      }
      if (fromItem || /ветчин|бекон|ham\b/i.test(q)) {
        for (const k of keys) {
          if (r.ingredients.some((i) => hayHasKey(i.toLowerCase(), k))) {
            score += 8;
          }
        }
        // если спросили «из ветчины» — результат без ветчины в ингредиентах почти не нужен
        if (
          !r.ingredients.some((i) =>
            keys.some((k) => hayHasKey(i.toLowerCase(), k)),
          )
        ) {
          score -= 10;
        }
      }
      return { r, score };
    })
    .filter((x) => x.score >= 6)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (!scored.length) {
    return {
      answer: `${COOK_HOWTO}\n\nКинь точное имя блюда/продукта (типа «ветчина») — подскажу, во что идёт.`,
      sources: [{ title: "Кухня", href: "/docs/mods/farmers-delight" }],
    };
  }

  const lines = scored.map(({ r }) => {
    const out = r.results.map(niceId).join(", ");
    const ings = r.ingredients.map(niceId).join(" + ");
    return `• **${out}** — ${r.station}: ${ings}`;
  });

  const opinion =
    /ветчин|ham/i.test(q)
      ? "\n\nИмхо: из ветчины кайфовее всего **копчёная** (smoker), а потом **ветчина в меду** на пир — сытно перед данжем."
      : "\n\nСовет: перед боссом нормальная еда FD лучше сырого мяса, по фактам.";

  return {
    answer: `Из кухни Farmers Delight:\n${lines.join("\n")}${opinion}\n\nСетки кастрюли — в её GUI (кнопка книги слева). База станций: [кухня](/docs/mods/farmers-delight).`,
    sources: [{ title: "Кухня", href: "/docs/mods/farmers-delight" }],
  };
}

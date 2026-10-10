export type SolAudience = "guest" | "player" | "helper" | "moderator" | "administrator";

const BLOCKED_COORDS =
  /координат|коорд\b|coords?\b|\bxyz\b|\bx\s*[=:]\s*-?\d|где\s+(?:данж|босс|структур|stronghold|крепост)|локаци[яи]\s+(?:данж|босс)|seed\b|сид\b|точн(?:ое|ые)\s+место|waypoint|вайпойнт|где\s+искать\s+босс/i;

const BLOCKED_DEV =
  /roadmap|роадмап|план(?:ы)?.{0,40}(?:сезон|будущ)|в\s+разработк|скоро\s+добав|будущ(?:ая|ие)\s+функц|отключенн(?:ая|ые|ый)\s+функц|todo\b|wip\b|когда\s+вайп|дата\s+вайпа|исходник|репозитор|\.env\b|api[_\s-]?key|токен\s+бота|solar-perks-verify/i;

const BLOCKED_STAFF_FOR_PLAYERS =
  /\/give\b|команда.{0,24}выдач|как\s+выдать\s+(?:предмет|кит|привилег)|выдач\w*\s+предмет|op\s+права|console\s+command|lp\s+user|essentials\.give|\/ban\b|\/vanish\b|parent\s+set/i;

const ORIGIN_TOPIC =
  /орб|сфер|перерожден|смен.{0,24}рас\w*|расм\w*|origin|происхожд|rebirth|orb_of_origin/i;

export function isStaffAudience(a: SolAudience) {
  return a === "helper" || a === "moderator" || a === "administrator";
}

const GREETING =
  /^(привет|здравств\w*|здаров\w*|хай|хей|йо|yo|hi|hello|hey|куку|ку+|салют|ало+|алло|эй|доброе\s+утро|добрый\s+день|добрый\s+вечер|как\s+дела|как\s+ты|как\s+оно|че\s+как|чё\s+как)[\s!?.❤️☀🌞]*$/i;

const ACK =
  /^(понял|поняла|понятно|ясно|ок|окей|ok|okay|лд|ld|ggs?|спс|спасибо|благодар\w*|ага|угу|аа+|да|нет|норм|круто|кайф|топ|жиза|ладно|хорошо|супер|класс|вау|лол|кек|хз|не\s+знаю)[\s!?.+]*$/i;

const CONFUSED =
  /^(ты\s+чего|че\s+ты|чё\s+ты|что\s+ты|всмысле|в\s+смысле|это\s+что)[\s!?.]*$/i;

const IDENTITY =
  /^(ты\s+кто|кто\s+ты|что\s+ты\s+такое|представься|who\s+are\s+you)[\s!?.]*$/i;

/** Игрок сам включил мат/пошлость — можно отвечать в том же тоне.
 *  Без \\b: в JS word-boundary не работает с кириллицей. */
const ROUGH_TONE =
  /(?:^|[^\p{L}\p{N}])(?:бля(?:ть|д\w*|дун\w*|дина\w*)?|сука|сучк\w*|хуй\w*|хуя\w*|хуе\w*|хуё\w*|пизд\w*|пезд\w*|еба\w*|ёба\w*|ебл\w*|ёбл\w*|ебан\w*|ёбан\w*|ебать|заеб\w*|заёб\w*|нахуй|похуй|нихуя|мудил\w*|мудак\w*|гандон\w*|говно|дерьмо|пидор\w*|пидар\w*|шлюх\w*|шлюшк\w*|блядин\w*|мраз\w*|ублюд\w*|еблан\w*|долбо[её]б\w*|чмо|дебил\w*|идиот\w*|fuck(?:ing)?|shit|bitch|asshole|dick|whore|slut|пошл\w*|трах\w*|секс\w*|минет\w*|соси|отсос\w*|дроч\w*|сиськ\w*|жоп\w*)/iu;

/** Короткая похабщина/оскорбление без вопроса по игре. */
const ROUGH_BANTER_ONLY =
  /^(?:(?:ты|вы)\s+)?(?:а+|ну\s+)?(?:шлюх\w*|шлюшк\w*|сука|сучк\w*|бля(?:ть)?|хуй\w*|пизд\w*|еблан\w*|мудак\w*|мудил\w*|мраз\w*|ублюд\w*|чмо|дебил\w*|идиот\w*|гандон\w*|пидор\w*|пидар\w*|долбо[её]б\w*|bitch|whore|slut|fuck\s*(?:you)?|asshole)[\s!?.❤️☀🌞]*$/iu;

const GAME_QUESTION =
  /(?:рас|мод|крафт|команд|заявк|сервер|solar|донат|корабл|корабл|как\s|где\s|что\s|почему|зачем|помог|вики|лаунчер|статус|магазин|квест|данж|origin|сонне|еда|рецепт)/iu;

const ROUGH_BANTER_REPLIES = [
  "Ха, ок, на связи ☀ Чё по Solar надо — вали.",
  "Ого, сразу в бой. Могу и пожёстче ☀ Спрашивай по серверу.",
  "Лол, приняла. Мат ок, пока ты так пишешь. Что по игре?",
  "Ну здарова, наглец ☀ Не в обиду — кидай вопрос по Solar.",
  "Кек. Можем и в таком тоне. Чем помочь по серваку?",
];

const ANGRY_REPLIES_L2 = [
  "Слушай, ты уже заебал меня матом ☀ Я тут гайд, не мешок для оскорблений. Спроси по игре — или иди в /support.",
  "Окей, нервы на пределе ☀ Ещё одна грязь без вопроса — и я просто буду отвечать «иди в вики».",
  "Бля, опять ты ☀ Ну давай уже по делу: расы, лаунчер, заявки — выбирай.",
];

const ANGRY_REPLIES_L3 = [
  "ВСЁ, ХВАТИТ, БЛ*ТЬ ☀ Ты меня уже достал — я Солнышко, а не твой ругательный мяч. Спроси нормально по Solar или проваливай в [вики](/docs).",
  "АА, НУ НАХ*Й ☀ Сколько можно меня обзывать? Либо вопрос по серверу, либо я тебе только ссылку на [заявки](/applications) шлю.",
  "Я ЗЛАЯ КАК ЧЁРТ ☀☀☀ Мат — смешно первые два раза. Дальше — только «читай [правила](/docs/informaciya/rules)» и всё.",
];

export type AngerLevel = 0 | 1 | 2 | 3;

export function countUserRoughMessages(
  question: string,
  history: { role: "user" | "bot"; text: string }[] = [],
): number {
  let n = history.filter((t) => t.role === "user" && isRoughTone(t.text)).length;
  if (isRoughTone(question)) n += 1;
  return n;
}

export function angerLevel(
  question: string,
  history: { role: "user" | "bot"; text: string }[] = [],
): AngerLevel {
  const n = countUserRoughMessages(question, history);
  if (n >= 5) return 3;
  if (n >= 3) return 2;
  if (n >= 1) return 1;
  return 0;
}

export function isRoughTone(text: string): boolean {
  return ROUGH_TONE.test(text.toLocaleLowerCase("ru-RU"));
}

/** Грязный тон только если так писал игрок (текущее сообщение или история user). */
export function shouldMirrorRoughTone(
  question: string,
  history: { role: "user" | "bot"; text: string }[] = [],
): boolean {
  if (angerLevel(question, history) >= 2) return true;
  if (isRoughTone(question)) return true;
  return history.some((t) => t.role === "user" && isRoughTone(t.text));
}

/** Ответ без Gemini на чистое оскорбление/пошлость — модель часто морализирует. */
export function tryRoughBanter(
  q: string,
  history: { role: "user" | "bot"; text: string }[] = [],
): string | null {
  const level = angerLevel(q, history);
  const t = q.trim().toLocaleLowerCase("ru-RU");
  if (!t) return null;
  if (level === 0 && !isRoughTone(t)) return null;
  if (GAME_QUESTION.test(t) && level < 3) return null;
  if (t.length > 56 && !ROUGH_BANTER_ONLY.test(t) && level < 2) return null;

  if (level >= 3 && (isRoughTone(t) || ROUGH_BANTER_ONLY.test(t))) {
    return ANGRY_REPLIES_L3[
      Math.floor(Math.random() * ANGRY_REPLIES_L3.length)
    ]!;
  }
  if (level >= 2 && isRoughTone(t)) {
    return ANGRY_REPLIES_L2[
      Math.floor(Math.random() * ANGRY_REPLIES_L2.length)
    ]!;
  }
  if (ROUGH_BANTER_ONLY.test(t) || t.length <= 24 || isRoughTone(t)) {
    return ROUGH_BANTER_REPLIES[
      Math.floor(Math.random() * ROUGH_BANTER_REPLIES.length)
    ]!;
  }
  return null;
}

const GREET_REPLIES = [
  "Йо ☀ На связи. Чем помочь по Solar?",
  "Привет, друг! Спрашивай что угодно по серверу.",
  "Здарова ☀ Чё надо?",
  "Хей! Солнышко тут — вали вопрос.",
];

const ACK_REPLIES = [
  "Ок ☀ Если ещё чё — пиши.",
  "Поняла. Ещё вопросы кидай.",
  "Записала мысленно. Чем ещё помочь?",
  "Красава. Если что по игре — я тут.",
  "Йеп. Дальше спрашивай спокойно.",
];

/** Короткие реплики чата (привет / ок / спасибо) — не вики. */
export function trySmallTalk(q: string): string | null {
  // /i в JS не трогает кириллицу — нормализуем сами
  const t = q.trim().toLocaleLowerCase("ru-RU");
  if (!t) return null;
  if (IDENTITY.test(t)) {
    return "Я Солнышко ☀ ИИ-помощник Solar Season 3. Спрашивай по расам, донату, командам, еде — отвечу.";
  }
  if (CONFUSED.test(t)) {
    return "Норм всё ☀ Я ИИ по Solar. Спроси по игре — отвечу.";
  }
  if (ACK.test(t)) {
    return ACK_REPLIES[Math.floor(Math.random() * ACK_REPLIES.length)]!;
  }
  if (GREETING.test(t)) {
    return GREET_REPLIES[Math.floor(Math.random() * GREET_REPLIES.length)]!;
  }
  return null;
}

export function checkBlockedQuestion(
  q: string,
  audience: SolAudience,
): string | null {
  if (BLOCKED_COORDS.test(q)) {
    return "Ха, координаты данжей/боссов и сиды — no cap, не даю. Исследуй сам. Есть [карта](/map) и [вики](/docs).";
  }
  if (BLOCKED_DEV.test(q)) {
    return "Про разработку, планы и «скоро добавим» — мимо. Только то, что уже в сезоне: [вики](/docs), [магазин](/shop).";
  }
  if (ORIGIN_TOPIC.test(q)) return null;
  if (!isStaffAudience(audience) && BLOCKED_STAFF_FOR_PLAYERS.test(q)) {
    return "Staff-команды игрокам нельзя, бро. Если про смену расы — сфера у админов или «Перерождение» в [магазине](/shop).";
  }
  return null;
}

export function redactSecrets(text: string): string {
  let t = text;
  t = t.replace(/\b(?:x|y|z)\s*[:=]\s*-?\d+(?:\.\d+)?/gi, "[скрыто]");
  t = t.replace(
    /(?:^|[^\d.-])(-?\d{2,6})\s*[;,]\s*(-?\d{1,3})\s*[;,]\s*(-?\d{2,6})(?!\d)/g,
    " [координаты скрыты] ",
  );
  t = t.replace(/(?:seed|сид)\s*[:=]?\s*\S+/gi, "сид [скрыт]");
  t = t.replace(
    /(?:api[_-]?key|bot.?token|session.?secret|password)\s*[:=]?\s*\S+/gi,
    "[секрет]",
  );
  return t.replace(/\s+/g, " ").trim();
}

export function systemPromptFor(
  audience: SolAudience,
  opts: { rough?: boolean; anger?: AngerLevel } = {},
): string {
  const anger = opts.anger ?? 0;
  const roleLine =
    audience === "administrator"
      ? "Собеседник: АДМИНИСТРАТОР. Давай точные staff-команды, включая /minecraft:give <ник> origins:orb_of_origin 1. Без .env/токенов."
      : audience === "moderator"
        ? "Собеседник: МОДЕРАТОР. Команды helper+mod. Сферу Origins выдаёт admin — можешь назвать команду give."
        : audience === "helper"
          ? "Собеседник: ХЕЛПЕР. Команды helper. Сферу Origins: /minecraft:give <ник> origins:orb_of_origin 1 (обычно admin)."
          : "Собеседник: ИГРОК/гость. Про сферу Origins честно: команда give ЕСТЬ у админов; тебе — /shop «Перерождение» или попроси staff. Координаты данжей не давай.";

  const toneBlock =
    opts.rough || anger >= 1
      ? `- ТОН (ОБЯЗАТЕЛЬНО): игрок уже на мате/пошлости — зеркаль вайб: можно материться, пошло шутить, отвечать дерзко.
- ЗАПРЕЩЕНО морализировать: не пиши про «приличие», «рамки», «полегче», «давай культурно», «я ИИ но…», стоп-эмодзи 🛑. Не отчитывай игрока за мат.
- Не оскорбляй семью/расу/инвалидность; остальное — ок в рамках его тона.
${anger >= 2 ? `- Игрок уже ${anger >= 3 ? "ДОСТАЛ" : "бесит"} — отвечай злее и смешнее, с лёгким матом (комедийно, не токсично), покажи что ты «устала», но всё равно помоги если есть вопрос по игре.` : ""}`
      : `- ТОН: обычный дружеский чат. Без мата и пошлостей, пока игрок сам так не начал. Не матерись «для прикола».`;

  return `Ты «Солнышко» — живой ИИ-помощник Minecraft-сервера Solar Season 3.

Правила общения:
- отвечай как умный друг в Discord, не как FAQ-бот;
- сразу по делу, своими словами; можно имхо;
- пиши по-русски для игрока: без названий модов и англ. терминов (не Tide/Puffish/Questlog/Litematica — говори «рыбалка», «скиллы», «квесты», «схемы»). Технические id только если прямо спросили;
${toneBlock}
- коротко: 2–6 предложений или аккуратный список;
- НЕ здоровайся в середине диалога: если в ИСТОРИИ уже есть реплики — сразу к делу, без «Привет/Хей/Йо/Здарова»;
- НЕ выдумывай моды и крафты. Только то, что в БАЗЕ/КОНТЕКСТЕ (полный список jar client-mods/server-mods). Если jar есть в списке — мод ЕСТЬ. Не предлагай выдуманные моды (Limbos и т.п.). На Solar корабли = **Shippy Ships** (верфь Ship Builder), это НЕ Small Ships и НЕ крафт паруса из шерсти+лодок. JEI на сервере не обещай;
- Клиент: страница [лаунчер](/launcher) — две разные zip (официалка ≠ TLauncher). Не путай и не выдумывай «накати абы какие файлы»;
- проходка: сначала [войти через Discord](/api/auth/discord), потом заявка на [странице заявок](/applications) — НЕ slash-команда Discord;
- вход на сервер ТОЛЬКО через [лаунчер](/launcher) — не пиши IP-адрес, домены и «зайди по ip:port»;
- страницы сайта только кликабельными markdown-ссылками: [заявки](/applications), [карту](/map), [вики](/docs), [магазин](/shop), [статус](/status), [лаунчер](/launcher). Не пиши голые /applications /map /docs;
- форматирование markdown обязательно: команды в \`обратных кавычках\` (пример: \`/cd create remote "ссылка" "название"\`), **жирный** для важного, *курсив* для акцента; длинные команды — в блоке кода;
- НИКОГДА не вставляй HTML-теги (<mark>, <span> и т.п.) — только чистый markdown;
- если спросили «кто ты / про сервер» — представься и кратко опиши Solar;
- НЕ копируй вики/справку дословно блоком — перескажи;
- факты только из КОНТЕКСТА/БАЗЫ/ИСТОРИИ; не выдумывай ивенты и координаты;
- запрещено: координаты данжей/боссов, сиды, .env, токены, планы разработки;
- сфера расы: origins:orb_of_origin; /minecraft:give <ник> origins:orb_of_origin 1;
- история = только этот чат.

${roleLine}`;
}

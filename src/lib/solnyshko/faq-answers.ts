import {
  formatShopPrice,
  shopSkillResetItem,
} from "@/lib/shop-catalog";

/**
 * Готовые ответы «как в чате» — не копипаста вики.
 * Используются как справка для ИИ и как fallback без квоты.
 */

export type FaqHit = {
  answer: string;
  sources: { title: string; href: string }[];
};

const ORIGINS_LIST = `Расы (Origins) на Solar — выбираешь при входе, активка часто на **G**:

• **Human** — без плюсов/минусов
• **Avian** — птица, планирование, нельзя мясо, спать только высоко
• **Arachnid** — паук, лазает по стенам, только мясо, меньше HP
• **Elytrian** — почти всегда на крыльях, без тяжёлой брони
• **Shulk** — доп. карман, лут не теряется при смерти
• **Feline** — кот, нет урона от падения, криперы боятся
• **Enderian** — телепорт, вода жжёт
• **Merling** — водяной, на суше задыхается
• **Blazeborn** — огонь ок, вода/снежки вредят
• **Phantom** — «призрак» сквозь стены, на солнце плохо

Сменить потом: товар «Перерождение» в [магазине](/shop) или сфера у админов. Детали рас — [Origins](/docs/mods/origins)`;

const SONNE = `**SONNE** — префикс ☀, /hat, /wb, 1 пассивный pet, /hide /show, промо, без КД чата и /skin. Без nick, /ec, fly, kits, homes, tpa.

**SONNE+** — всё то же + 1 pet любых типов, pet на голове, HEX имени.

Цены в [магазине](/shop).`;

const START = `Короче старт:
1) [Войди через Discord](/api/auth/discord) на сайте
2) Открой [заявки](/applications) и подай заявку там
3) После одобрения скачай [лаунчер](/launcher) (официалка или TLauncher — разные сборки)
4) Запускай мир только из [лаунчера](/launcher) — лаунчер сам подставит подключение
5) Зашёл — выбери Origin, качай скиллы на **K**

Карта мира — [карта](/map), вики — [вики](/docs).`;

const PLAYER_CMDS = `Частые команды игрока: **/cd** (меню), /bal /pay, /msg, /report /ask, /skin, /sit /lay, /dslink, /pingwheel config, **/fdguide** (рецепты кухни).
Скиллы — **K**, Origin-активка часто **G**, голос **V**, пинг часто **Mouse5**.`;

const SKILL_RESET = `**Сфера перепрокачки** сбрасывает сразу все 4 дерева навыков: выживание, бой, добычу и ремесло. Потраченные очки возвращаются, опыт веток и прогресс мира остаются.

Купить можно в [магазине](/shop) за **${formatShopPrice(shopSkillResetItem.price)}**. После выдачи возьми сферу в основную руку и нажми **ПКМ** — предмет расходуется. Подробнее: [скиллы](/docs/mods/levelz).`;

const MOUSE_TWEAKS = `**Mouse Tweaks** уже в клиентской сборке: файл \`MouseTweaks-fabric-mc1.21-2.26.jar\` в \`client-mods\` / лаунчере. Качать отдельно не надо.

См. [клиентские моды](/docs/mods/client-mods) и [лаунчер](/launcher).`;

const DYNAMIC_LIGHT = `Да — **динамический свет уже в клиентской сборке**: мод **LambDynamicLights** (\`lambdynamiclights-…jar\` в \`client-mods\` / лаунчере).

Факел/предмет в руке подсвечивает окружение. Качать отдельно не нужно. Разрешён правилами: [разрешённые моды](/docs/informaciya/rules/allowed-mods).`;

const LAUNCHER_OFFICIAL = `Для **официального Minecraft** (лицензия / Microsoft / Mojang Launcher):

1. Открой [лаунчер](/launcher)
2. Скачай именно блок **«Официальный Minecraft»** (не TLauncher)
3. В архиве уже **Java 1.21.1 + Fabric** — ставь эту сборку в официальный клиент по файлам из zip
4. **Не** мешай с TLauncher-сборкой

Запуск — только из [лаунчера](/launcher). Проходка — [заявки](/applications). Моды: [клиентские моды](/docs/mods/client-mods).`;

const LAUNCHER_TLAUNCHER = `Для **TLauncher**:

1. Открой [лаунчер](/launcher)
2. Скачай блок **«TLauncher»** (не официальную)
3. Ставь только эту zip — она под структуру папок TLauncher
4. Официальную сборку в TLauncher **не** пихай

Запуск — [лаунчер](/launcher), проходка — [заявки](/applications).`;

const LAUNCHER_GENERAL = `На Solar **две разные** клиентские сборки на [лаунчере](/launcher):

• **Официальный Minecraft** (Microsoft/Mojang) → zip «Официальный Minecraft»
• **TLauncher** → отдельный zip «TLauncher»

Не путай их. Версия: **Java 1.21.1 Fabric**. После установки — вход только через [лаунчер](/launcher), проходка через [заявки](/applications). Гайд: [как начать](/docs/guides/how-to-start).`;

const ORIGIN_ADVICE = `Имхо, если без заморочек — бери **Human**.
Хочешь вайб и мобильность — **Elytrian** (небо/Энд) или **Enderian** (телепорт, но вода — боль).
Океан/рыбалка — однозначно **Merling**.
Незер и огонь — **Blazeborn**.
Боишься потерять лут — **Shulk**, имба для осторожных.
Пауки/пещеры — **Arachnid**.

Активка часто на **G**. Список всех рас могу кинуть отдельно.`;

const SHIPS = `На Solar корабли — мод **Shippy Ships** (это НЕ Small Ships!).

Как построить:
1) Скрафти **Ship Builder** (верфь) из **3 брёвен**
2) Поставь блок, ПКМ — пошаговая сборка
3) Клади нужные ресурсы в верфь на каждом шаге
4) Дотащи готовый корабль до воды и садись

Типы: **Sailboat** (лёгкий), **Cog** (склад/HP), **Caravel** (океан, нужна команда).
Управление: **W** — раскрыть парус, **S** — убрать. Ремонт — досками ПКМ по кораблю.

Подробнее: [корабли](/docs/mods/shippy-ships).`;

const NEW_MECH = `Коротко по системам:

• **Артефакты** — не крафтятся, слоты украшений, лут из сундуков и мимиков. [гайд](/docs/mods/artefakty)
• **Эндерит** — взорвать руду в Краю → незеритовая кирка → 4 обломка + 4 алмаза. [гайд](/docs/mods/enderit)
• **Почта** — ящик (плиты+доски+бирка), голубь, семена, 3 XP на адрес. [гайд](/docs/mods/pochta)
• **Деньги** — ячейка + банкомат, /bal /pay; >50 ¤ через Discord. [гайд](/docs/mods/dengi)
• **Экраны** — сначала пульт, потом рамка/телек. [гайд](/docs/mods/kamera)
• **Рации** — провод/антенна/walkie или трансивер, одна частота. [гайд](/docs/mods/radio)
• **Пинг** — часто Mouse5, иначе /pingwheel config. [гайд](/docs/mods/ping)
• **Кухня** — FD + Ocean/More/Pumpkin/Display; рецепты: /fdguide. [гайд](/docs/mods/farmers-delight)
• **Виноградник** — Vinery, лоза → кадка → бочка. [гайд](/docs/mods/vinery)
• **Звери** — Faunus + утки/гуси. [гайд](/docs/mods/zveri)`;

const RADIO = `Рядом говори на **V**. Дальше — рации (**Simple Radio**).

**Карманное:** рация (walkie) или трансивер — носишь с собой, одна частота с отрядом.

**Стационар** (радио / динамик / микрофон + антенна на базе):
• база может **вещать** и **принимать** эфир, пока ты не у компа
• микрофон ловит голос рядом с блоком, динамик/радио воспроизводят на частоте
• антенна рядом усиливает связь
• ходишь с рацией на **той же частоте** — слышишь базу и наоборот

Стартовый крафт: медная проволока → антенна → walkie. Гайд: [рации](/docs/mods/radio). Пинг точки: [пинг](/docs/mods/ping).`;

const CRITTERS = `Сейчас звери — **Faunus** и утки/гуси (Critters and Companions нет).
Капуцин — любой фрукт; утка — рыба; гусь — ламинария/морская трава. Ещё пираньи, арапаимы, якаре, кецали и др.
Список: [звери](/docs/mods/zveri).`;

const VINERY = `**Vinery (вино):** 6 ягод в кадку → топчешься → 2 бутылки сока (винные бутылки!). Бродильная бочка: сок слева → ингредиенты + пустая винная бутылка → ~5 мин → выход справа. Shift+ПКМ — слить сок. Пиво/водка — другой мод (Brewery). [гайд](/docs/mods/vinery).`;

const SERVER_BLURB = `Solar Season 3 — ваниль+моды Minecraft 1.21.1 Fabric: Origins, скиллы (K), Questlog, Shippy Ships, Farmers Delight (+аддоны), Vinery, Faunus/утки, рации, пинг, данжи Arise/YUNG, артефакты, эндерит, почта, банкомат, донат SONNE в [магазине](/shop).
Проходка: [войти через Discord](/api/auth/discord) → подать заявку на [странице заявок](/applications). Вход на сервер — только [лаунчер](/launcher). Вики — [вики](/docs), карта — [карта](/map), онлайн — [статус](/status).
Я «Солнышко» — помогу по командам, расам, еде, донату. Координаты данжей не сливаю.`;

export function tryFaqAnswer(question: string): FaqHit | null {
  const q = question.toLowerCase().replace(/ё/g, "е");

  if (
    /(что\s+(это\s+за\s+)?сервер|расскаж\w*\s+про\s+сервер|про\s+solar|что\s+такое\s+solar)/i.test(
      q,
    )
  ) {
    return {
      answer: SERVER_BLURB,
      sources: [
        { title: "Как начать", href: "/docs/guides/how-to-start" },
        { title: "Вики", href: "/docs" },
      ],
    };
  }

  if (
    /сфер\w*.{0,30}(перепрок|навык|скилл|дерев)|(?:перепрок|сброс).{0,30}(навык|скилл|дерев)|как.{0,20}(сброс|перекач).{0,20}(навык|скилл)/i.test(
      q,
    )
  ) {
    return {
      answer: SKILL_RESET,
      sources: [
        { title: "Скиллы", href: "/docs/mods/levelz" },
        { title: "Магазин", href: "/shop" },
      ],
    };
  }

  // совет по расе (мнение)
  if (
    /(совет|посовет|рекоменд|лучш|взять|выбрать|выберу).{0,25}(рас[аыуе]|origin|происхожд)/i.test(
      q,
    ) ||
    /(рас[аыуе]|origin).{0,20}(совет|посовет|рекоменд|лучш)/i.test(q) ||
    /какую\s+рас/i.test(q)
  ) {
    return {
      answer: ORIGIN_ADVICE,
      sources: [{ title: "Origins", href: "/docs/mods/origins" }],
    };
  }

  // список рас — НЕ матчить «расскажи» через ^рас
  if (
    /(какие|какой|список|перечисл|есть\s+ли).{0,24}(рас[аыуе]?|origin|происхожд)/i.test(
      q,
    ) ||
    /^(рас[аыуе]?|origins?|происхожд)\b/i.test(q.trim()) ||
    /(рас[аыуе]?|origin|происхожд).{0,15}(какие|есть|список)/i.test(q) ||
    /какие\s+есть\s+рас/i.test(q)
  ) {
    return {
      answer: ORIGINS_LIST,
      sources: [{ title: "Origins", href: "/docs/mods/origins" }],
    };
  }

  if (
    /орб|сфер(а|у|ы)?\s+происхожд|перерожден|смен.{0,24}рас\w*|расм\w*|выдач.{0,40}(рас\w*|origin|сфер|орб|предмет)|команд.{0,24}(рас\w*|сфер|орб|origin|происхожд)/i.test(
      q,
    )
  ) {
    return {
      answer:
        "Смена расы: предмет **origins:orb_of_origin** («Сфера происхождения»).\nКоманда админа: `/minecraft:give <ник> origins:orb_of_origin 1`\nИгроку без /give — «Перерождение» в [магазине](/shop) или попроси staff.",
      sources: [
        { title: "Магазин", href: "/shop" },
        { title: "Origins", href: "/docs/mods/origins" },
      ],
    };
  }

  if (
    /\bsonne\b|донat|привилег|что\s+да[её]т\s+sonne|магазин\s+привилег/i.test(q)
  ) {
    return {
      answer: SONNE,
      sources: [
        { title: "Магазин", href: "/shop" },
        { title: "Донат", href: "/docs/informaciya/donat" },
      ],
    };
  }

  if (
    /\bip\b|айпи|адрес\s+сервер|ручн.{0,12}подключ|сетевая\s+игра|25813|play\.|:\s*25813/i.test(
      q,
    )
  ) {
    return {
      answer: LAUNCHER_GENERAL,
      sources: [
        { title: "Лаунчер", href: "/launcher" },
        { title: "Как начать", href: "/docs/guides/how-to-start" },
      ],
    };
  }

  if (/как (начать|зайти|играть)|проходк|заявк/i.test(q)) {
    return {
      answer: START,
      sources: [
        { title: "Как начать", href: "/docs/guides/how-to-start" },
        { title: "Заявки", href: "/applications" },
      ],
    };
  }

  if (
    /кораб|лодк|парус|shippy|sailboat|caravel|\bcog\b|верф|ship\s*builder|как\s+построить\s+лод/i.test(
      q,
    )
  ) {
    return {
      answer: SHIPS,
      sources: [{ title: "Корабли", href: "/docs/mods/shippy-ships" }],
    };
  }

  if (/mouse\s*tweak|маус\s*твик|мауствйк|маус\s*твикс/i.test(q)) {
    return {
      answer: MOUSE_TWEAKS,
      sources: [
        {
          title: "Разрешённые моды",
          href: "/docs/informaciya/rules/allowed-mods",
        },
      ],
    };
  }

  if (
    /динамическ[а-я]*\s*свет|dynamic\s*lights?|lamb\s*dynamic|lambdynamiclights/i.test(
      q,
    )
  ) {
    return {
      answer: DYNAMIC_LIGHT,
      sources: [
        { title: "Клиентские моды", href: "/docs/mods/client-mods" },
        {
          title: "Разрешённые моды",
          href: "/docs/informaciya/rules/allowed-mods",
        },
      ],
    };
  }

  // Лаунчер / официалка / TLauncher — жёсткие факты, без фантазий
  if (
    /официал|лиценз|mojang|microsoft|офиц\w*\s*(клиент|лаунч|майн)/i.test(q) &&
    /лаунч|сборк|установ|скач|как|работ|клиент|мод|зайти|играть/i.test(q)
  ) {
    return {
      answer: LAUNCHER_OFFICIAL,
      sources: [
        { title: "Лаунчер", href: "/launcher" },
        { title: "Клиентские моды", href: "/docs/mods/client-mods" },
      ],
    };
  }

  if (/tlauncher|т\s*лаунчер|тлаунчер/i.test(q)) {
    return {
      answer: LAUNCHER_TLAUNCHER,
      sources: [
        { title: "Лаунчер", href: "/launcher" },
        { title: "Клиентские моды", href: "/docs/mods/client-mods" },
      ],
    };
  }

  if (
    /лаунчер|как\s+(скачать|поставить|установить|накатить)\s*(сборк|мод|клиент)|какую\s+сборк|где\s+скачать\s*(сборк|мод|лаунч)/i.test(
      q,
    )
  ) {
    return {
      answer: LAUNCHER_GENERAL,
      sources: [
        { title: "Лаунчер", href: "/launcher" },
        { title: "Как начать", href: "/docs/guides/how-to-start" },
      ],
    };
  }

  if (
    /раци|трансивер|walkie|simple\s*radio|частот[аыуе]|радиосмитер|медн\w*\s*проволо|стационар|динамик(?!ическ)|микрофон|антенн|\bрадио\b/i.test(
      q,
    )
  ) {
    return {
      answer: RADIO,
      sources: [
        { title: "Рации", href: "/docs/mods/radio" },
        { title: "Голос", href: "/docs/server-content/nastroika-golosovogo-chata" },
      ],
    };
  }

  if (/пинг|ping\s*wheel|mouse\s*5|ткнуть\s+точк|\/metka|метк[аиу]/i.test(q)) {
    return {
      answer:
        "Пинг по миру — клавиша часто **Mouse5**; если нет — `/pingwheel config`.\nСвой отряд: `/metka create название пароль`, войти — `/metka join название пароль`, выйти — `/metka leave`, состав — `/metka info`. Гайд: [пинг](/docs/mods/ping).",
      sources: [{ title: "Пинг", href: "/docs/mods/ping" }],
    };
  }

  if (/мебел|стул|полк[аиу]|ставн|молоток\s*мебел/i.test(q)) {
    return {
      answer:
        "Мебель: стул (доски+палки, ×3), стол и полка — то же из нужной породы. Молоток крутит поставленное, ПКМ по стулу — сесть. Гайд: [мебель](/docs/mods/mebel).",
      sources: [{ title: "Мебель", href: "/docs/mods/mebel" }],
    };
  }

  if (/жител|флорист|охотник|шахт[её]р|океанограф|лесник|more\s*villager|професс/i.test(q)) {
    return {
      answer:
        "Новые жители появляются у своих станций: садовый стол, охотничий пост, шахтёрский стол, стол океанографии, лесной верстак, чертёжный стол, алтарь пурпура, верстак порчи, холодильник. Позолоченная станция помечена как незавершённая. Гайд: [жители](/docs/mods/zhiteli).",
      sources: [{ title: "Жители", href: "/docs/mods/zhiteli" }],
    };
  }

  if (
    /хорьк|ferret|стрекоз|красн\w*\s*панд|critters|прируч|звер(и|ь|юк)|выдр|капуцин|faunus|утк|гус[ьи]|пирань|арапаим|кецал/i.test(
      q,
    )
  ) {
    return {
      answer: CRITTERS,
      sources: [{ title: "Звери", href: "/docs/mods/zveri" }],
    };
  }

  if (/виног|винер[ия]|vinery|винн\w*\s*бут|сидр|яблочн\w*\s*пресс|кадк\w*\s*для\s*виног/i.test(q)) {
    return {
      answer: VINERY,
      sources: [{ title: "Виноградник", href: "/docs/mods/vinery" }],
    };
  }

  if (
    /нов(ые|ая|ое)\s+механ|что\s+добав|артефакт|эндерит|enderite|голуб(ь|и|я)|почтов|банкомат|ячейк|обменник|вебкам|вебка|waterframes|экран(ы|ов)\s+с\s+видео|троп(ы|а)\s+под\s+ног|раци|пинг|кухн\w*\s*аддон/i.test(
      q,
    )
  ) {
    return {
      answer: NEW_MECH,
      sources: [
        { title: "Артефакты", href: "/docs/mods/artefakty" },
        { title: "Рации", href: "/docs/mods/radio" },
        { title: "Звери", href: "/docs/mods/zveri" },
      ],
    };
  }

  if (/команд/i.test(q) && !/staff|хелпер|модер|админ|ban|kick|lp /i.test(q)) {
    return {
      answer: PLAYER_CMDS,
      sources: [
        {
          title: "Команды",
          href: "/docs/server-content/poleznye-komandy-dlya-igrokov",
        },
      ],
    };
  }

  return null;
}

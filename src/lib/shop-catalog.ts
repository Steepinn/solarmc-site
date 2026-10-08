export type ShopDuration = "1m" | "3m" | "6m" | "lifetime";

export type ShopPlan = {
  id: "sonne" | "sonne_plus";
  name: string;
  tagline: string;
  accent: "gold" | "warm";
  privileges: string[];
  prices: Record<ShopDuration, number>;
};

export type ShopItem = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  privileges: string[];
  price: number;
};

export const shopDurations: { id: ShopDuration; label: string; hint: string }[] =
  [
    { id: "1m", label: "1 месяц", hint: "На 30 дней" },
    { id: "3m", label: "3 месяца", hint: "Выгоднее месяца" },
    { id: "6m", label: "6 месяцев", hint: "Полсезона комфорта" },
    { id: "lifetime", label: "Навсегда", hint: "Пока живёт мир" },
  ];

/**
 * Привилегии = LuckPerms sonne / sonneplus (apply-solar-ranks.txt, 2026-07-23b).
 * Без nick/ec/fly/heal/feed/kits/homes/tp/warps. GSit sit/lay — у всех player, не донат.
 */
export const shopPlans: ShopPlan[] = [
  {
    id: "sonne",
    name: "SONNE",
    tagline: "Косметика и комфорт — без преимущества в PvE",
    accent: "gold",
    privileges: [
      "Префикс ☀ в чате и TAB",
      "/hat — блок на голову",
      "/workbench (/wb) — верстак без блока",
      "Питомец: 1 пассивный (/pet) — без полёта и верховой езды",
      "Цветное имя питомца",
      "/hide и /show — скрыть себя на BlueMap",
      "Личный промокод рефералки (создать и использовать)",
      "Без КД в чате (gChat)",
      "/skin без кулдауна",
    ],
    prices: {
      "1m": 149,
      "3m": 399,
      "6m": 699,
      lifetime: 1490,
    },
  },
  {
    id: "sonne_plus",
    name: "SONNE+",
    tagline: "Всё из SONNE + больше косметики питомцев",
    accent: "warm",
    privileges: [
      "Все привилегии SONNE",
      "Префикс ☀ SONNE+ (отдельный стиль)",
      "1 питомец любых типов (/pet) — не только пассивные",
      "Питомец на голове (hat) — косметика",
      "HEX-цвет имени питомца",
      "По-прежнему без mount/fly у питомцев и без P2W",
    ],
    prices: {
      "1m": 299,
      "3m": 799,
      "6m": 1390,
      lifetime: 2990,
    },
  },
];

/** Разовая смена Origins */
export const shopOriginItem: ShopItem = {
  id: "rebirth",
  name: "Перерождение",
  tagline: "Новая сущность в мире Solar",
  description:
    "Один раз перепиши свою природу: выбери другое происхождение и начни сезон с новой силой и слабостями. На геймплей-прогресс и лут не влияет — только твоя раса.",
  privileges: [
    "Смена происхождения на любое доступное",
    "Применяется на твоём аккаунте после активации",
    "Старое происхождение снимается без штрафа к скиллам",
  ],
  price: 249,
};

/** Разовый сброс всех деревьев Puffish Skills */
export const shopSkillResetItem: ShopItem = {
  id: "skill-reset",
  name: "Сфера перепрокачки",
  tagline: "Начни развитие заново, не теряя заработанные очки",
  description:
    "Одноразовая сфера сбрасывает все четыре дерева навыков и возвращает потраченные очки. Опыт веток и остальной прогресс персонажа сохраняются.",
  privileges: [
    "Сбрасывает выживание, бой, добычу и ремесло",
    "Возвращает все потраченные очки навыков",
    "Расходуется после применения ПКМ",
  ],
  price: 199,
};

export const shopItems: ShopItem[] = [shopOriginItem, shopSkillResetItem];

export function formatShopPrice(amount: number) {
  return `${amount.toLocaleString("ru-RU")} ₽`;
}

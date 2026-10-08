import botSync from "./bot-sync.json";

export const siteConfig = {
  name: "SolarMC",
  shortName: "Solar",
  description:
    "SolarMC Season 3 — Minecraft 1.21.1 с PvE-данжами, боссами, Origins и скиллами. Выживание, города и совместный геймплей.",
  serverIp: `${botSync.serverInfo.ip}:${botSync.serverInfo.port}`,
  themeColor: "#fff200",
  links: {
    discord: "https://discord.gg/DjmJzUARCy",
    telegram: "https://t.me/solarmc",
    boosty: "https://boosty.to/solarmc",
    tiktok: "https://tiktok.com/@solarmc",
    map: botSync.serverInfo.dynmap,
    github: "https://github.com/solarmc",
    help: botSync.serverInfo.help,
  },
} as const;

export type NavItem = {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
};

export const mainNav: NavItem[] = [
  { label: "Лаунчер", href: "/launcher" },
  { label: "Вики", href: "/docs/informaciya/home" },
  { label: "Онлайн карта", href: "/map" },
  { label: "Статус", href: "/status" },
  { label: "Магазин", href: "/shop" },
  { label: "Города", href: "/cities" },
  { label: "Ивенты", href: "/events" },
  { label: "Суды", href: "/courts" },
  { label: "Заявки", href: "/applications" },
  { label: "Техподдержка", href: "/support" },
  { label: "Команда", href: "/team" },
];

export const footerNav = {
  navigation: [
    { label: "Вики", href: "/docs/informaciya/home" },
    { label: "Города", href: "/cities" },
    { label: "Ивенты", href: "/events" },
    { label: "Команда", href: "/team" },
  ],
  sections: [
    { label: "Магазин", href: "/shop" },
    { label: "Заявки", href: "/applications" },
    { label: "Техподдержка", href: "/support" },
    { label: "Суды", href: "/courts" },
  ],
  server: [
    { label: "Лаунчер", href: "/launcher" },
    { label: "Онлайн карта", href: "/map" },
    { label: "Статус", href: "/status" },
    { label: "Начало игры", href: "/docs/guides/how-to-start" },
  ],
  community: [
    { label: "Discord", href: siteConfig.links.discord },
    { label: "Помощь в Discord", href: siteConfig.links.help },
    { label: "Telegram", href: siteConfig.links.telegram },
    { label: "Boosty", href: siteConfig.links.boosty },
    { label: "TikTok", href: siteConfig.links.tiktok },
  ],
};

export const homeLinks = [
  {
    title: "Discord",
    description:
      "Играй вместе, общайся с игроками и следи за жизнью сервера.",
    href: siteConfig.links.discord,
    icon: "discord" as const,
  },
  {
    title: "Telegram",
    description:
      "Быстрые анонсы, новости и удобный канал для чтения обновлений.",
    href: siteConfig.links.telegram,
    icon: "telegram" as const,
  },
  {
    title: "Boosty",
    description: "Поддержка проекта, отдельные посты и всё о сервере.",
    href: siteConfig.links.boosty,
    icon: "boosty" as const,
  },
  {
    title: "TikTok",
    description: "Клипы, короткие ролики и красивые моменты из мира SolarMC.",
    href: siteConfig.links.tiktok,
    icon: "tiktok" as const,
  },
  {
    title: "Вики",
    description: "Правила, гайды, механики и вся база знаний по серверу.",
    href: "/docs/informaciya/home",
    icon: "wiki" as const,
  },
  {
    title: "Карта",
    description:
      "Онлайн-карта мира со спавном, городами и интересными точками.",
    href: "/map",
    icon: "map" as const,
  },
  {
    title: "Магазин",
    description: "Solar+, визуалы, эффекты и покупки через сайт.",
    href: "/shop",
    icon: "shop" as const,
  },
];

export const galleryImages = Array.from({ length: 8 }, (_, i) => ({
  id: i + 1,
  src: `/gallery/screenshot-${i + 1}.png`,
  alt: `SolarMC — скриншот ${i + 1}`,
}));

export const searchItems = [
  { title: "Введение", href: "/docs/informaciya/home", group: "Вики" },
  { title: "Правила проекта", href: "/docs/informaciya/rules", group: "Вики" },
  { title: "Разрешённые моды", href: "/docs/informaciya/rules/allowed-mods", group: "Вики" },
  { title: "Запрещённые слова", href: "/docs/informaciya/rules/zapreshennye-slova", group: "Вики" },
  { title: "FAQ", href: "/docs/informaciya/faq", group: "Вики" },
  { title: "Как начать играть", href: "/docs/guides/how-to-start", group: "Вики" },
  { title: "Ресурс-пак", href: "/docs/guides/gaid-po-resurs-paku", group: "Вики" },
  { title: "Напитки", href: "/docs/guides/gaid-po-napitkam", group: "Вики" },
  { title: "Рецепты напитков", href: "/docs/guides/gaid-po-napitkam/recepty-napitkov", group: "Вики" },
  { title: "Клиент", href: "/docs/mods/client-mods", group: "Вики" },
  { title: "Квесты", href: "/docs/mods/questlog", group: "Вики" },
  { title: "Данжи", href: "/docs/mods/dungeons-pve", group: "Вики" },
  { title: "Артефакты", href: "/docs/mods/artefakty", group: "Вики" },
  { title: "Эндерит", href: "/docs/mods/enderit", group: "Вики" },
  { title: "Почта", href: "/docs/mods/pochta", group: "Вики" },
  { title: "Деньги", href: "/docs/mods/dengi", group: "Вики" },
  { title: "Мир вокруг", href: "/docs/mods/mir", group: "Вики" },
  { title: "Камера и экраны", href: "/docs/mods/kamera", group: "Вики" },
  { title: "Корабли", href: "/docs/mods/shippy-ships", group: "Вики" },
  { title: "Эмоции", href: "/docs/mods/emotecraft", group: "Вики" },
  { title: "Общие схемы", href: "/docs/mods/syncmatica", group: "Вики" },
  { title: "Вход и список игроков", href: "/docs/mods/solarauth-diary", group: "Вики" },
  { title: "Расы", href: "/docs/mods/origins", group: "Вики" },
  { title: "Скиллы", href: "/docs/mods/levelz", group: "Вики" },
  { title: "Сезоны", href: "/docs/mods/serene-seasons", group: "Вики" },
  { title: "Кухня", href: "/docs/mods/farmers-delight", group: "Вики" },
  { title: "Виноградник", href: "/docs/mods/vinery", group: "Вики" },
  { title: "Рыбалка", href: "/docs/mods/tide", group: "Вики" },
  { title: "Список рыб", href: "/docs/mods/tide/ryby", group: "Вики" },
  { title: "Звери", href: "/docs/mods/zveri", group: "Вики" },
  { title: "Рации", href: "/docs/mods/radio", group: "Вики" },
  { title: "Пинг", href: "/docs/mods/ping", group: "Вики" },
  { title: "Мебель", href: "/docs/mods/mebel", group: "Вики" },
  { title: "Жители", href: "/docs/mods/zhiteli", group: "Вики" },
  { title: "Боссы", href: "/docs/mods/bosses-bomd", group: "Вики" },
  { title: "Карта мира", href: "/docs/mods/bluemap", group: "Вики" },
  {
    title: "Голосовой чат",
    href: "/docs/server-content/nastroika-golosovogo-chata",
    group: "Вики",
  },
  { title: "Полезные команды", href: "/docs/server-content/poleznye-komandy-dlya-igrokov", group: "Вики" },
  { title: "Города", href: "/cities", group: "Разделы" },
  { title: "Ивенты", href: "/events", group: "Разделы" },
  { title: "Лаунчер", href: "/launcher", group: "Сервер" },
  { title: "Статус сервера", href: "/status", group: "Сервер" },
  { title: "Онлайн карта", href: "/map", group: "Сервер" },
  { title: "Магазин", href: "/shop", group: "Магазин" },
  { title: "Лента", href: "/feed", group: "Соцсеть" },
  { title: "Профиль", href: "/profile", group: "Аккаунт" },
  { title: "Заявки на проходку", href: "/applications", group: "Аккаунт" },
  { title: "Техподдержка", href: "/support", group: "Аккаунт" },
  { title: "Модерация заявок", href: "/admin", group: "Staff" },
];

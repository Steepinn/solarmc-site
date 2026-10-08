import fs from "fs";
import path from "path";

const WIKI_ROOT = path.join(process.cwd(), "content", "wiki");

const NAV = [
  {
    title: "Информация",
    items: [
      { title: "Введение", href: "/docs/informaciya/home" },
      { title: "Правила проекта", href: "/docs/informaciya/rules" },
      { title: "Разрешённые и Запрещённые модификации", href: "/docs/informaciya/rules/allowed-mods" },
      { title: "Запрещенные слова", href: "/docs/informaciya/rules/zapreshennye-slova" },
      { title: "Часто задаваемые вопросы", href: "/docs/informaciya/faq" },
      { title: "Получение помощи", href: "/docs/informaciya/help" },
    ],
  },
  {
    title: "Гайды",
    items: [
      { title: "Как начать игру на сервере?", href: "/docs/guides/how-to-start" },
      { title: "Гайд по ресурс паку", href: "/docs/guides/gaid-po-resurs-paku" },
      { title: "Гайд по пластинкам", href: "/docs/guides/gaid-po-plastinkam" },
      { title: "Гайд по напиткам", href: "/docs/guides/gaid-po-napitkam" },
      { title: "Рецепты напитков", href: "/docs/guides/gaid-po-napitkam/recepty-napitkov" },
    ],
  },
  {
    title: "Контент сервера",
    items: [
      { title: "Полезные команды для игроков", href: "/docs/server-content/poleznye-komandy-dlya-igrokov" },
      { title: "Настройка голосового чата", href: "/docs/server-content/nastroika-golosovogo-chata" },
    ],
  },
];

fs.writeFileSync(path.join(WIKI_ROOT, "navigation.json"), JSON.stringify(NAV, null, 2), "utf8");
console.log("navigation.json written");

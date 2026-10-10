import {
  formatShopPrice,
  shopDurations,
  shopOriginItem,
  shopPlans,
  shopSkillResetItem,
} from "@/lib/shop-catalog";
import type { SolAudience } from "@/lib/solnyshko/policy";
import { clientModsPromptBlurb } from "@/lib/solnyshko/client-mods-index";
import { serverModsPromptBlurb } from "@/lib/solnyshko/server-mods-index";
import { fishPromptBlurb } from "@/lib/solnyshko/fish-index";

/** Всегда в промпте — чтобы не было «в базе пусто» по базовым темам. */
export function buildCoreContext(audience: SolAudience): string {
  const shop = [
    "МАГАЗИН /shop:",
    ...shopPlans.map(
      (p) =>
        `${p.name}: ${p.privileges.join("; ")}. Цены: ${shopDurations
          .map((d) => `${d.label} ${formatShopPrice(p.prices[d.id])}`)
          .join(", ")}.`,
    ),
    `Перерождение (покупка смены Origin на сайте): ${shopOriginItem.description} Цена ${formatShopPrice(shopOriginItem.price)}.`,
    `Сфера перепрокачки (сброс навыков): ${shopSkillResetItem.description} Цена ${formatShopPrice(shopSkillResetItem.price)}.`,
  ].join("\n");

  const originItem = [
    "СФЕРА ПРОИСХОЖДЕНИЯ (Origins):",
    "Предмет: origins:orb_of_origin (в игре «Сфера происхождения»).",
    "Команда выдачи (только у тех, кто может /give, обычно admin): /minecraft:give <ник> origins:orb_of_origin 1",
    "Также: /minecraft:give @p origins:orb_of_origin 1",
    "Игрок сам себе через /give обычно НЕ может — нет права. Игроку: купить «Перерождение» на /shop или попросить администрацию выдать сферу.",
    audience === "administrator"
      ? "Сейчас собеседник ADMIN — смело давай точную команду /minecraft:give."
      : audience === "moderator" || audience === "helper"
        ? "Собеседник staff, но не admin: можешь назвать команду, уточни что выдаёт admin/консоль."
        : "Собеседник игрок: НЕ пиши «команды нет». Скажи: у админов команда есть; тебе — [магазин](/shop) «Перерождение» или попроси staff.",
  ].join("\n");

  const cmds = [
    "ИГРОК-КОМАНДЫ: /cd меню, /bal /pay /baltop, /msg /reply, /report /ask, /skin, /sit /lay /crawl /spin, /afk, /list, /dslink.",
    "СКИЛЛЫ: клавиша K (Puffish). Сфера перепрокачки из /shop сбрасывает все 4 дерева, возвращает потраченные очки, сохраняет опыт веток и расходуется по ПКМ. Команда выдачи для admin: /solarskills give <игрок>. Origin активка часто G. Голос V. Пинг часто Mouse5 (/pingwheel config).",
    "Донат SONNE: hat, workbench, 1 пассивный pet, maphide /hide /show, промо, без КД чата/скина. Нет nick/ec/fly/kits/homes/tpa.",
    "SONNE+: всё SONNE + 1 pet любых типов, pet hat, HEX имени питомца.",
    "ПРОХОДКА (важно): 1) войти на сайт через Discord (/api/auth/discord) 2) открыть страницу заявок /applications и подать заявку ТАМ. Это НЕ Discord-slash команда.",
    "ЛАУНЧЕР / КЛИЕНТ (не выдумывай шаги!):",
    "Страница [лаунчер](/launcher) — ДВЕ разные zip-сборки. Не мешать.",
    "ОФИЦИАЛКА (лицензия / Microsoft / Mojang Launcher): скачай блок «Официальный Minecraft» → файл solar-launcher-official.zip. Java 1.21.1 + Fabric уже в комплекте. Ставь только эту сборку в официальный клиент.",
    "TLauncher: скачай блок «TLauncher» → solar-launcher-tlauncher.zip. Только для TLauncher. Официальную zip туда НЕ ставь.",
    "После установки: запуск только через [лаунчер](/launcher) — адрес для ручного ввода игрокам не даём. Нужна проходка — [заявки](/applications). Моды: [клиентские моды](/docs/mods/client-mods). Старт: [как начать](/docs/guides/how-to-start).",
    "Нет отдельной «тайной инструкции для лицензии» — всё на /launcher. Не пиши «накатай файлы абы как» без указания какой именно zip брать.",
    "Только Minecraft Java 1.21.1. Bedrock / телефон — нельзя.",
    "Ссылки в ответах всегда markdown: [войти через Discord](/api/auth/discord), [заявки](/applications), [лаунчер](/launcher), [карту](/map), [вики](/docs), [магазин](/shop), [статус](/status), [поддержку](/support). Не пиши голые /applications /map /docs.",
    "Координаты данжей/боссов/сиды — НЕ выдавать.",
    "РАСЫ Origins: Human, Avian, Arachnid, Elytrian, Shulk, Feline, Enderian, Merling, Blazeborn, Phantom. Смена: [магазин](/shop) Перерождение или сфера origins:orb_of_origin у admin.",
    "КОРАБЛИ = мод Shippy Ships (НЕ Small Ships!). Сборка: скрафти Ship Builder (3 бревна) → поставь → ПКМ → по шагам кидай ресурсы в верфь → дотащи корабль до воды. Типы: Sailboat (лёгкий), Cog (толстый склад), Caravel (океан, нужна команда). Управление: W раскрыть парус, S убрать. Ремонт — досками ПКМ. Гайд: [корабли](/docs/mods/shippy-ships).",
    "АРТЕФАКТЫ: не крафтятся. Сундуки/мимик. Гайд [артефакты](/docs/mods/artefakty).",
    "ЭНДЕРИТ: взорвать руду в Краю, незеритовая кирка, доменная печь, 4 обломка+4 алмаза=слиток. Шаблон из города Края. Копия шаблона: 7 слитков незерита + эндерняк + шаблон → 2. Стол кузнеца: шаблон + незерит-вещь + слиток. [эндерит](/docs/mods/enderit).",
    "ПОЧТА: бирка=бумага+табличка, письмо=бумага+чернила+перо, ящик=плиты+доски+бирка, голубятня=8 досок+сено. 3 XP на адрес, семена в ящик. [почта](/docs/mods/pochta).",
    "ДЕНЬГИ: ячейка+PIN, банкомат ПКМ, /bal /pay, перевод >50 подтвердить в Discord (/dslink). Обменник: руда→валюта (алмаз 1, железо 1, золото 2, изумруд 6, обломки 12). [деньги](/docs/mods/dengi).",
    "ЭКРАНЫ: сначала пульт (железо, медный блок, редстоун, 3 каменные кнопки), рамка/телек с пультом. [камера](/docs/mods/kamera).",
    "РАЦИИ: Simple Radio. Медная проволока + антенна → walkie-talkie; трансивер с модулями. Стационар = радио/динамик/микрофон + антенна на базе. Рядом голос V. [рации](/docs/mods/radio).",
    "ПИНГ: Mouse5 или /pingwheel config. Группы: /metka create <название> <пароль>, /metka join, /metka leave, /metka info, /metka members, /metka settings. [пинг](/docs/mods/ping).",
    "МЕБЕЛЬ: стулья/столы/полки из досок и палок (дуб и другие породы), молоток мебели. ПКМ по стулу — сесть. [мебель](/docs/mods/mebel).",
    "ЖИТЕЛИ: новые станции — садовый стол, охотничий пост, шахтёрский стол, океанография, лесной верстак, чертёжный стол, алтарь пурпура, верстак порчи, холодильник. Позолоченная станция WIP. [жители](/docs/mods/zhiteli).",
    "ЗВЕРИ: Faunus (капуцин — любой фрукт; кецаль, пиранья, арапаима, якаре, игуана…) + утки (рыба) / гуси (ламинария/морская трава). Critters and Companions НЕТ. [звери](/docs/mods/zveri).",
    "КУХНЯ: Farmers Delight + Ocean's / More / Pumpkin Pie / Display. Без Autochef/Dumplings/My Nether's. Рецепты: команда /fdguide (/fdbook) или книга в GUI кастрюли. JEI нет. [кухня](/docs/mods/farmers-delight).",
    "ВИНОГРАДНИК Vinery: стебель лозы из брёвен → кадка → бочка брожения → винные бутылки; яблочный пресс для сидра. Не путать с Brewery. [виноградник](/docs/mods/vinery).",
    "РЫБАЛКА Tide + solartideocean (чаще косяки в океане/реке). [рыбалка](/docs/mods/tide).",
    "МИР Good Ending: болота/берёзы, светлячки в банку. [мир](/docs/mods/mir). Не учи wiretap подслушивать.",
    "КВЕСТЫ: мод Questlog, клавиша в Настройки→Управление→Журнал квестов. Гайд: [квесты](/docs/mods/questlog).",
    "ДАНЖИ: When Dungeons Arise + YUNG Better Dungeons/Strongholds/Fortresses/Ocean Monuments. Координаты не давать. Гайд: [данжи](/docs/mods/dungeons-pve).",
    clientModsPromptBlurb(),
    serverModsPromptBlurb(),
    fishPromptBlurb(),
  ].join("\n");

  return `${shop}\n\n${originItem}\n\n${cmds}`;
}

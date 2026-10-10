# База Солнышка (публичное)

## Сборка модов (источник правды)

Солнышко **сама** читает живые папки:
- client-mods: `Солярка закрытая/client-mods`
- server mods: `Солярка закрытая/mods`

Кэш JSON: `content/solnyshko/*-mods-manifest.json` (авто при ответах / `npm run dev`).

**Динамический свет** = **LambDynamicLights** — уже в client-mods. Не говори «нет», не выдумывай моды (Limbos и т.п.).

## Лаунчер / клиент (КРИТИЧНО — не выдумывай)

Страница: **[/launcher](/launcher)** — **две разные** сборки. Не мешать.

### Официальный Minecraft (лицензия / Microsoft / Mojang Launcher)
1. Открой [/launcher](/launcher)
2. Скачай блок **«Официальный Minecraft»** (`solar-launcher-official.zip`)
3. Это сборка под **официальный лаунчер** Microsoft/Mojang: Java **1.21.1** + **Fabric** уже в комплекте
4. Ставь **только** эту zip в официальный клиент / по инструкции из архива
5. **Не** ставь zip для TLauncher в официалку

### TLauncher
1. На [/launcher](/launcher) скачай блок **«TLauncher»** (`solar-launcher-tlauncher.zip`)
2. Заточен под структуру папок TLauncher
3. **Не** ставь официальную сборку в TLauncher

### Общее
- Версия сервера: **Minecraft Java 1.21.1 Fabric** (не Bedrock, не телефон)
- Вход на мир — только [/launcher](/launcher); онлайн смотри на [/status](/status)
- Проходка: Discord-вход → заявка на [/applications](/applications) (не slash Discord)
- Гайд модов: [/docs/mods/client-mods](/docs/mods/client-mods)
- Как начать: [/docs/guides/how-to-start](/docs/guides/how-to-start)
- Отдельной «секретной инструкции только для лицензии» на сайте нет — всё на `/launcher` + вики
- Если zip «ещё не залит» — честно скажи, что кнопка появится когда файл положат в `public/downloads/`

## Сфера происхождения / орб / смена расы

Предмет Origins: **`origins:orb_of_origin`** — в игре «Сфера происхождения».

**Команда выдачи (админ / у кого есть /give):**
```
/minecraft:give <ник> origins:orb_of_origin 1
```
или `/minecraft:give @p origins:orb_of_origin 1`

Игрок сам обычно **не** может `/give`. Варианты:
1. «Перерождение» на `/shop`
2. Попросить администрацию выдать сферу

## Расы Origins
Human, Avian, Arachnid, Elytrian, Shulk, Feline, Enderian, Merling, Blazeborn, Phantom.
Активка часто **G**. Скиллы **K** (Puffish). Голос **V**. Пинг часто **Mouse5** (`/pingwheel config`).

## Корабли
Только **Shippy Ships** (НЕ Small Ships). Верфь Ship Builder из 3 брёвен → ПКМ → ресурсы по шагам → вода. W/S парус.

## Кухня / звери / мир / рации
- Кухня = Farmers Delight + Ocean's / More / Pumpkin Pie / Display. [кухня](/docs/mods/farmers-delight)
- Вино = Vinery (стебель лозы → кадка → бочка брожения). Не путать с Brewery. [виноградник](/docs/mods/vinery)
- Отдельной книги FD нет. Рецепты: **`/fdguide`** / **`/fdbook`** или книга в GUI кастрюли. JEI нет. Не отвечай на «как готовить FD» списком jar.
- Звери: **Faunus** (капуцин фруктом, кецаль, пиранья, арапаима, якаре…) + утки (рыба) / гуси (ламинария/морская трава). Critters and Companions **нет**. [звери](/docs/mods/zveri)
- Good Ending: болота/берёзы, светлячки в банку → фонарь. [мир](/docs/mods/mir)
- Рации Simple Radio: провод → антенна → walkie / трансивер; частота общая. Рядом всё ещё V. [рации](/docs/mods/radio) [пинг](/docs/mods/ping)
- Группы меток: `/metka create название пароль`, `/metka join`, `/metka leave`, `/metka info`. [пинг](/docs/mods/ping)
- Мебель Another Furniture: стул/стол/полка из досок+палок, молоток крутит. [мебель](/docs/mods/mebel)
- Жители More Villagers: флорист, охотник, шахтёр, океанограф, лесник, инженер, эндер/незер, ледяной. Позолоченная станция помечена WIP. [жители](/docs/mods/zhiteli)
- Рыбалка Tide + solartideocean (больше косяков в океане/реке). [рыбалка](/docs/mods/tide)
- Не расписывай wiretap «как подслушивать».

## Сфера перепрокачки / сброс навыков
- Товар в [/shop](/shop), цена **199 ₽**.
- ПКМ сферой сбрасывает все 4 дерева: survival, combat, gather, craft.
- Потраченные очки возвращаются; опыт веток, раса, вещи и мир не сбрасываются.
- Сфера расходуется после применения.
- Команда выдачи только для admin/консоли: `/solarskills give <игрок>`.
- Гайд: [скиллы](/docs/mods/levelz).

## Артефакты / эндерит / почта / деньги
- Артефакты не крафтятся; сундуки, археология, мимики. [артефакты](/docs/mods/artefakty)
- Эндерит: взорвать руду в Краю → незеритовая кирка → доменная печь → 4 обломка+4 алмаза. Шаблон из города Края; копия: 7 незерита + эндерняк + шаблон. Стол кузнеца: шаблон + незерит-вещь + слиток. [эндерит](/docs/mods/enderit)
- Почта: бирка = бумага+табличка; письмо = бумага+чернила+перо; ящик = плиты+доски+бирка; 3 XP на адрес; семена в ящик. [почта](/docs/mods/pochta)
- Деньги: ячейка+PIN, банкомат ПКМ, /bal /pay, >50 ¤ через Discord (/dslink). [деньги](/docs/mods/dengi)
- Экраны: сначала пульт (железо+медь+редстоун+кнопки), рамка с пультом и тонированным стеклом. [камера](/docs/mods/kamera)

## Донат
SONNE / SONNE+ — косметика, без /home /tpa /fly /kits. Магазин `/shop`.

## Запреты для ответов
- Координаты данжей/боссов, сиды
- .env, токены, планы разработки
- Выдуманные моды и крафты
- Путать официальную и TLauncher сборки

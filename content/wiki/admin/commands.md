# Команды staff

Права = LuckPerms **2026-07-23b**. Если команды нет — `lp user <ник> permission info` и сверка с [рангами](/docs/admin/ranks).

## Helper

| Команда | Право / зачем |
|---------|----------------|
| `/kick` | kick + `minecraft.command.kick` |
| `/mute` / unmute | мут чата |
| `/tp` `/tphere` | телепорт staff |
| `/spawn` | на спавн |
| `/vanish` | невидимость |
| `/invsee` | инвентарь |
| `/fly` | полёт **только staff** |
| `/socialspy` | подсмотр ЛС (Ess + gChat) |
| обработка `/report` | `greports.admin` |
| `/skin` без КД | bypasscooldown |
| `/hide` `/show` | `solar.maphide` |

**Не должно быть у helper:** `/ban`, `/tempban`, `/unban`, `/give`, `/god`, `/gamemode`.

## Moderator

Всё helper плюс:

| Команда | Зачем |
|---------|--------|
| `/ban` `/tempban` `/unban` | баны (+ minecraft ban/pardon) |
| `/gamemode` | расследование |
| `/invsee` + EC others | проверки |
| `/co i` | CoreProtect inspect |
| `/co lookup` | история блоков |
| gplayerid admin | ID игроков |
| `lp user … info` | смотреть группы (**не** выдавать себе admin) |

**Всё ещё нет у чистого mod:** `*`, `/give`, `/god`.

## Admin / Techadmin

Фактически OP через `*`. Типовые задачи:

```
lp user <ник> parent set sonne|sonneplus|helper|moderator|admin
lp user <ник> parent add media
lp group list
lp sync
```

Массово: прогон `console/apply-solar-ranks.txt`.

Reload после рангов: essentials, tab, gchat, deluxemenus, spreferal, sr, `lp sync`.

## Донат — чеклист выдачи

1. Оплата подтверждена (магазин / Discord).
2. `lp user <ник> parent set sonne` или `sonneplus`.
3. `lp user <ник> info` — нет nick/ec/fly/kits.
4. Игроку: ссылка на публичный [донат](/docs/informaciya/donat) (не staff-вики).

## Отладка «у донатера не работает»

1. Онлайн, точный ник, регистр.
2. Primary group / weight / несколько parent.
3. Не остались ли старые false-ноды выше по приоритету.
4. Reload плагина (Essentials / SimplePets / SkinsRestorer).
5. Сверка с apply-скриптом, не со старым verify.json.

## Чего не выдавать игрокам

* `essentials.fly`, kits, homes, tpa, warp как perk  
* `essentials.nick` / `enderchest` на sonne (снято в 23b)  
* `*` кому угодно кроме admin/techadmin  
* gamemode «для стройки» без тикета admin  

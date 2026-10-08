# Ранги LuckPerms (Season 3)

Актуально по **`console/apply-solar-ranks.txt`** отметка **2026-07-23b** (no-P2W; снят nick/ec с доната; sonneplus = 1 pet всех типов).

После правок на сервере: `lp sync`, `essentials reload`, `tab reload`, `gchat reload`, `spreferal reload`, `sr reload`.

{% hint style="info" %}
Снимок `console/solar-perks-verify.json` может **отставать**. Если в снимке ещё есть `essentials.nick` у sonne — значит скрипт 23b не прогоняли или снимок старый. Ориентир — txt-скрипт.
{% endhint %}

## Иерархия parent

```
default → player
tester → player
sonne → player
sonneplus → sonne
media → player
helper → player
moderator → helper
admin → moderator
techadmin → admin
```

## Player (база)

**Выдано (важное):**

| Область | Ноды / команды |
|---------|----------------|
| Essentials соц/инфо | afk(+auto), msg, reply, mail(+send), balance, balancetop, pay, ignore, list, help, motd, rules, info, me, realname, getpos, compass, depth, suicide |
| gChat | use, local, global, msg/reply |
| gReports | use (`/report`) |
| GSit | sit, sitclick, lay, crawl, spin |
| SkinsRestorer | player + command.skin (**без** bypasscooldown) |
| Voicechat | speak, listen, groups |
| CoreProtect | inspect |
| CustomRecipes | book / recipes |
| DeluxeMenus | `/cd` (solar_cd) |
| SPmoney | balance, baltop |

**Явно unset / false:**

* fly, gamemode(+creative/spectator), give, god, nick, ban, kick, mute, vanish, invsee  
* spawn, tpa/tpaccept/tpdeny/tpahere, home/sethome/delhome, warp(s), kit(s), near  
* hat, solar.maphide, spreferal.promo.create  
* gchat.bypass.cooldown  
* все pet.commands.* = false, pet.type.* = false, mount/fly/hat pets = false  

## SONNE

Наследует player. **Добавляет:**

```
essentials.workbench
essentials.hat
gsit.sit / gsit.lay          # дубль базы; не уникальный perk
gchat.bypass.cooldown
skinsrestorer.bypasscooldown (+ skin)
spreferal.promo.create
spreferal.promo.use
solar.maphide
pet.commands.* (gui/summon/remove/list/data/rename/help)
pet.type.passive
pet.amount.1
pet.name.color
pet.type.*.mount = false
pet.type.*.fly = false
```

**Unset (обязательно после старых сезонов):**

```
essentials.fly
essentials.kits.sonne / kit.sonne
essentials.sethome.multiple(+.3)
essentials.nick / nick.color / nick.gradient
essentials.enderchest
```

Префикс: `&#FFB300☀ ` weight 30.

## SONNE+

Наследует sonne. **Добавляет / правит:**

```
pet.type.* = true
pet.type.passive / hostile = true
pet.amount.1 = true
pet.amount.2 = false          # НЕ два питомца
pet.type.*.hat = true
pet.name.color.hex = true
pet.type.*.mount / fly = false
```

**Unset:** nick(+color/gradient), enderchest, feed, heal, kits.sonneplus, sethome.multiple(+.5).

Префикс: `&#FF8F00☀ ` weight 40.

## Media

```
essentials.nick + nick.color
essentials.hat
essentials.stream            # noop в EssX 2.22 — метка
spreferal.promo.create
gchat.bypass.cooldown
skinsrestorer.bypasscooldown
solar.maphide
```

**Unset:** ban, kick, mute, vanish, give, god, gamemode, **fly** (no-P2W даже для записи).

## Helper

```
essentials.kick, mute, socialspy
essentials.tp, tphere, spawn
essentials.vanish, invsee, fly
minecraft.command.kick
gchat.socialspy + bypass.cooldown
skinsrestorer.bypasscooldown
greports.admin
solar.maphide
```

**Unset (чтобы не перекрывать admin `*`):** ban, tempban, unban, give, god, gamemode.

## Moderator (= helper +)

```
essentials.ban, tempban, unban, mute, kick
essentials.invsee, enderchest.others
essentials.gamemode, fly
minecraft.command.ban / pardon / gamemode
coreprotect.inspect + lookup
gplayerid.admin
luckperms.user.info
```

**Unset:** god, give.

## Admin / Techadmin

```
permission set * true
```

Владелец: `lp user <ник> parent set admin` (в скрипте — Steepy3).

## Донат — выдача

```
lp user <ник> parent set sonne
lp user <ник> parent set sonneplus
lp user <ник> info
```

Срок: LP expiry / track / ручное снятие — по договорённости staff.  
Не выдавай nick/ec «в подарок» — это уже не донат-политика сезона.

## Сайт vs игра

| Сайт | Игра (LP) |
|------|-----------|
| Player (проходка Discord) | группа `player` после входа |
| helper / moderator / administrator | helper / moderator / admin |
| Не равны 1:1 | синхронизируй вручную при повышениях |

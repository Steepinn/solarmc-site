# Вики для администрации

Раздел только для **helper / moderator / administrator** (роль Discord или роль сайта). Обычным игрокам страница отдаёт 404, в меню раздела нет.

{% hint style="warning" %}
Не пиши сюда пароли, токены бота, `.env`, IP панелей с доступом. Секреты — только в приватных staff-каналах Discord.
{% endhint %}

## Оглавление

1. [Этот обзор](/docs/admin/home)
2. [Ранги LuckPerms](/docs/admin/ranks) — точные ноды Season 3
3. [Модерация](/docs/admin/moderation)
4. [Команды staff](/docs/admin/commands)
5. [Сайт и админ-панель](/docs/admin/website)
6. [Сезон 3 — чеклист](/docs/admin/season)

## Кто видит этот раздел на сайте

| Способ | Кто |
|--------|-----|
| Discord-роль **Модератор** | `isModerator` → доступ |
| Discord-роль **Администратор** | `isAdministrator` → доступ |
| Роль сайта **Хелпер** / **Модератор** / **Администратор** | выдаётся в [/admin](/admin) → Роли |

Хелперу без Discord mod-роли нужно выдать на сайте ключ **`helper`**, иначе вики staff не откроется.

## Иерархия LP (игра)

| Группа | Вес | Prefix | Parent |
|--------|-----|--------|--------|
| player | 10 | ✧ | — |
| tester | 20 | 🧪 | player |
| sonne | 30 | ☀ | player |
| sonneplus | 40 | ☀ | sonne |
| media | 50 | ▶ | player |
| **helper** | 60 | ✦ | player |
| **moderator** | 70 | ◆ | helper |
| **admin** | 100 | ⚡ | moderator |
| **techadmin** | 100 | ⚙ | admin |

Track `staff`: helper → moderator → admin.

## Принцип Season 3 (обязательно)

Источник правды: `console/apply-solar-ranks.txt` (**2026-07-23b**).

* PvE, без pay-to-win мобильности.
* Донат **sonne / sonneplus**: hat, workbench, pets, maphide, promo, bypass chat/skin CD.
* У доната **нет**: `/nick`, `/ec`, fly, heal, feed, kits, homes, tpa, warps, spawn-as-perk.
* Не накатывай старые LP-дампы с nick/ec/fly/kits на sonne.

Публичные тексты магазина: `src/lib/shop-catalog.ts` + [/docs/informaciya/donat](/docs/informaciya/donat).

## Ссылки сайта

* [/admin](/admin) — заявки, тикеты, роли, пользователи, ачивки, рассылки  
* [/admin/wiki](/admin/wiki) — редактор markdown  
* [/applications](/applications) · [/support](/support) · [/shop](/shop)

## Новому хелперу

1. [Модерация](/docs/admin/moderation) и [команды](/docs/admin/commands).
2. Публичные [правила](/docs/informaciya/rules).
3. Не повышай себя до admin — только владелец / процедура.
4. Донат выдавай только после оплаты: `lp user <ник> parent set sonne` или `sonneplus`.

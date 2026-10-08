# Сайт и админ-панель

## Доступ к разделам

| Зона | Кто |
|------|-----|
| [/admin](/admin) (панель) | Discord **модер** или **админ** (`isAdmin`) |
| Staff-вики `/docs/admin/*` | модер/админ Discord **или** роль сайта `helper` / `moderator` / `administrator` |
| Редактор [/admin/wiki](/admin/wiki) | как панель (`isAdmin`) |

Хелперу для вики: в [/admin](/admin) → **Роли** выдай ключ **Хелпер**.  
Discord ID роли хелпера в `roles.json` сейчас `null` — можно прописать ID, тогда подтянется с Discord автоматически.

## Вкладки админки

| Раздел | Действие |
|--------|----------|
| Обзор | сводка |
| Пользователи | сайт + заявки + usercache + dslink |
| Ачивки | прогресс Minecraft |
| Инструменты | рассылки |
| Заявки / Тикеты | проходка и поддержка |
| Роли | site-roles: player, helper, moderator, … |
| Вики | правка `content/wiki/**/*.md` |

## Профили

* Публично: `/u/<slug>`
* Роли проекта видны на профиле
* Блок сайта — кнопка у admin на чужом профиле

## Уведомления

Игроки — ответы в тикетах/заявках.  
Staff — без автопуша новых заявок в колокольчик; мониторь `/admin` и Discord.

## Вики (файлы)

* Контент: `content/wiki/**/*.md`
* Навигация: `content/wiki/navigation.json`
* `staffOnly: true` у секции «Администрация» — скрывает раздел не-staff
* Публичные URL: `/docs/...`
* Staff URL: `/docs/admin/...` (403/404 без прав)

## Магазин

Текст привилегий: `src/lib/shop-catalog.ts`  
Должен совпадать с LP **23b** и публичным [/docs/informaciya/donat](/docs/informaciya/donat).

Сейчас на витрине: hat, wb, pets, maphide, promo, no chat/skin CD; **без** nick/ec; SONNE+ = 1 pet всех типов + hat + HEX.

## Env (только techadmin)

Не коммить `.env`. Типично: Discord OAuth/bot, `MINECRAFT_SERVER_PATH`, путь к SPSolards DB.

## Блок пользователя сайта

`/api/admin/block` — абьюз логина, спам тикетов. Не замена `/ban` в игре.

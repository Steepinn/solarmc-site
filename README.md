# SolarMC Website

Сайт Minecraft-сервера **SolarMC** — клон структуры [flowerymc.space](https://flowerymc.space/) с фирменной жёлто-янтарной палитрой.

## Запуск

```bash
npm install
npm run dev
```

Открой [http://localhost:3000](http://localhost:3000).

## Структура

| Раздел | Путь |
|--------|------|
| Главная | `/` |
| Вики | `/docs/welcome` |
| Карта | `/map` |
| Статус | `/status` |
| Магазин | `/wallet` |
| Города | `/cities` |
| Ивенты | `/events` |
| Суды | `/courts` |
| Баны | `/bans` |
| Команда | `/team` |
| Лента (соцсеть) | `/feed` |
| Профиль | `/profile` |
| Discord auth | `/auth/discord` |

## Настройка

Ссылки и навигация — в `src/config/site.ts`. Адрес Minecraft-сервера для бэкенда — в `.env` / `bot-sync.json`.

## Что дальше

- Discord OAuth2 (CLIENT_ID / SECRET в `.env`)
- API для статуса, городов, банов
- Реальные скриншоты в галерею
- BlueMap iframe на `/map`

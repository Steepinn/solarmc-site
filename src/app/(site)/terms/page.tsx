import Link from "next/link";
import { ContentCard, PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Пользовательское соглашение" };
export const dynamic = "force-static";

export default function TermsPage() {
  return (
    <PageShell
      title="Пользовательское соглашение"
      description="Правила использования сайта и сервера SolarMC."
      eyebrow="Правовая информация"
    >
      <div className="mt-4 space-y-4">
        <ContentCard>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Используя сайт {siteConfig.name}, Discord-сервер сообщества и игровой
            сервер Minecraft, ты принимаешь это соглашение. Если не согласен —
            не пользуйся сервисами SolarMC.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Актуальная редакция от 23.07.2026.
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">1. О проекте</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            SolarMC — любительский Minecraft-проект (выживание, города, моды,
            ивенты). Сайт и сервер не являются официальным продуктом Mojang
            Studios / Microsoft и не аффилированы с ними.
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">2. Аккаунт</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Вход на сайт через Discord. Ты отвечаешь за сохранность своего
              Discord-аккаунта и привязанного Minecraft-ника.
            </li>
            <li>
              Привязка игрока выполняется командой{" "}
              <strong className="text-foreground">/dslink</strong> по правилам
              проекта.
            </li>
            <li>
              Запрещено передавать доступ к аккаунту, обходить блокировки и
              выдавать себя за другого игрока.
            </li>
          </ul>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">3. Правила сервера</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              На сервере действуют правила сообщества (вики / Discord). Их
              нарушение может привести к муту, кику, бану или ограничению доступа
              к сайту.
            </li>
            <li>
              Запрещены читы, дюпы, эксплойты, гриферство вне разрешённых режимов,
              токсичность, дискриминация, угрозы и спам.
            </li>
            <li>
              Администрация вправе удалять постройки, предметы и данные, если это
              нужно для стабильности сезона или расследования нарушений.
            </li>
          </ul>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">4. Сайт и контент</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Публичный профиль, лента, заявки и тикеты — часть сервиса. Не
              размещай личные данные третьих лиц, вредоносные ссылки и запрещённый
              контент.
            </li>
            <li>
              Материалы сайта (тексты, оформление, логотип) принадлежат проекту,
              если не указано иное. Копирование без согласия запрещено.
            </li>
            <li>
              Игровой прогресс, достижения и экономика сезона могут сбрасываться
              при старте нового сезона — это часть формата проекта.
            </li>
          </ul>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">5. Платные услуги</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Если на сайте есть магазин или донат, условия покупки и возврата
            указываются в карточке товара или в Discord. Цифровые привилегии
            обычно не подлежат возврату после выдачи, кроме случаев ошибки
            администрации или недоступности услуги по вине проекта.
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">6. Данные</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Мы обрабатываем данные, нужные для работы сервиса: Discord ID, ник,
            аватар, заявки, тикеты поддержки, привязку к Minecraft UUID, прогресс
            достижений с сервера. Подробнее про cookies — на странице{" "}
            <Link href="/cookies" className="text-solar-gold hover:underline">
              Cookies
            </Link>
            .
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">7. Ответственность</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              Сервер и сайт предоставляются «как есть». Возможны техработы,
              лаги, откаты мира и временная недоступность.
            </li>
            <li>
              Администрация не отвечает за потерю предметов из‑за действий
              игроков, багов модов сторонних авторов или сбоев хостинга вне зоны
              нашего контроля.
            </li>
            <li>
              Решения модерации по нарушениям окончательны в рамках проекта;
              спорные случаи можно обсудить в тикете поддержки.
            </li>
          </ul>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">8. Изменения</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Мы можем обновлять соглашение. Продолжая пользоваться SolarMC после
            публикации новой версии, ты принимаешь изменения. Актуальный текст
            всегда на этой странице.
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">9. Контакты</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Вопросы по соглашению и модерации — через{" "}
            <Link href="/support" className="text-solar-gold hover:underline">
              техподдержку на сайте
            </Link>{" "}
            или{" "}
            <Link
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-solar-gold hover:underline"
            >
              Discord
            </Link>
            .
          </p>
        </ContentCard>
      </div>
    </PageShell>
  );
}

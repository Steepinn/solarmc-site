import { ContentCard, PageShell } from "@/components/page-shell";

export const metadata = { title: "Cookies" };
export const dynamic = "force-static";

export default function CookiesPage() {
  return (
    <PageShell
      title="Cookies"
      description="Что мы сохраняем в браузере и зачем."
      eyebrow="Правовая информация"
    >
      <div className="mt-4 space-y-4">
        <ContentCard>
          <h2 className="font-display text-lg font-bold">Что это</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Cookies — небольшие данные в браузере. На SolarMC они нужны, чтобы сайт
            узнавал тебя после входа и помнил простые настройки.
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">Что храним</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Сессия Discord</strong> — чтобы
              оставаться в аккаунте (заявки, поддержка, профиль).
            </li>
            <li>
              <strong className="text-foreground">Тема</strong> — светлая / тёмная.
            </li>
            <li>
              <strong className="text-foreground">Звук UI</strong> — вкл / выкл.
            </li>
            <li>
              <strong className="text-foreground">Согласие на cookies</strong> —
              чтобы баннер не показывался снова.
            </li>
          </ul>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">Сторонние сервисы</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Вход идёт через Discord OAuth. Карта может грузить ресурсы BlueMap с
            сервера. Рекламных и аналитических трекеров на сайте нет.
          </p>
        </ContentCard>

        <ContentCard>
          <h2 className="font-display text-lg font-bold">Как удалить</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Выйди из аккаунта на сайте и очисти cookies для этого домена в
            настройках браузера — сессия и локальные настройки сбросятся.
          </p>
        </ContentCard>
      </div>
    </PageShell>
  );
}

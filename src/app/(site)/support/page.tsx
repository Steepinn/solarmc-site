import Link from "next/link";
import { ContentCard, PageShell } from "@/components/page-shell";
import { SupportPanel } from "@/components/support-panel";
import { getEnrichedSession } from "@/lib/auth";
import { getUserSupportTickets } from "@/lib/support-db";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Техподдержка" };

export default async function SupportPage() {
  const session = await getEnrichedSession();
  const tickets = session
    ? await getUserSupportTickets(session.discordId)
    : [];

  return (
    <PageShell
      title="Техподдержка"
      eyebrow="Помощь"
      description="Создай тикет на сайте — модераторы ответят здесь. Уведомление уходит и в Discord."
    >
      {!session ? (
        <ContentCard>
          <p className="text-sm text-muted-foreground">
            Войди через Discord, чтобы создать запрос в техподдержку.
          </p>
          <Link href="/api/auth/discord" className="btn-discord mt-4 inline-flex">
            Войти через Discord
          </Link>
          <p className="mt-4 text-xs text-muted-foreground">
            Или напиши сразу в{" "}
            <Link
              href={siteConfig.links.help}
              target="_blank"
              rel="noopener noreferrer"
              className="text-solar-gold hover:underline"
            >
              Discord-канал помощи
            </Link>
            .
          </p>
        </ContentCard>
      ) : (
        <SupportPanel initialTickets={tickets} />
      )}

      <ContentCard className="mt-5">
        <h2 className="font-display text-lg font-semibold">Что указать</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
          <li>Ник Minecraft и Discord</li>
          <li>Что случилось и когда</li>
          <li>Скриншоты / логи / координаты — если есть</li>
          <li>Что уже пробовал</li>
        </ul>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/docs/informaciya/faq" className="btn-secondary">
            FAQ
          </Link>
          <Link href="/applications" className="btn-secondary">
            Заявка на проходку
          </Link>
        </div>
      </ContentCard>
    </PageShell>
  );
}

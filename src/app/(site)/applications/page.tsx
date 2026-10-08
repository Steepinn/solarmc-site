import Link from "next/link";
import { ApplicationFeed } from "@/components/application-feed";
import { ApplicationForm } from "@/components/application-form";
import { ContentCard, PageShell } from "@/components/page-shell";
import { getEnrichedSession } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { getLatestUserApplication } from "@/lib/db";
import botSync from "@/config/bot-sync.json";

export const metadata = { title: "Заявки на проходку" };

type Props = { searchParams: Promise<{ sent?: string }> };

export default async function ApplicationsPage({ searchParams }: Props) {
  const session = await getEnrichedSession();
  const { sent } = await searchParams;
  const latest = session ? await getLatestUserApplication(session.discordId) : null;

  return (
    <PageShell
      title="Заявка на проходку"
      description="Подай заявку на whitelist SolarMC. Модерация в Discord с кнопками одобрения, переписка — на сайте."
      eyebrow="Проходка"
    >
      {sent ? (
        <ContentCard className="mb-6 border-green-500/20 bg-green-500/5">
          <p className="text-sm text-green-400">
            Заявка отправлена! Модераторы увидят её в Discord. Переписка и статус —{" "}
            {latest ? (
              <Link
                href={`/applications/${latest.id}`}
                className="font-semibold underline hover:no-underline"
              >
                в чате заявки
              </Link>
            ) : (
              "в чате заявки"
            )}
            .
          </p>
        </ContentCard>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ContentCard className="order-1">
          <h2 className="text-xl font-semibold">Подать заявку</h2>
          {!session ? (
            <div className="mt-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Войди через Discord и будь участником{" "}
                <a
                  href={siteConfig.links.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-solar-gold hover:underline"
                >
                  сервера Solar
                </a>
                , чтобы подать заявку.
              </p>
              <Link href="/api/auth/discord" className="btn-discord inline-flex">
                Войти через Discord
              </Link>
            </div>
          ) : session.hasWhitelist ? (
            <p className="mt-4 text-sm text-green-400">
              У тебя уже есть проходка — заходи на {botSync.serverInfo.ip}:
              {botSync.serverInfo.port}!
            </p>
          ) : latest?.status === "pending" ? (
            <div className="mt-4 space-y-3 text-sm">
              <p className="text-amber-300">
                Заявка #{latest.ticketNumber ?? "—"} на рассмотрении.
              </p>
              <p className="text-muted-foreground">
                Пиши модераторам в чате на сайте. Решение придёт в Discord и сюда.
              </p>
              <Link href={`/applications/${latest.id}`} className="btn-primary inline-flex">
                Открыть переписку
              </Link>
            </div>
          ) : (
            <div className="mt-6">
              <ApplicationForm />
            </div>
          )}
        </ContentCard>

        <aside className="order-2 space-y-4">
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Недавние заявки
            </h2>
            <ApplicationFeed compact />
          </div>
          {session?.isAdmin ? (
            <ContentCard className="border-solar-gold/25 bg-solar-gold/5">
              <p className="text-sm">
                <Link href="/admin" className="font-semibold text-solar-gold hover:underline">
                  Админ-панель
                </Link>{" "}
                — полная модерация заявок.
              </p>
            </ContentCard>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}

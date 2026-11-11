import Link from "next/link";
import { ApplicationFeed } from "@/components/application-feed";
import { ApplicationForm } from "@/components/application-form";
import { ContentCard, PageShell } from "@/components/page-shell";
import { getEnrichedSession } from "@/lib/auth";
import { siteConfig } from "@/config/site";
import { getLatestUserApplication } from "@/lib/db";

export const metadata = { title: "Заявки на проходку" };

type Props = { searchParams: Promise<{ sent?: string }> };

export default async function ApplicationsPage({ searchParams }: Props) {
  const session = await getEnrichedSession();
  const { sent } = await searchParams;
  const latest = session ? await getLatestUserApplication(session.discordId) : null;

  return (
    <PageShell
      title="Заявка на проходку"
      description="Давай познакомимся. Расскажи о себе, получи проходку и начни свою историю в мире Solar."
      className="solar-applications-page"
      eyebrow="Проходка"
    >
      <div className="application-journey"><div><span>01</span><strong>Знакомство</strong><p>Войди через Discord и заполни анкету.</p></div><div><span>02</span><strong>Рассмотрение</strong><p>Следи за статусом и отвечай в чате заявки.</p></div><div><span>03</span><strong>Добро пожаловать</strong><p>После одобрения скачай лаунчер и заходи.</p></div></div>
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
          <h2 className="text-xl font-semibold">Твоё место в Solar</h2>
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
              У тебя уже есть проходка — скачай{" "}
              <Link href="/launcher" className="font-semibold underline hover:no-underline">
                лаунчер
              </Link>{" "}
              и заходи на сервер.
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
          <ContentCard><p className="application-aside-kicker">ПЕРЕД ОТПРАВКОЙ</p><h3 className="text-lg font-bold">Будь собой.</h3><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Здесь нет идеальных ответов. Расскажи о своих интересах и планах — так нам будет проще познакомиться.</p><Link href="/docs/informaciya/rules" className="mt-4 inline-block text-sm text-solar-gold">Прочитать правила ↗</Link></ContentCard>
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

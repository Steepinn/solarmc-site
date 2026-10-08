import Link from "next/link";
import { ContentCard, PageShell } from "@/components/page-shell";

export const metadata = { title: "Приобрести проходку" };

export default function WalletAccessPage() {
  return (
    <PageShell
      title="Приобрести проходку"
      description="Авторизуйся через Discord и получи доступ на сервер SolarMC."
      eyebrow="Магазин"
    >
      <ContentCard className="max-w-xl">
        <ol className="list-decimal space-y-3 pl-5 text-sm">
          <li>Войди через Discord на сайте.</li>
          <li>Заполни заявку на проходку.</li>
          <li>Дождись одобрения модерации (до 24 часов).</li>
        </ol>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/applications"
            className="inline-flex rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Подать заявку
          </Link>
          <Link
            href="/api/auth/discord"
            className="inline-flex rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-accent"
          >
            Войти через Discord
          </Link>
        </div>
      </ContentCard>
    </PageShell>
  );
}

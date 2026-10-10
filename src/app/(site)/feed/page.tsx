import Link from "next/link";
import { Suspense } from "react";
import { PageShell } from "@/components/page-shell";
import { SocialFeed } from "@/components/social-feed";

export const metadata = { title: "Лента" };

export default function FeedPage() {
  return (
    <PageShell
      title="Лента"
      description="Посты игроков — как в соцсети, только про SolarMC."
      eyebrow="Соцсеть"
    >
      <p className="mb-4 text-sm text-muted-foreground sm:mb-6">
        <Link href="/social" className="text-solar-gold hover:underline">
          ← Социальная сеть
        </Link>
      </p>
      <Suspense fallback={<p className="text-sm text-muted-foreground">Загрузка…</p>}>
        <SocialFeed />
      </Suspense>
    </PageShell>
  );
}

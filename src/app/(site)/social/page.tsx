import Link from "next/link";
import {
  Calendar,
  MapPin,
  MessageCircle,
  UserCircle,
  Users,
} from "lucide-react";
import { ContentCard, PageShell } from "@/components/page-shell";
import { getEnrichedSession } from "@/lib/auth";
import { profilePath } from "@/lib/site-users";

export const metadata = { title: "Социальная сеть" };

const tiles = [
  {
    href: "/feed",
    title: "Лента",
    description: "Посты игроков, лайки и новости с сервера.",
    icon: MessageCircle,
  },
  {
    href: "/cities",
    title: "Города",
    description: "Общины, законы и основатели.",
    icon: MapPin,
  },
  {
    href: "/events",
    title: "Ивенты",
    description: "Анонсы и активности Season 3.",
    icon: Calendar,
  },
  {
    href: "/team",
    title: "Команда",
    description: "Staff и контакты проекта.",
    icon: Users,
  },
] as const;

export default async function SocialHubPage() {
  const session = await getEnrichedSession();
  const profileHref = session
    ? profilePath({
        discordId: session.discordId,
        username: session.username,
        mcNick: session.mcNick,
      })
    : "/auth/discord";

  return (
    <PageShell
      title="Социальная сеть"
      description="Профили, лента, города и ивенты — всё сообщество SolarMC в одном месте."
      eyebrow="Соцсеть"
    >
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
        {tiles.map((tile) => (
          <Link key={tile.href} href={tile.href} className="group min-w-0">
            <ContentCard className="h-full transition-colors group-hover:border-solar-gold/40">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-gold/10 text-solar-gold">
                  <tile.icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{tile.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{tile.description}</p>
                </div>
              </div>
            </ContentCard>
          </Link>
        ))}

        <Link href={profileHref} className="group min-w-0 sm:col-span-2">
          <ContentCard className="h-full border-solar-gold/25 bg-solar-gold/5 transition-colors group-hover:border-solar-gold/50">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-solar-gold/15 text-solar-gold">
                <UserCircle className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  {session ? "Мой профиль" : "Войти в соцсеть"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {session
                    ? "Карточка игрока, роли и быстрые ссылки."
                    : "Discord-авторизация — чтобы постить и лайкать."}
                </p>
              </div>
            </div>
          </ContentCard>
        </Link>
      </div>
    </PageShell>
  );
}

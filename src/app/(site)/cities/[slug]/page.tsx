import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ContentCard, PageShell } from "@/components/page-shell";
import { getCityBySlug } from "@/lib/cities-db";
import { profilePath } from "@/lib/site-users";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

function isImageUrl(src?: string) {
  if (!src?.trim()) return false;
  const s = src.trim();
  if (s === "нет" || s === "-" || s === "null") return false;
  return /^https?:\/\//i.test(s) || s.startsWith("/");
}

function decodeSlug(raw: string) {
  let slug = raw.trim();
  for (let i = 0; i < 2; i++) {
    try {
      if (/%[0-9A-Fa-f]{2}/.test(slug)) slug = decodeURIComponent(slug);
      else break;
    } catch {
      break;
    }
  }
  return slug;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const city = await getCityBySlug(slug);
  return { title: city?.name ?? "Город" };
}

export default async function CityDetailPage({ params }: Props) {
  const { slug: slugParam } = await params;
  const requested = decodeSlug(slugParam);
  const city = await getCityBySlug(requested);
  if (!city) notFound();

  if (requested !== city.slug) {
    redirect(`/cities/${city.slug}`);
  }

  const founderHref = profilePath({
    mcNick: city.founderMcNick,
    discordId: city.founderDiscordId,
    username: city.founderName,
  });

  return (
    <PageShell
      title={city.name}
      eyebrow="Город"
      description={city.description.slice(0, 160)}
    >
      <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,280px)] lg:items-start">
        <aside className="order-1 min-w-0 lg:sticky lg:top-[calc(var(--site-shell-offset)+0.5rem)] lg:order-2 lg:self-start">
          <ContentCard className="p-4 sm:p-6">
            <h2 className="text-base font-semibold sm:text-lg">Основатель</h2>
            <Link
              href={founderHref}
              className="mt-2 block break-words text-sm font-medium text-solar-gold hover:underline"
            >
              {city.founderMcNick ?? city.founderName}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">
              Создан: {new Date(city.createdAt).toLocaleDateString("ru-RU")}
            </p>
            {city.mapX != null && city.mapZ != null ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Координаты: {city.mapX}, {city.mapZ}
              </p>
            ) : null}
            <Link
              href="/cities"
              className="btn-secondary mt-4 inline-flex w-full justify-center sm:mt-6"
            >
              Все города
            </Link>
          </ContentCard>
        </aside>

        <div className="order-2 min-w-0 space-y-4 sm:space-y-6 lg:order-1">
          {isImageUrl(city.image) ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
              <Image
                src={city.image!}
                alt={city.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 900px"
                unoptimized
              />
            </div>
          ) : null}
          <ContentCard className="p-4 sm:p-6">
            <h2 className="text-base font-semibold sm:text-lg">О городе</h2>
            <p className="user-content mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {city.description}
            </p>
          </ContentCard>
          {city.law ? (
            <ContentCard className="p-4 sm:p-6">
              <h2 className="text-base font-semibold sm:text-lg">Законы</h2>
              <p className="user-content mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {city.law}
              </p>
            </ContentCard>
          ) : null}
        </div>
      </div>
    </PageShell>
  );
}

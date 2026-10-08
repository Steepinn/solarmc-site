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
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-6">
          {isImageUrl(city.image) ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
              <Image
                src={city.image!}
                alt={city.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : null}
          <ContentCard>
            <h2 className="text-lg font-semibold">О городе</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
              {city.description}
            </p>
          </ContentCard>
          {city.law ? (
            <ContentCard>
              <h2 className="text-lg font-semibold">Законы</h2>
              <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                {city.law}
              </p>
            </ContentCard>
          ) : null}
        </div>
        <ContentCard>
          <h2 className="font-semibold">Основатель</h2>
          <Link
            href={founderHref}
            className="mt-2 block text-sm text-solar-gold hover:underline"
          >
            {city.founderMcNick ?? city.founderName}
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">
            Создан: {new Date(city.createdAt).toLocaleDateString("ru-RU")}
          </p>
          {city.mapX != null && city.mapZ != null ? (
            <p className="mt-4 text-xs text-muted-foreground">
              Координаты: {city.mapX}, {city.mapZ}
            </p>
          ) : null}
          <Link
            href="/cities"
            className="btn-secondary mt-6 inline-flex w-full justify-center"
          >
            Все города
          </Link>
        </ContentCard>
      </div>
    </PageShell>
  );
}

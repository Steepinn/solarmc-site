import Link from "next/link";
import { ContentCard, PageShell } from "@/components/page-shell";
import { getCities } from "@/lib/cities-db";
import { getEnrichedSession } from "@/lib/auth";
import { CityAdminForm } from "@/components/city-admin-form";

export const metadata = { title: "Города" };

export default async function CitiesPage() {
  const cities = await getCities();
  const session = await getEnrichedSession();

  return (
    <PageShell
      title="Города"
      description="Общины игроков SolarMC — законы, основатели и описание."
      eyebrow="Сообщество"
    >
      {session?.isAdmin ? (
        <ContentCard className="mb-6">
          <h2 className="text-lg font-semibold">Добавить город</h2>
          <div className="mt-4">
            <CityAdminForm />
          </div>
        </ContentCard>
      ) : null}

      {cities.length === 0 ? (
        <ContentCard>
          <p className="text-sm text-muted-foreground">Городов пока нет.</p>
        </ContentCard>
      ) : (
        <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {cities.map((city) => (
            <Link key={city.id} href={`/cities/${city.slug}`}>
              <ContentCard className="h-full transition-colors hover:border-solar-gold/40">
                <h2 className="text-lg font-semibold">{city.name}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {city.description}
                </p>
                <p className="mt-4 text-xs text-solar-gold">
                  Основатель: {city.founderMcNick ?? city.founderName}
                </p>
              </ContentCard>
            </Link>
          ))}
        </div>
      )}
    </PageShell>
  );
}

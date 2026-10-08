import { ContentCard, PageShell } from "@/components/page-shell";

const events = [
  {
    title: "Стройка недели",
    date: "Каждую субботу",
    description: "Совместная стройка на спавне — все welcome.",
  },
  {
    title: "PvP-турнир",
    date: "Раз в месяц",
    description: "Дружеские дуэли с призами от администрации.",
  },
  {
    title: "Киновечер",
    date: "По анонсам в Discord",
    description: "Смотрим и обсуждаем в голосовом канале.",
  },
];

export const metadata = { title: "Ивенты" };
export const dynamic = "force-static";

export default function EventsPage() {
  return (
    <PageShell
      title="Ивенты"
      description="Мероприятия, турниры и совместные активности на SolarMC."
      eyebrow="Сообщество"
    >
      <div className="space-y-4">
        {events.map((event) => (
          <ContentCard
            key={event.title}
            className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h2 className="text-lg font-semibold">{event.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
            </div>
            <span className="shrink-0 rounded-full bg-solar-yellow/10 px-3 py-1 text-xs font-medium text-solar-gold">
              {event.date}
            </span>
          </ContentCard>
        ))}
      </div>
    </PageShell>
  );
}

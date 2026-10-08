import { ContentCard, PageShell } from "@/components/page-shell";

export const metadata = { title: "Суды" };
export const dynamic = "force-static";

export default function CourtsPage() {
  return (
    <PageShell
      title="Суды"
      description="Разбор споров между игроками — прозрачно и по правилам сервера."
      eyebrow="Модерация"
    >
      <ContentCard>
        <p className="text-sm text-muted-foreground">
          Раздел судов будет подключён к API. Здесь будут отображаться активные
          и завершённые дела с вердиктами модерации.
        </p>
      </ContentCard>
    </PageShell>
  );
}

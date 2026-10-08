import { ContentCard, PageShell } from "@/components/page-shell";

export const metadata = { title: "Баны" };

export default function BansPage() {
  return (
    <PageShell
      title="Баны"
      description="Публичный список заблокированных игроков и причины."
      eyebrow="Модерация"
    >
      <ContentCard className="overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Игрок</th>
              <th className="px-4 py-3 text-left font-medium">Причина</th>
              <th className="px-4 py-3 text-left font-medium">Срок</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="px-4 py-3 text-muted-foreground" colSpan={3}>
                Список пуст — нарушений нет 🌞
              </td>
            </tr>
          </tbody>
        </table>
      </ContentCard>
    </PageShell>
  );
}

import { PageShell } from "@/components/page-shell";
import { StatusPanel } from "@/components/status-panel";
export const metadata = { title: "Статус" };

export default function StatusPage() {
  return (
    <PageShell
      title="Статус сервера"
      description="Онлайн, TPS и версия сервера. Подключение — только через лаунчер."
      eyebrow="Сервер"
    >
      <StatusPanel />
    </PageShell>
  );
}

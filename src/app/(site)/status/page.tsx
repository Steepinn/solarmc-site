import { PageShell } from "@/components/page-shell";
import { StatusPanel } from "@/components/status-panel";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Статус" };

export default function StatusPage() {
  return (
    <PageShell
      title="Статус сервера"
      description={`Онлайн, TPS и состояние ${siteConfig.serverIp} в реальном времени.`}
      eyebrow="Сервер"
    >
      <StatusPanel />
    </PageShell>
  );
}

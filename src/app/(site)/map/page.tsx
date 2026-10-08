import { PageShell } from "@/components/page-shell";
import { MapViewer } from "@/components/map-viewer";

export const metadata = { title: "Онлайн карта" };

export default function MapPage() {
  return (
    <PageShell
      title="Онлайн карта"
      description="Карта мира со спавном, городами и интересными точками."
      eyebrow="Сервер"
    >
      <MapViewer />
    </PageShell>
  );
}

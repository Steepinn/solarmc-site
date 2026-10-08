import { redirect } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { AdminDashboard } from "@/components/admin-dashboard";
import { getEnrichedSession } from "@/lib/auth";
import { getPassApplications } from "@/lib/db";
import { getSupportTickets } from "@/lib/support-db";

export const metadata = { title: "Админ-панель" };

export default async function AdminPage() {
  const session = await getEnrichedSession();
  if (!session) redirect("/auth/discord");
  if (!session.isAdmin) redirect("/profile");

  const [apps, support] = await Promise.all([
    getPassApplications(),
    getSupportTickets(),
  ]);

  return (
    <PageShell
      title="Админ-панель"
      eyebrow="Staff"
      description="Обзор, заявки, тикеты, пользователи, ачивки, роли и рассылки."
    >
      <AdminDashboard initialApps={apps} initialSupport={support} />
    </PageShell>
  );
}

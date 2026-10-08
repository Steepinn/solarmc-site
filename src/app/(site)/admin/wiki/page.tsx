import { redirect } from "next/navigation";
import { ContentCard, PageShell } from "@/components/page-shell";
import { WikiEditor } from "@/components/wiki-editor";
import { getEnrichedSession } from "@/lib/auth";

export const metadata = { title: "Редактирование вики" };

export default async function AdminWikiPage() {
  const session = await getEnrichedSession();
  if (!session) redirect("/auth/discord");
  if (!session.isAdmin) redirect("/profile");

  return (
    <PageShell title="Редактирование вики" eyebrow="Staff" description="Markdown-файлы в content/wiki">
      <ContentCard>
        <WikiEditor />
      </ContentCard>
    </PageShell>
  );
}

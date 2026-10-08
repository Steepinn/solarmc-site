import { notFound, redirect } from "next/navigation";
import { ApplicationChat } from "@/components/application-chat";
import { getEnrichedSession } from "@/lib/auth";
import { getApplicationById } from "@/lib/db";
import { syncApplicationFromDiscord } from "@/lib/application-bridge";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const app = await getApplicationById(id);
  return {
    title: app ? `Заявка #${app.ticketNumber ?? "—"}` : "Заявка",
  };
}

export default async function ApplicationChatPage({ params }: Props) {
  const session = await getEnrichedSession();
  if (!session) {
    redirect("/api/auth/discord");
  }

  const { id } = await params;
  let app = await getApplicationById(id);
  if (!app) notFound();

  if (!session.isAdmin && app.discordId !== session.discordId) {
    notFound();
  }

  app = await syncApplicationFromDiscord(app);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-3 py-4 sm:px-6">
      <ApplicationChat
        initialApp={app}
        isStaff={session.isAdmin}
        backHref={session.isAdmin ? "/admin" : "/applications"}
      />
    </div>
  );
}

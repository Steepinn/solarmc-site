import { notFound, redirect } from "next/navigation";
import { SupportTicketView } from "@/components/support-ticket-view";
import { getEnrichedSession } from "@/lib/auth";
import { getSupportTicketById } from "@/lib/support-db";
import { syncSupportTicketFromDiscord } from "@/lib/support-bridge";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const ticket = await getSupportTicketById(id);
  if (!ticket) return { title: "Тикет" };
  return { title: `Тикет #${ticket.number} — ${ticket.subject}` };
}

export default async function SupportTicketPage({ params }: Props) {
  const session = await getEnrichedSession();
  if (!session) redirect("/auth/discord");

  const { id } = await params;
  let ticket = await getSupportTicketById(id);
  if (!ticket) notFound();

  if (!session.isAdmin && ticket.discordId !== session.discordId) {
    redirect("/support");
  }

  ticket = await syncSupportTicketFromDiscord(ticket);

  return (
      <div className="relative z-[1] mx-auto max-w-[1400px] px-4 py-3 sm:py-4">
      <SupportTicketView
        initialTicket={ticket}
        isStaff={session.isAdmin}
        backHref={session.isAdmin ? "/admin" : "/support"}
      />
    </div>
  );
}

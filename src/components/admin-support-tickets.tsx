"use client";

import { SupportTicketList } from "@/components/support-ticket-list";
import type { SupportTicket } from "@/lib/types";

export function AdminSupportTickets({
  initialTickets,
}: {
  initialTickets: SupportTicket[];
}) {
  return <SupportTicketList initialTickets={initialTickets} isStaff />;
}

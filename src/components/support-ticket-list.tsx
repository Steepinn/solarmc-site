"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { SupportTicket, SupportTicketStatus } from "@/lib/types";
import { supportStatusLabels } from "@/lib/support-labels";
import { ContentCard } from "@/components/page-shell";
import { cn } from "@/lib/utils";

const statusColors: Record<SupportTicketStatus, string> = {
  open: "bg-amber-500/15 text-amber-300",
  answered: "bg-sky-500/15 text-sky-300",
  closed: "bg-muted text-muted-foreground",
};

export function SupportTicketList({
  initialTickets,
  isStaff = false,
}: {
  initialTickets: SupportTicket[];
  isStaff?: boolean;
}) {
  const [filter, setFilter] = useState<"active" | "all" | SupportTicketStatus>(
    isStaff ? "open" : "active",
  );

  const filtered = useMemo(() => {
    if (filter === "all") return initialTickets;
    if (filter === "active") {
      return initialTickets.filter((t) => t.status !== "closed");
    }
    return initialTickets.filter((t) => t.status === filter);
  }, [initialTickets, filter]);

  if (initialTickets.length === 0) {
    return (
      <ContentCard>
        <p className="text-sm text-muted-foreground">
          {isStaff ? "Тикетов пока нет." : "У тебя пока нет тикетов."}
        </p>
      </ContentCard>
    );
  }

  return (
    <ContentCard className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {(isStaff
          ? (["open", "answered", "closed", "all"] as const)
          : (["active", "closed", "all"] as const)
        ).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors",
              filter === f
                ? "bg-solar-gold/20 text-solar-gold"
                : "bg-muted/40 text-muted-foreground hover:bg-accent",
            )}
          >
            {f === "all"
              ? "Все"
              : f === "active"
                ? "Активные"
                : supportStatusLabels[f]}
          </button>
        ))}
      </div>

      <ul className="space-y-2">
        {filtered.map((t) => (
          <li key={t.id}>
            <Link
              href={`/support/${t.id}`}
              className="block rounded-2xl border border-border bg-card/40 px-4 py-3.5 transition-colors hover:border-solar-gold/40 hover:bg-solar-gold/10"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-solar-gold">
                  #{t.number}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                    statusColors[t.status],
                  )}
                >
                  {supportStatusLabels[t.status]}
                </span>
              </div>
              <p className="mt-1.5 text-base font-semibold">{t.subject}</p>
              {isStaff ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.mcNick ?? t.discordUsername}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  {t.messages.length} сообщ. · открыть на всю страницу
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </ContentCard>
  );
}

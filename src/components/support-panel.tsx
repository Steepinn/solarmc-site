"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { ContentCard } from "@/components/page-shell";
import { SupportTicketForm } from "@/components/support-ticket-form";
import { SupportTicketList } from "@/components/support-ticket-list";
import type { SupportTicket } from "@/lib/types";

export function SupportPanel({
  initialTickets,
}: {
  initialTickets: SupportTicket[];
}) {
  const router = useRouter();
  const [composeOpen, setComposeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!composeOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setComposeOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [composeOpen]);

  useEffect(() => {
    if (!composeOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [composeOpen]);

  const composeModal =
    composeOpen && mounted
      ? createPortal(
          <div
            className="support-compose"
            role="dialog"
            aria-modal="true"
            aria-label="Новый тикет"
          >
            <button
              type="button"
              className="support-compose__backdrop"
              aria-label="Закрыть"
              onClick={() => setComposeOpen(false)}
            />
            <ContentCard className="support-compose__card relative z-[1] w-full max-w-lg">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold">Новый тикет</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Опиши проблему — модераторы ответят здесь
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-accent"
                  aria-label="Закрыть"
                  onClick={() => setComposeOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>
              <SupportTicketForm
                onCreated={(ticketId) => {
                  setComposeOpen(false);
                  router.push(`/support/${ticketId}`);
                }}
              />
            </ContentCard>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold">Мои запросы</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Максимум 3 открытых тикета · нажми, чтобы открыть на всю страницу
          </p>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setComposeOpen(true)}
        >
          Открыть новый тикет
        </button>
      </div>

      <SupportTicketList initialTickets={initialTickets} />
      {composeModal}
    </div>
  );
}

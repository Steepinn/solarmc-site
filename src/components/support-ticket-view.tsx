"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Shield, User } from "lucide-react";
import botSync from "@/config/bot-sync.json";
import {
  supportCategoryLabels,
  supportStatusLabels,
} from "@/lib/support-labels";
import type { SupportTicket, SupportTicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const statusColors: Record<SupportTicketStatus, string> = {
  open: "bg-amber-500/15 text-amber-300",
  answered: "bg-sky-500/15 text-sky-300",
  closed: "bg-muted text-muted-foreground",
};

const COOLDOWN_MS = 60_000;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function discordChannelUrl(channelId: string) {
  return `https://discord.com/channels/${botSync.guildId}/${channelId}`;
}

function cooldownLeftMs(ticket: SupportTicket, isStaff: boolean) {
  if (isStaff) return 0;
  const own = [...ticket.messages]
    .reverse()
    .find((m) => m.authorRole === "user");
  if (!own) return 0;
  const left = COOLDOWN_MS - (Date.now() - new Date(own.createdAt).getTime());
  return left > 0 ? left : 0;
}

export function SupportTicketView({
  initialTicket,
  isStaff = false,
  backHref = "/support",
}: {
  initialTicket: SupportTicket;
  isStaff?: boolean;
  backHref?: string;
}) {
  const [ticket, setTicket] = useState(initialTicket);
  const [reply, setReply] = useState("");
  const [replyEvidence, setReplyEvidence] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTicket(initialTicket);
  }, [initialTicket]);

  useEffect(() => {
    const update = () => setCooldown(cooldownLeftMs(ticket, isStaff));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [ticket, isStaff]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [ticket.messages.length, ticket.id]);

  useEffect(() => {
    if (ticket.status === "closed") return;

    const tick = async () => {
      const res = await fetch(`/api/support/${ticket.id}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.ticket) setTicket(data.ticket);
    };

    const id = window.setInterval(tick, 4000);
    return () => window.clearInterval(id);
  }, [ticket.id, ticket.status]);

  async function sendReply() {
    if (!reply.trim() || cooldown > 0) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/support/${ticket.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply, evidence: replyEvidence }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      const errors: Record<string, string> = {
        closed: "Тикет закрыт",
        rate_limit: "Можно отправлять 1 сообщение в минуту",
        invalid_evidence_url: "Проверь ссылки на доказательства",
        evidence_host_not_allowed: "Сервис ссылки не в списке разрешённых",
        too_many_evidence: "Максимум 5 ссылок",
      };
      setError(errors[data.error] ?? "Не удалось отправить сообщение");
      return;
    }
    setReply("");
    setReplyEvidence("");
    setTicket(data.ticket);
  }

  async function setStatus(status: SupportTicketStatus) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/support/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? `Не удалось обновить статус (${data.error})`
            : "Не удалось обновить статус",
        );
        return;
      }
      setTicket(data.ticket);
    } catch {
      setError("Сеть: не удалось обновить статус");
    } finally {
      setLoading(false);
    }
  }

  const cooldownSec = Math.ceil(cooldown / 1000);

  return (
    <div className="support-ticket-page flex h-[calc(100svh-var(--site-shell-offset)-1.5rem)] flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          К списку
        </Link>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            statusColors[ticket.status],
          )}
        >
          {supportStatusLabels[ticket.status]}
        </span>
      </div>

      <div className="panel-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
        <header className="shrink-0 border-b border-border px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-solar-gold">
            Тикет #{ticket.number} · {supportCategoryLabels[ticket.category]}
          </p>
          <h1 className="font-display mt-1 truncate text-xl font-bold sm:text-2xl">
            {ticket.subject}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {isStaff ? (
              <span>
                {ticket.discordUsername}
                {ticket.mcNick ? ` · ${ticket.mcNick}` : ""}
              </span>
            ) : null}
            {ticket.discordChannelId ? (
              <a
                href={discordChannelUrl(ticket.discordChannelId)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-solar-gold hover:underline"
              >
                web-support-{ticket.number}
              </a>
            ) : null}
          </div>
        </header>

        <div
          ref={chatRef}
          className="support-chat-scroll min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5"
        >
          {ticket.messages.map((m) => {
            const staff = m.authorRole === "staff";
            return (
              <div
                key={m.id}
                className={cn(
                  "flex w-full",
                  staff ? "justify-start" : "justify-end",
                )}
              >
                <div
                  className={cn(
                    "max-w-[min(96%,48rem)] rounded-2xl border px-3.5 py-3 shadow-sm",
                    staff
                      ? "border-solar-gold/50 bg-gradient-to-br from-solar-gold/20 to-amber-600/10"
                      : "border-border/80 bg-muted/35",
                  )}
                >
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 font-semibold",
                        staff ? "text-solar-gold" : "text-foreground",
                      )}
                    >
                      {staff ? (
                        <Shield className="size-3.5 shrink-0" />
                      ) : (
                        <User className="size-3.5 shrink-0 opacity-70" />
                      )}
                      {m.authorUsername}
                      {staff ? (
                        <span className="rounded-md bg-solar-gold/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-solar-gold">
                          Staff
                        </span>
                      ) : (
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                          Игрок
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 text-muted-foreground">
                      {formatDate(m.createdAt)}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-2 whitespace-pre-wrap text-sm leading-relaxed sm:text-base",
                      staff && "text-foreground",
                    )}
                  >
                    {m.body}
                  </p>
                  {m.evidenceUrls?.length ? (
                    <ul className="mt-2 space-y-1 border-t border-border/50 pt-2">
                      {m.evidenceUrls.map((url) => (
                        <li key={url}>
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="break-all text-xs text-solar-gold hover:underline"
                          >
                            {url}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {ticket.status !== "closed" ? (
          <div className="shrink-0 space-y-2.5 border-t border-border bg-card/80 px-3 py-3 sm:px-5">
            <textarea
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={isStaff ? "Ответ игроку..." : "Написать сообщение..."}
              className="input-field w-full resize-none"
            />
            <textarea
              rows={1}
              value={replyEvidence}
              onChange={(e) => setReplyEvidence(e.target.value)}
              placeholder="Ссылки на доказательства (по желанию)"
              className="input-field w-full resize-none font-mono text-sm"
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            {!isStaff && cooldownSec > 0 ? (
              <p className="text-xs text-amber-300">
                Следующее сообщение через {cooldownSec} сек.
              </p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={loading || !reply.trim() || cooldown > 0}
                onClick={sendReply}
                className="btn-primary"
              >
                {loading
                  ? "..."
                  : cooldownSec > 0
                    ? `Подожди ${cooldownSec}с`
                    : "Отправить"}
              </button>
              {isStaff ? (
                <>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setStatus("answered")}
                    className="btn-secondary"
                  >
                    Отвечено
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setStatus("closed")}
                    className="btn-secondary text-red-400"
                  >
                    Закрыть
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setStatus("closed")}
                  className="btn-secondary"
                >
                  Закрыть тикет
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">Тикет закрыт.</p>
            {isStaff ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => setStatus("open")}
                className="btn-secondary mt-2"
              >
                Открыть снова
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

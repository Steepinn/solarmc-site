"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Shield, User } from "lucide-react";
import botSync from "@/config/bot-sync.json";
import type { Application } from "@/lib/types";
import { cn } from "@/lib/utils";

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

function cooldownLeftMs(app: Application, isStaff: boolean) {
  if (isStaff) return 0;
  const own = [...(app.messages ?? [])]
    .reverse()
    .find((m) => m.authorRole === "user");
  if (!own) return 0;
  const left = COOLDOWN_MS - (Date.now() - new Date(own.createdAt).getTime());
  return left > 0 ? left : 0;
}

export function ApplicationChat({
  initialApp,
  isStaff = false,
  backHref = "/applications",
}: {
  initialApp: Application;
  isStaff?: boolean;
  backHref?: string;
}) {
  const [app, setApp] = useState(initialApp);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setApp(initialApp);
  }, [initialApp]);

  useEffect(() => {
    const update = () => setCooldown(cooldownLeftMs(app, isStaff));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [app, isStaff]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [app.messages?.length, app.id]);

  useEffect(() => {
    if (app.status !== "pending") return;
    const tick = async () => {
      const res = await fetch(`/api/applications/${app.id}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.application) setApp(data.application);
    };
    const id = window.setInterval(tick, 4000);
    return () => window.clearInterval(id);
  }, [app.id, app.status]);

  async function sendReply() {
    if (!reply.trim() || cooldown > 0) return;
    setLoading(true);
    setError("");
    const res = await fetch(`/api/applications/${app.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      const errors: Record<string, string> = {
        closed: "Заявка уже рассмотрена",
        rate_limit: "Можно отправлять 1 сообщение в минуту",
      };
      setError(errors[data.error] ?? "Не удалось отправить");
      return;
    }
    setReply("");
    setApp(data.application);
  }

  const cooldownSec = Math.ceil(cooldown / 1000);
  const statusLabel =
    app.status === "pending"
      ? "На рассмотрении"
      : app.status === "approved"
        ? "Одобрено"
        : "Отклонено";

  return (
    <div className="flex h-[calc(100svh-var(--site-shell-offset)-1.5rem)] flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Назад
        </Link>
        <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
          {statusLabel}
        </span>
      </div>

      <div className="panel-surface flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl">
        <header className="shrink-0 border-b border-border px-4 py-3 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-solar-gold">
            Заявка #{app.ticketNumber ?? "—"} · {app.mcNick}
          </p>
          <h1 className="font-display mt-1 text-xl font-bold sm:text-2xl">
            Переписка по проходке
          </h1>
          <p className="mt-1.5 text-xs text-muted-foreground">
            Общайся здесь. В Discord модераторы видят копию; игрока в канал
            добавляют вручную при необходимости.
            {isStaff && app.discordChannelId ? (
              <>
                {" "}
                <a
                  href={discordChannelUrl(app.discordChannelId)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-solar-gold hover:underline"
                >
                  заявка-{app.ticketNumber}
                </a>
              </>
            ) : null}
          </p>
        </header>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-4 sm:px-5">
          {(app.messages ?? []).map((m) => {
            const staff = m.authorRole === "staff";
            const system = m.authorRole === "system";
            return (
              <div
                key={m.id}
                className={cn(
                  "flex w-full",
                  system
                    ? "justify-center"
                    : staff
                      ? "justify-start"
                      : "justify-end",
                )}
              >
                <div
                  className={cn(
                    "max-w-[min(96%,48rem)] rounded-2xl border px-3.5 py-3 shadow-sm",
                    system && "border-border/60 bg-muted/20 text-center",
                    staff &&
                      "border-solar-gold/50 bg-gradient-to-br from-solar-gold/20 to-amber-600/10",
                    !staff &&
                      !system &&
                      "border-border/80 bg-muted/35",
                  )}
                >
                  {!system ? (
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
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {formatDate(m.createdAt)}
                      </span>
                    </div>
                  ) : null}
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed sm:text-base">
                    {m.body}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {app.status === "pending" ? (
          <div className="shrink-0 space-y-2.5 border-t border-border bg-card/80 px-3 py-3 sm:px-5">
            <textarea
              rows={2}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder={
                isStaff ? "Сообщение игроку..." : "Написать модератору..."
              }
              className="input-field w-full resize-none"
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {!isStaff && cooldown > 0
                  ? `Подожди ${cooldownSec} сек.`
                  : "1 сообщение в минуту для игроков"}
              </p>
              <button
                type="button"
                disabled={loading || !reply.trim() || cooldown > 0}
                onClick={sendReply}
                className="btn-primary"
              >
                {loading ? "Отправка..." : "Отправить"}
              </button>
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-t border-border px-4 py-3 text-sm text-muted-foreground">
            {app.status === "approved"
              ? "Заявка одобрена — переписка закрыта."
              : `Заявка отклонена${app.rejectReason ? `: ${app.rejectReason}` : "."}`}
          </div>
        )}
      </div>
    </div>
  );
}

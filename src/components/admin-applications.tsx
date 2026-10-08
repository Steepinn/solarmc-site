"use client";

import { useMemo, useState } from "react";
import type { Application, ApplicationStatus } from "@/lib/types";
import { ContentCard } from "@/components/page-shell";
import { cn } from "@/lib/utils";

const statusLabels: Record<ApplicationStatus, string> = {
  pending: "На рассмотрении",
  approved: "Одобрено",
  rejected: "Отклонено",
};

const statusColors: Record<ApplicationStatus, string> = {
  pending: "bg-amber-500/15 text-amber-300",
  approved: "bg-green-500/15 text-green-400",
  rejected: "bg-red-500/15 text-red-400",
};

type Filter = "all" | ApplicationStatus;

export function AdminApplications({ initialApps }: { initialApps: Application[] }) {
  const [apps, setApps] = useState(initialApps);
  const [filter, setFilter] = useState<Filter>("pending");
  const [selectedId, setSelectedId] = useState<string | null>(
    initialApps.find((a) => a.status === "pending")?.id ?? null,
  );
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    if (filter === "all") return apps;
    return apps.filter((a) => a.status === filter);
  }, [apps, filter]);

  const selected = apps.find((a) => a.id === selectedId) ?? filtered[0] ?? null;

  async function importFromDiscord() {
    setImporting(true);
    setMessage("");
    const res = await fetch("/api/admin/import-applications", { method: "POST" });
    const data = await res.json();
    setImporting(false);
    if (res.ok) {
      setMessage(`Импортировано ${data.imported} заявок`);
      window.location.reload();
    } else {
      setMessage(data.error ?? "Ошибка импорта");
    }
  }

  async function review(id: string, status: "approved" | "rejected") {
    let rejectReason: string | undefined;
    if (status === "rejected") {
      rejectReason = prompt("Причина отказа:") ?? undefined;
      if (!rejectReason?.trim()) return;
    }

    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectReason }),
    });

    if (!res.ok) {
      setMessage("Ошибка: не удалось обновить заявку или синхронизировать Discord");
      return;
    }

    setMessage(
      status === "approved"
        ? "Заявка одобрена, роль Player выдана в Discord"
        : "Заявка отклонена, роль Player снята в Discord",
    );

    setApps((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status,
              rejectReason,
              reviewedAt: new Date().toISOString(),
            }
          : a,
      ),
    );

    const nextPending = apps.find((a) => a.id !== id && a.status === "pending");
    setSelectedId(nextPending?.id ?? null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <ContentCard className="lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">Очередь</h2>
          <button
            type="button"
            onClick={importFromDiscord}
            disabled={importing}
            className="btn-secondary px-3 py-2 text-xs"
          >
            {importing ? "..." : "Импорт Discord"}
          </button>
        </div>

        {message ? <p className="mb-3 text-xs text-muted-foreground">{message}</p> : null}

        <div className="mb-3 flex flex-wrap gap-1">
          {(["pending", "all", "approved", "rejected"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs",
                filter === f
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent",
              )}
            >
              {f === "all" ? "Все" : statusLabels[f as ApplicationStatus]}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {filtered.length === 0 ? (
            <li className="text-sm text-muted-foreground">Нет заявок в этом фильтре</li>
          ) : (
            filtered.map((app) => (
              <li key={app.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(app.id)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-2.5 text-left transition-colors",
                    selected?.id === app.id
                      ? "border-solar-gold/40 bg-accent"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{app.mcNick}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[10px]",
                        statusColors[app.status],
                      )}
                    >
                      {statusLabels[app.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {app.discordUsername}
                    {app.ticketNumber ? ` · #${app.ticketNumber}` : ""}
                  </p>
                </button>
              </li>
            ))
          )}
        </ul>
      </ContentCard>

      <ContentCard>
        {!selected ? (
          <p className="text-sm text-muted-foreground">Выбери заявку слева</p>
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{selected.mcNick}</h2>
                <p className="text-sm text-muted-foreground">
                  {selected.discordUsername} · Discord ID {selected.discordId}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(selected.createdAt).toLocaleString("ru-RU")} ·{" "}
                  {selected.sourceChannel === "website" ? "С сайта" : "Discord"}
                </p>
                <a
                  href={`/applications/${selected.id}`}
                  className="mt-2 inline-block text-sm font-medium text-solar-gold hover:underline"
                >
                  Открыть переписку на сайте →
                </a>
              </div>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  statusColors[selected.status],
                )}
              >
                {statusLabels[selected.status]}
              </span>
            </div>

            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <Field label="Имя" value={selected.realName} />
              <Field label="Возраст" value={selected.age} />
              <Field label="Правила прочитал" value={selected.rulesRead} />
              <Field label="Идея проекта" value={selected.ideaKnown} />
              <Field label="Часы (будни)" value={selected.weekdayHours} />
              <Field label="Часы (выходные)" value={selected.weekendHours} />
              <Field label="Хобби" value={selected.hobby} className="sm:col-span-2" />
              <Field label="Откуда узнал" value={selected.source} className="sm:col-span-2" />
            </dl>

            {selected.rejectReason ? (
              <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
                Причина отказа: {selected.rejectReason}
              </p>
            ) : null}

            {selected.status === "pending" ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => review(selected.id, "approved")}
                  className="btn-primary bg-green-600 hover:opacity-90"
                >
                  Одобрить (+ Player в Discord)
                </button>
                <button
                  type="button"
                  onClick={() => review(selected.id, "rejected")}
                  className="btn-secondary border-red-500/40 text-red-400"
                >
                  Отказать
                </button>
              </div>
            ) : selected.status === "approved" ? (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch("/api/admin/pass", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        discordId: selected.discordId,
                        grant: false,
                        applicationId: selected.id,
                      }),
                    });
                    if (res.ok) {
                      setApps((prev) =>
                        prev.map((a) =>
                          a.id === selected.id ? { ...a, status: "rejected" as const } : a,
                        ),
                      );
                    }
                  }}
                  className="btn-secondary border-red-500/40 text-red-400"
                >
                  Забрать проходку (убрать Player)
                </button>
              </div>
            ) : (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch("/api/admin/pass", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        discordId: selected.discordId,
                        grant: true,
                        applicationId: selected.id,
                      }),
                    });
                    if (res.ok) {
                      setApps((prev) =>
                        prev.map((a) =>
                          a.id === selected.id ? { ...a, status: "approved" as const } : a,
                        ),
                      );
                    }
                  }}
                  className="btn-primary"
                >
                  Выдать проходку (+ Player)
                </button>
              </div>
            )}
          </>
        )}
      </ContentCard>
    </div>
  );
}

function Field({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg bg-muted/40 px-3 py-2", className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}

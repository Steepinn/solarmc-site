"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type AppItem = {
  id: string;
  ticketNumber?: number;
  mcNick: string;
  discordUsername: string;
  status: "pending" | "approved" | "rejected";
  sourceChannel: "discord" | "website";
  createdAt: string;
};

const statusLabels = {
  pending: { text: "На рассмотрении", className: "bg-amber-500/15 text-amber-300" },
  approved: { text: "Одобрено", className: "bg-green-500/15 text-green-400" },
  rejected: { text: "Отклонено", className: "bg-red-500/15 text-red-400" },
};

export function ApplicationFeed({ compact = false }: { compact?: boolean }) {
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setApps(d.applications ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Загрузка заявок...</p>;
  }

  if (apps.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center text-sm text-muted-foreground">
        Заявок пока нет. Будь первым — подай заявку на проходку.
      </p>
    );
  }

  const visible = compact ? apps.slice(0, 8) : apps;
  const items = !compact && visible.length >= 4 ? [...visible, ...visible] : visible;
  const scrollable = !compact && visible.length >= 4;

  return (
    <div
      className={cn(
        "relative",
        scrollable && "applications-feed max-h-[520px] overflow-hidden",
        compact && "max-h-[420px] overflow-y-auto",
      )}
    >
      <div className={cn("space-y-3", scrollable && "applications-feed__track")}>
        {items.map((app, i) => (
          <article
            key={`${app.id}-${i}`}
            className="rounded-xl border border-border/80 bg-card/80 p-4 backdrop-blur-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">
                  {app.mcNick}
                  {app.ticketNumber ? (
                    <span className="ms-2 text-xs font-normal text-muted-foreground">
                      #{app.ticketNumber}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {app.discordUsername} ·{" "}
                  {new Date(app.createdAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium",
                  statusLabels[app.status].className,
                )}
              >
                {statusLabels[app.status].text}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import type { ServerStatus } from "@/lib/types";

export function StatusPanel() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const load = () =>
      fetch("/api/status", { cache: "no-store" })
        .then((r) => {
          if (!r.ok) throw new Error("api_error");
          return r.json();
        })
        .then((data) => {
          if (!alive) return;
          setStatus(data);
          setError("");
        })
        .catch(() => {
          if (!alive) return;
          setError("Не удалось получить статус — проверь DISCORD_BOT_TOKEN и канал статуса");
        });

    load();
    const id = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);

  if (!status && !error) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="stat-card animate-pulse">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="mt-3 h-8 w-24 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !status) {
    return <p className="text-sm text-red-400">{error}</p>;
  }

  if (!status) return null;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Minecraft"
          value={status.online ? "Онлайн" : "Оффлайн"}
          hint={
            status.source === "discord"
              ? "Discord · SOLARDS"
              : status.source === "ping"
                ? "Ping сервера"
                : "SOLARDS"
          }
          ok={status.online}
        />
        <Stat
          label="Игроков"
          value={`${status.players.online} / ${status.players.max || "?"}`}
          hint={
            status.players.list?.length
              ? status.players.list.join(", ")
              : status.online
                ? "На сервере"
                : "Нет игроков"
          }
        />
        <Stat
          label="TPS"
          value={status.tps != null ? status.tps.toFixed(1) : "—"}
          hint="Paper / SOLARDS"
        />
        <Stat
          label="Версия"
          value={status.version?.slice(0, 24) ?? "—"}
          hint="Minecraft"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
  ok,
}: {
  label: string;
  value: string;
  hint?: string;
  ok?: boolean;
}) {
  return (
    <div className="stat-card">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${ok === false ? "text-red-400" : ok ? "text-green-400" : ""}`}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

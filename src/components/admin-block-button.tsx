"use client";

import { useState } from "react";
import { Ban, ShieldOff } from "lucide-react";

export function AdminBlockButton({
  discordId,
  initiallyBlocked,
  initialReason,
}: {
  discordId: string;
  initiallyBlocked: boolean;
  initialReason?: string | null;
}) {
  const [blocked, setBlocked] = useState(initiallyBlocked);
  const [reason, setReason] = useState(initialReason ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function toggle() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordId,
          action: blocked ? "unblock" : "block",
          reason: reason || "Нарушение правил",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error === "cannot_block_self" ? "Нельзя заблокировать себя" : "Ошибка");
        return;
      }
      setBlocked(Boolean(data.blocked));
      setMsg(data.blocked ? "Пользователь заблокирован" : "Блокировка снята");
    } catch {
      setMsg("Ошибка сети");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 space-y-2 border-t border-border pt-4 text-left">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Админ
      </p>
      {!blocked ? (
        <input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Причина блокировки"
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
        />
      ) : null}
      <button
        type="button"
        disabled={busy}
        onClick={toggle}
        className={
          blocked
            ? "btn-secondary inline-flex w-full items-center justify-center gap-2"
            : "inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
        }
      >
        {blocked ? (
          <>
            <ShieldOff className="size-4" />
            {busy ? "…" : "Разблокировать"}
          </>
        ) : (
          <>
            <Ban className="size-4" />
            {busy ? "…" : "Заблокировать"}
          </>
        )}
      </button>
      {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
    </div>
  );
}

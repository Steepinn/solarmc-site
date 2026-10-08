"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useSessionUser } from "@/hooks/use-session-user";
import { cn } from "@/lib/utils";

type Noti = {
  id: string;
  title: string;
  body: string;
  href: string;
  createdAt: string;
  read: boolean;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function NotificationsBell() {
  const { user, loading: sessionLoading } = useSessionUser();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Noti[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    if (!user) return;
    const res = await fetch("/api/notifications", { cache: "no-store" });
    if (!res.ok) return;
    const data = await res.json();
    setItems(data.notifications ?? []);
    setUnread(data.unread ?? 0);
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setUnread(0);
      return;
    }
    void load();
    const id = window.setInterval(load, 45000);
    return () => window.clearInterval(id);
  }, [user, load]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  async function markAllRead() {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    setUnread(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  async function openPanel() {
    const next = !open;
    setOpen(next);
    if (next) {
      await load();
      if (unread > 0) await markAllRead();
    }
  }

  if (sessionLoading || !user) return null;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Уведомления"
        aria-expanded={open}
        onClick={openPanel}
        className={cn(
          "pressable relative inline-flex size-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-accent",
          open && "bg-accent",
        )}
      >
        <Bell className="size-5" />
        {unread > 0 ? (
          <span className="absolute end-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-solar-gold px-1 text-[10px] font-bold text-black">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute end-0 top-[calc(100%+8px)] z-[60] w-[min(92vw,360px)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-display text-sm font-bold">Уведомления</p>
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={markAllRead}
            >
              Прочитать все
            </button>
          </div>
          <ul className="max-h-[min(60vh,420px)] overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted-foreground">
                Пока пусто
              </li>
            ) : (
              items.map((n) => (
                <li key={n.id} className="border-b border-border/60 last:border-0">
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block px-4 py-3 transition-colors hover:bg-accent/60",
                      !n.read && "bg-solar-gold/5",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold leading-snug">{n.title}</p>
                      {!n.read ? (
                        <span className="mt-1 size-2 shrink-0 rounded-full bg-solar-gold" />
                      ) : null}
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {n.body}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {formatWhen(n.createdAt)}
                    </p>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

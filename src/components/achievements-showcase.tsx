"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { PlayerAdvancement } from "@/lib/minecraft-advancements";
import { ADVANCEMENT_ICON_FALLBACK } from "@/lib/advancement-meta";
import { cn } from "@/lib/utils";

type Props = {
  total: number;
  byCategory: Record<string, number>;
  items: PlayerAdvancement[];
  source: "server" | "empty" | "unavailable";
  compact?: boolean;
};

export function AchievementsShowcase({
  total,
  byCategory,
  items,
  source,
  compact,
}: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<PlayerAdvancement | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const categories = useMemo(
    () => Object.keys(byCategory).sort((a, b) => a.localeCompare(b, "ru")),
    [byCategory],
  );

  const preview = items.slice(0, compact ? 12 : 24);
  const filtered =
    filter === "all" ? items : items.filter((a) => a.category === filter);

  function close() {
    setSelected(null);
    setOpen(false);
  }

  const modal =
    open && mounted
      ? createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-3 sm:items-center"
            role="dialog"
            aria-modal
            aria-label="Достижения"
            onClick={close}
          >
            <div
              className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                <div>
                  <h2 className="font-display text-xl font-bold">Коллекция</h2>
                  <p className="text-sm text-muted-foreground">
                    {total} достижений
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={close}
                  aria-label="Закрыть"
                >
                  <X className="size-5" />
                </button>
              </div>

              {categories.length > 1 ? (
                <div className="flex flex-wrap justify-center gap-1.5 border-b border-border px-3 py-2.5">
                  <FilterChip
                    active={filter === "all"}
                    onClick={() => setFilter("all")}
                    label={`Все (${total})`}
                  />
                  {categories.map((c) => (
                    <FilterChip
                      key={c}
                      active={filter === c}
                      onClick={() => setFilter(c)}
                      label={`${c} (${byCategory[c]})`}
                    />
                  ))}
                </div>
              ) : null}

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                {filtered.length === 0 ? (
                  <p className="p-6 text-center text-sm text-muted-foreground">
                    Нет достижений в этой категории
                  </p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
                    {filtered.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        title={a.title}
                        onClick={() => setSelected(a)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 rounded-xl border border-transparent bg-muted/30 p-2 transition-colors hover:border-solar-gold/40 hover:bg-muted/50",
                          selected?.id === a.id &&
                            "border-solar-gold/50 bg-solar-yellow/10",
                        )}
                      >
                        <AdvIcon src={a.iconUrl} size={36} />
                        <span className="line-clamp-2 w-full text-center text-[10px] leading-tight text-muted-foreground">
                          {a.title}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selected ? (
                <div className="border-t border-border bg-muted/20 px-4 py-3">
                  <p className="font-semibold">{selected.title}</p>
                  {selected.description ? (
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {selected.description}
                    </p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {selected.category}
                    {selected.doneAt
                      ? ` · ${new Date(selected.doneAt).toLocaleString("ru-RU")}`
                      : null}
                  </p>
                </div>
              ) : null}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-2xl border border-border bg-card/50 p-4 text-left transition-colors hover:border-solar-gold/40 hover:bg-card"
      >
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-gold">
              Достижения
            </p>
            <p className="mt-1 font-display text-3xl font-bold tabular-nums">
              {total}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {source === "unavailable"
                ? "Сервер не подключён к сайту"
                : source === "empty"
                  ? "Пока пусто — зайди на сервер"
                  : "Нажми, чтобы открыть коллекцию"}
            </p>
          </div>
          {categories.length ? (
            <div className="hidden text-right text-xs text-muted-foreground sm:block">
              {categories.slice(0, 3).map((c) => (
                <p key={c}>
                  {c}: {byCategory[c]}
                </p>
              ))}
            </div>
          ) : null}
        </div>

        {preview.length ? (
          <div className="mt-4 grid grid-cols-6 gap-1.5 sm:grid-cols-8 md:grid-cols-12">
            {preview.map((a) => (
              <span
                key={a.id}
                title={a.title}
                className="flex aspect-square items-center justify-center rounded-lg bg-muted/40 ring-1 ring-border"
              >
                <AdvIcon src={a.iconUrl} size={28} />
              </span>
            ))}
          </div>
        ) : null}
      </button>

      {modal}
    </>
  );
}

function AdvIcon({ src, size }: { src: string; size: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className="shrink-0"
      style={{ width: size, height: size, imageRendering: "pixelated" }}
      loading="lazy"
      onError={(e) => {
        const img = e.currentTarget;
        if (img.dataset.fallback === "1") return;
        img.dataset.fallback = "1";
        img.src = ADVANCEMENT_ICON_FALLBACK;
      }}
    />
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "bg-solar-gold text-black"
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

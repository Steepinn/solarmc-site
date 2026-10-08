"use client";

import { Search, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { searchItems } from "@/config/site";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchItems;
    return searchItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.group.toLowerCase().includes(q),
    );
  }, [query]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setOpen((v) => !v);
    }
    if (e.key === "Escape") setOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <button
        type="button"
        data-search-full
        onClick={() => setOpen(true)}
        className="hidden h-10 max-w-[240px] flex-1 items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 text-sm text-muted-foreground transition-colors hover:bg-accent lg:flex"
      >
        <Search className="size-4 shrink-0" />
        <span className="flex-1 text-left">Поиск</span>
        <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        aria-label="Поиск"
        onClick={() => setOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent lg:hidden"
      >
        <Search className="size-4" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[15vh] backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="size-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Поиск по сайту..."
                className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                  Ничего не найдено
                </li>
              ) : (
                filtered.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                    >
                      <span>{item.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.group}
                      </span>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
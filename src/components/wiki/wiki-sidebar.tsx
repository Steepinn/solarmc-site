"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { WikiNavSection } from "@/lib/wiki";
import { cn } from "@/lib/utils";

type NavItem = { title: string; href: string };
type TreeItem = NavItem & { children: TreeItem[] };

function buildTree(items: NavItem[]): TreeItem[] {
  const sorted = [...items].sort((a, b) => a.href.length - b.href.length);
  const byHref = new Map<string, TreeItem>();
  const roots: TreeItem[] = [];

  for (const item of sorted) {
    const node: TreeItem = { ...item, children: [] };
    byHref.set(item.href, node);

    const parentHref = [...byHref.keys()]
      .filter((h) => h !== item.href && item.href.startsWith(`${h}/`))
      .sort((a, b) => b.length - a.length)[0];

    if (parentHref) {
      byHref.get(parentHref)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

function isPathUnder(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function treeHasActive(item: TreeItem, pathname: string): boolean {
  if (isPathUnder(pathname, item.href)) return true;
  return item.children.some((c) => treeHasActive(c, pathname));
}

function sectionHasActive(section: WikiNavSection, pathname: string) {
  return section.items.some((item) => isPathUnder(pathname, item.href));
}

function WikiTreeItem({
  item,
  pathname,
  depth = 0,
}: {
  item: TreeItem;
  pathname: string;
  depth?: number;
}) {
  const active = pathname === item.href;
  const childActive = item.children.some((c) => treeHasActive(c, pathname));
  const [open, setOpen] = useState(active || childActive);

  useEffect(() => {
    if (active || childActive) setOpen(true);
  }, [active, childActive]);

  return (
    <li>
      <div className="flex items-center gap-0.5">
        <Link
          href={item.href}
          className={cn(
            "wiki-nav-link min-w-0 flex-1 rounded-xl px-2.5 py-2 text-[0.875rem] leading-snug outline-none",
            depth > 0 && "text-[0.8125rem]",
            active
              ? "wiki-nav-link--active bg-accent font-semibold text-foreground neon-glow"
              : "text-muted-foreground hover:bg-accent/70 hover:text-foreground",
          )}
        >
          {item.title}
        </Link>
        {item.children.length > 0 && (
          <button
            type="button"
            aria-label={open ? "Свернуть" : "Развернуть"}
            className="wiki-nav-btn inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none hover:bg-accent hover:text-foreground"
            onClick={() => setOpen((v) => !v)}
          >
            <ChevronDown
              className={cn(
                "size-3.5 transition-transform duration-100",
                open && "rotate-180",
              )}
            />
          </button>
        )}
      </div>
      {item.children.length > 0 && open && (
        <ul className="ml-2.5 mt-0.5 space-y-0.5 border-l border-solar-gold/25 pl-2">
          {item.children.map((child) => (
            <WikiTreeItem
              key={child.href}
              item={child}
              pathname={pathname}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function WikiSection({
  section,
  pathname,
  open,
  onToggle,
}: {
  section: WikiNavSection;
  pathname: string;
  open: boolean;
  onToggle: () => void;
}) {
  const tree = useMemo(() => buildTree(section.items), [section.items]);

  return (
    <div className="border-b border-border/40 last:border-b-0">
      <button
        type="button"
        className="wiki-nav-btn flex w-full items-center justify-between gap-2 px-2.5 py-2.5 text-left outline-none"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="font-display text-[0.75rem] font-semibold uppercase tracking-wide text-solar-gold">
          {section.title}
        </span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 text-solar-gold/80 transition-transform duration-100",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div className="px-1.5 pb-2">
          <ul className="space-y-0.5">
            {tree.map((item) => (
              <WikiTreeItem key={item.href} item={item} pathname={pathname} />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function WikiNavPanel({
  navigation,
  pathname,
}: {
  navigation: WikiNavSection[];
  pathname: string;
}) {
  const activeTitle =
    navigation.find((s) => sectionHasActive(s, pathname))?.title ?? null;

  const [openTitle, setOpenTitle] = useState<string | null>(
    () => activeTitle ?? navigation[0]?.title ?? null,
  );

  useEffect(() => {
    if (activeTitle) setOpenTitle(activeTitle);
  }, [pathname, activeTitle]);

  return (
    <nav className="wiki-nav-panel flex min-h-0 flex-1 flex-col">
      <div className="shrink-0 border-b border-border pb-3">
        <p className="font-display text-sm font-bold tracking-wide neon-text">
          Вики Solar
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">Разделы и гайды</p>
      </div>
      <div
        className="wiki-nav-scroll min-h-0 flex-1 overflow-y-auto overscroll-contain pt-2"
        onWheel={(e) => e.stopPropagation()}
      >
        {navigation.map((section) => (
          <WikiSection
            key={section.title}
            section={section}
            pathname={pathname}
            open={openTitle === section.title}
            onToggle={() =>
              setOpenTitle((prev) =>
                prev === section.title ? null : section.title,
              )
            }
          />
        ))}
      </div>
    </nav>
  );
}

export function WikiSidebar({
  navigation,
  pathname,
}: {
  navigation: WikiNavSection[];
  pathname: string;
}) {
  return (
    <aside className="wiki-sidebar hidden w-[300px] shrink-0 self-start px-3 py-6 lg:sticky lg:top-[calc(var(--site-shell-offset)+0.75rem)] lg:block lg:h-[calc(100dvh-var(--site-shell-offset)-1.5rem)] lg:px-4 lg:py-8">
      <div className="wiki-sidebar__card flex h-full max-h-full flex-col overflow-hidden rounded-[1.25rem] border border-border bg-card p-4 shadow-[var(--neon-glow)] sm:p-5">
        <WikiNavPanel navigation={navigation} pathname={pathname} />
      </div>
    </aside>
  );
}

export function WikiMobileNav({
  navigation,
  pathname,
}: {
  navigation: WikiNavSection[];
  pathname: string;
}) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const activeTitle =
    navigation.flatMap((s) => s.items).find((i) => i.href === pathname)?.title ??
    "Вики";

  useEffect(() => {
    setOpen(false);
    setClosing(false);
  }, [pathname]);

  const toggle = () => {
    if (open) {
      setClosing(true);
      window.setTimeout(() => {
        setOpen(false);
        setClosing(false);
      }, 70);
    } else {
      setOpen(true);
    }
  };

  return (
    <div className="border-b border-border lg:hidden">
      <button
        type="button"
        className="wiki-nav-btn flex w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none"
        onClick={toggle}
        aria-expanded={open}
      >
        <div>
          <p className="font-display text-[0.7rem] font-semibold uppercase tracking-wide text-solar-gold">
            Содержание
          </p>
          <p className="mt-0.5 text-sm font-semibold">{activeTitle}</p>
        </div>
        <ChevronDown
          className={cn(
            "size-4 text-muted-foreground transition-transform duration-200",
            open && !closing && "rotate-180",
          )}
        />
      </button>
      {open && (
        <div
          className={cn(
            "max-h-[min(70vh,560px)] overflow-y-auto border-t border-border bg-card px-1",
            closing ? "wiki-mobile-panel--out" : "wiki-mobile-panel--in",
          )}
        >
          <WikiNavPanel navigation={navigation} pathname={pathname} />
        </div>
      )}
    </div>
  );
}

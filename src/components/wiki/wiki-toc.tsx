"use client";

import { useEffect, useState } from "react";
import type { WikiHeading } from "@/lib/wiki";
import { cn } from "@/lib/utils";

export function WikiTableOfContents({ headings }: { headings: WikiHeading[] }) {
  const [activeId, setActiveId] = useState("");
  useEffect(() => {
    const nodes = headings.map(h => document.getElementById(h.id)).filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActiveId(visible[0].target.id);
    }, { rootMargin: "-100px 0px -60% 0px" });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, [headings]);
  if (headings.length === 0) return null;

  function scrollToHeading(id: string) {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <aside className="wiki-toc hidden w-[220px] shrink-0 xl:block">
      <nav className="wiki-toc-nav sticky top-[var(--site-shell-offset)] px-4 py-8">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          На этой странице
        </p>
        <ul className="space-y-2 border-l border-border">
          {headings.map((heading, index) => (
            <li key={`${heading.id}-${index}`}>
              <a
                href={`#${heading.id}`}
                aria-current={activeId === heading.id ? "true" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToHeading(heading.id);
                }}
                className={cn(
                  "wiki-toc-link block border-l border-transparent py-0.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  heading.level === 3 && "pl-6",
                  heading.level === 2 && "pl-3",
                  "hover:border-solar-gold",
                )}
              >
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

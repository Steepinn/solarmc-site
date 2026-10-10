"use client";

import { Download, Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { mainNav } from "@/config/site";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";
import { SoundToggle } from "./sound-toggle";
import { NotificationsBell } from "./notifications-bell";
import { UserMenu } from "./user-menu";

type MenuPhase = "closed" | "open" | "closing";

export function SiteHeader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<MenuPhase>("closed");
  const menuOpen = phase === "open" || phase === "closing";

  const closeMenu = () => {
    if (phase !== "open") return;
    setPhase("closing");
    window.setTimeout(() => setPhase("closed"), 60);
  };

  const toggleMenu = () => {
    if (phase === "open") closeMenu();
    else if (phase === "closed") setPhase("open");
  };

  useEffect(() => {
    setPhase("closed");
  }, [pathname]);

  useEffect(() => {
    document.documentElement.classList.toggle("menu-open", phase === "open");
    return () => document.documentElement.classList.remove("menu-open");
  }, [phase]);

  useEffect(() => {
    if (phase !== "open") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/docs")) return pathname.startsWith("/docs");
    return pathname.startsWith(href);
  };

  return (
    <header
      id="nd-nav"
      className="relative sticky top-0 z-50 border-b border-border bg-card"
    >
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2 px-3 sm:h-20 sm:gap-3 sm:px-4">
        <button
          type="button"
          aria-label={phase === "open" ? "Закрыть меню" : "Открыть меню"}
          aria-expanded={phase === "open"}
          className={cn(
            "pressable inline-flex size-11 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-accent",
            phase === "open" && "bg-accent neon-glow",
          )}
          onClick={toggleMenu}
        >
          {phase === "open" ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link href="/" className="inline-flex shrink-0 items-center" aria-label="SolarMC">
          <Image
            src="/brand-face.png"
            alt="SolarMC"
            width={40}
            height={40}
            className="brand-face size-10"
            priority
          />
        </Link>

        <Link
          href="/launcher"
          className={cn(
            "pressable inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent",
            pathname.startsWith("/launcher") && "bg-accent text-solar-gold neon-glow",
          )}
          aria-label="Скачать лаунчер"
        >
          <Download className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Лаунчер</span>
        </Link>

        <div className="ms-auto flex items-center gap-1">
          <NotificationsBell />
          <SoundToggle />
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {menuOpen && (
        <>
          <button
            type="button"
            className={cn(
              "site-menu-backdrop",
              phase === "closing" && "site-menu-backdrop--out",
            )}
            aria-label="Закрыть меню"
            onClick={closeMenu}
          />
          <nav
            className={cn(
              "site-menu-panel",
              phase === "closing" ? "site-menu-panel--out" : "site-menu-panel--in",
            )}
            aria-label="Навигация"
          >
            <div className="site-menu-panel__inner">
              <div className="mb-5 flex items-center gap-3 px-1 sm:mb-7">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-solar-gold/60 to-transparent" />
                <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-solar-gold">
                  Меню
                </p>
                <span className="h-px flex-1 bg-gradient-to-r from-transparent via-solar-gold/60 to-transparent" />
              </div>
              <ul className="site-menu-grid">
                {mainNav.map((item, i) => (
                  <li
                    key={item.href}
                    className="site-menu-item"
                    style={{ animationDelay: `${30 + i * 20}ms` }}
                  >
                    <Link
                      href={item.href}
                      prefetch
                      onClick={closeMenu}
                      className={cn(
                        "site-menu-link",
                        isActive(item.href) && "site-menu-link--active",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}

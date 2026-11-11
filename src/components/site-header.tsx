"use client";

import { Download } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SiteMenu } from "./site-menu";
import { cn } from "@/lib/utils";
import { SoundToggle } from "./sound-toggle";
import { NotificationsBell } from "./notifications-bell";
import { UserMenu } from "./user-menu";

export function SiteHeader() {
  const pathname = usePathname();
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
        <SiteMenu />

        <Link href="/" className="inline-flex shrink-0 items-center" aria-label="SolarMC">
          <Image
            src="/logo.png"
            alt="SolarMC"
            width={661}
            height={168}
            className="solar-shared-logo"
            priority
          />

        </Link>

        <Link
          href="/launcher"
          className={cn(
            "solar-header-launcher pressable inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors hover:bg-accent",
            pathname.startsWith("/launcher") && "bg-accent text-solar-gold neon-glow",
          )}
          aria-label="Скачать лаунчер"
        >
          <Download className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">Лаунчер</span>
        </Link>

        <nav className="solar-desktop-nav" aria-label="Основные разделы">
          {[{ href: "/docs/informaciya/home", label: "Вики" }, { href: "/map", label: "Карта" }, { href: "/cities", label: "Города" }, { href: "/applications", label: "Заявки" }, { href: "/shop", label: "Магазин" }, { href: "/status", label: "Статус" }].map(item => <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>{item.label}</Link>)}
        </nav>
        <div className="ms-auto flex items-center gap-1">
          <NotificationsBell />
          <SoundToggle />
          <UserMenu />
        </div>
      </div>

    </header>
  );
}

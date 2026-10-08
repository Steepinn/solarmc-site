"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  ClipboardList,
  LifeBuoy,
  LogOut,
  Shield,
  User,
} from "lucide-react";
import { useSessionUser } from "@/hooks/use-session-user";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, loading } = useSessionUser();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (loading) {
    return <div className="size-11 shrink-0 rounded-xl bg-muted/40 animate-pulse" aria-hidden />;
  }

  if (!user) {
    return (
      <Link href="/api/auth/discord" className="btn-discord">
        <DiscordIcon />
        <span className="hidden sm:inline">Войти</span>
      </Link>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card/80 px-2.5 py-1.5 transition-colors hover:bg-accent"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Image
          src={user.avatar}
          alt=""
          width={32}
          height={32}
          className="rounded-lg ring-1 ring-solar-gold/30"
        />
        <span className="hidden max-w-[120px] truncate text-sm font-medium md:inline">
          {user.mcNick ?? user.username}
        </span>
        <ChevronDown className={cn("size-4 opacity-60 transition-transform", open && "rotate-180")} />
      </button>

      {open ? (
        <div className="absolute end-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-border bg-card p-2 shadow-2xl">
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate font-semibold">{user.username}</p>
            {user.mcNick ? (
              <p className="text-xs text-solar-gold">MC: {user.mcNick}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Привяжи /dslink в игре</p>
            )}
          </div>

          <nav className="py-1">
            <UserProfileLinks user={user} onNavigate={() => setOpen(false)} />
          </nav>

          <form action="/api/auth/logout" method="POST" className="border-t border-border pt-1">
            <button type="submit" className="menu-item w-full text-red-400">
              <LogOut className="size-4" />
              Выйти
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

export function UserProfileLinks({
  user,
  onNavigate,
}: {
  user: NonNullable<ReturnType<typeof useSessionUser>["user"]>;
  onNavigate?: () => void;
}) {
  return (
    <>
      <MenuLink
        href={`/u/${encodeURIComponent(user.mcNick?.trim() || user.username || user.discordId)}`}
        icon={<User className="size-4" />}
        onClick={onNavigate}
      >
        Профиль
      </MenuLink>
      <MenuLink
        href="/applications"
        icon={<ClipboardList className="size-4" />}
        onClick={onNavigate}
      >
        Заявки на проходку
      </MenuLink>
      <MenuLink href="/support" icon={<LifeBuoy className="size-4" />} onClick={onNavigate}>
        Техподдержка
      </MenuLink>
      {user.isAdmin ? (
        <MenuLink href="/admin" icon={<Shield className="size-4" />} onClick={onNavigate}>
          Админ-панель
        </MenuLink>
      ) : null}
    </>
  );
}

function MenuLink({
  href,
  children,
  icon,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="menu-item">
      {icon}
      {children}
    </Link>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { Application, SupportTicket } from "@/lib/types";
import { AdminApplications } from "@/components/admin-applications";
import { AdminSupportTickets } from "@/components/admin-support-tickets";
import { RoleAssignPanel } from "@/components/role-assign-panel";
import { ContentCard } from "@/components/page-shell";
import { cn } from "@/lib/utils";

type Tab =
  | "overview"
  | "applications"
  | "support"
  | "server"
  | "players"
  | "users"
  | "achievements"
  | "roles"
  | "tools";

type Overview = {
  maintenance: boolean;
  linkedAccounts: number | null;
  pendingLinkCodes: number | null;
  onlinePlayers: string[];
  status: {
    online: boolean;
    players: { online: number; max: number };
    tps?: number;
  };
};

type SiteStats = {
  apps: { total: number; pending: number; approved: number; rejected: number };
  support: { total: number; open: number; closed: number };
  siteUsers: number;
  cities: number;
  directoryUsers?: number;
  mc: {
    configured: boolean;
    advancementsFiles: number;
    usercachePlayers: number;
  };
};

type SiteUserRow = {
  discordId: string | null;
  username: string;
  mcNick?: string;
  avatar?: string;
  lastSeenAt?: string;
  profileHref: string;
  sources: ("site" | "application" | "dslink" | "usercache")[];
};

type McPlayerRow = {
  nick: string;
  uuid: string;
  achievements: number;
  profileHref: string;
};

export function AdminDashboard({
  initialApps,
  initialSupport,
}: {
  initialApps: Application[];
  initialSupport: SupportTicket[];
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [users, setUsers] = useState<SiteUserRow[] | null>(null);
  const [usersTotal, setUsersTotal] = useState(0);
  const [meId, setMeId] = useState<string | null>(null);
  const [mcPlayers, setMcPlayers] = useState<McPlayerRow[] | null>(null);
  const [userQ, setUserQ] = useState("");
  const [advQ, setAdvQ] = useState("");

  const pending = initialApps.filter((a) => a.status === "pending").length;
  const openSupport = initialSupport.filter((t) => t.status !== "closed").length;

  useEffect(() => {
    if (tab === "overview" || tab === "tools" || tab === "server") {
      fetch("/api/admin/stats?view=stats", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          if (d.stats) setStats(d.stats);
          if (d.me) setMeId(d.me);
        })
        .catch(() => null);
    }
    if (tab === "server" || tab === "players" || tab === "overview") {
      fetch("/api/admin/server", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => !d.error && setOverview(d))
        .catch(() => null);
    }
    if (tab === "achievements") {
      fetch("/api/admin/stats?view=achievements", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => setMcPlayers(d.players ?? []))
        .catch(() => setMcPlayers([]));
    }
  }, [tab]);

  useEffect(() => {
    if (tab !== "users") return;
    const t = setTimeout(() => {
      const qs = userQ.trim() ? `&q=${encodeURIComponent(userQ.trim())}` : "";
      fetch(`/api/admin/stats?view=users${qs}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setUsers(d.users ?? []);
          setUsersTotal(d.total ?? d.users?.length ?? 0);
          if (d.me) setMeId(d.me);
        })
        .catch(() => setUsers([]));
    }, 180);
    return () => clearTimeout(t);
  }, [tab, userQ]);

  const filteredUsers = users ?? [];

  const filteredMc = useMemo(() => {
    if (!mcPlayers) return [];
    const q = advQ.trim().toLowerCase();
    if (!q) return mcPlayers;
    return mcPlayers.filter(
      (p) => p.nick.toLowerCase().includes(q) || p.uuid.toLowerCase().includes(q),
    );
  }, [mcPlayers, advQ]);

  const tabs: { id: Tab; label: string; badge?: number }[] = [
    { id: "overview", label: "Обзор" },
    { id: "applications", label: "Заявки", badge: pending || undefined },
    { id: "support", label: "Тикеты", badge: openSupport || undefined },
    { id: "server", label: "Сервер" },
    { id: "players", label: "Онлайн" },
    { id: "users", label: "Пользователи" },
    { id: "achievements", label: "Ачивки" },
    { id: "roles", label: "Роли" },
    { id: "tools", label: "Инструменты" },
  ];

  return (
    <div className="space-y-4">
      <div className="panel-surface flex flex-wrap gap-2 rounded-2xl p-3 sm:p-3.5">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn("tab-btn", tab === t.id && "tab-btn-active")}
          >
            {t.label}
            {t.badge ? (
              <span className="ms-1.5 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                {t.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <OverviewPanel
          stats={stats}
          overview={overview}
          pending={pending}
          openSupport={openSupport}
          onGo={setTab}
        />
      ) : null}

      {tab === "applications" ? <AdminApplications initialApps={initialApps} /> : null}

      {tab === "support" ? (
        <AdminSupportTickets initialTickets={initialSupport} />
      ) : null}

      {tab === "server" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Metric label="Статус" value={overview?.status.online ? "Онлайн" : "Оффлайн"} />
          <Metric
            label="Игроков"
            value={
              overview
                ? `${overview.status.players.online}/${overview.status.players.max}`
                : "—"
            }
          />
          <Metric label="TPS" value={overview?.status.tps?.toFixed(1) ?? "—"} />
          <Metric
            label="Техработы"
            value={overview?.maintenance ? "Включены" : "Выключены"}
            warn={overview?.maintenance}
          />
          <Metric label="Привязок /dslink" value={fmt(overview?.linkedAccounts)} />
          <Metric label="Кодов /dslink" value={fmt(overview?.pendingLinkCodes)} />
          <Metric
            label="MC-папка сайта"
            value={stats?.mc.configured ? "Подключена" : "Нет пути"}
            warn={stats ? !stats.mc.configured : undefined}
          />
          <Metric
            label="Файлов ачивок"
            value={stats ? String(stats.mc.advancementsFiles) : "—"}
          />
        </div>
      ) : null}

      {tab === "players" ? (
        <ContentCard>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h3 className="text-lg font-semibold">Игроки на сервере</h3>
              <p className="text-sm text-muted-foreground">
                Клик по нику открывает публичный профиль
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {overview
                ? `${overview.onlinePlayers.length} онлайн`
                : "Загрузка..."}
            </p>
          </div>
          {!overview ? (
            <p className="mt-2 text-sm text-muted-foreground">Загрузка...</p>
          ) : overview.onlinePlayers.length === 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">Никого нет онлайн</p>
          ) : (
            <ul className="mt-4 grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {overview.onlinePlayers.map((p) => (
                <li key={p}>
                  <Link
                    href={`/u/${encodeURIComponent(p)}`}
                    className="block rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm font-medium transition-colors hover:border-solar-gold/40 hover:text-solar-gold"
                  >
                    {p}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </ContentCard>
      ) : null}

      {tab === "users" ? (
        <ContentCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Все игроки</h3>
              <p className="text-sm text-muted-foreground">
                Сайт + заявки + /dslink + usercache · показано{" "}
                {filteredUsers.length}
                {usersTotal ? ` из ${usersTotal}` : null}
              </p>
            </div>
            <input
              value={userQ}
              onChange={(e) => setUserQ(e.target.value)}
              placeholder="Поиск: Steepy3, steepin, discord id…"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>
          {!users ? (
            <p className="mt-4 text-sm text-muted-foreground">Загрузка...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Никого не найдено</p>
          ) : (
            <ul className="mt-4 divide-y divide-border">
              {filteredUsers.map((u) => {
                const isMe = Boolean(meId && u.discordId === meId);
                return (
                  <li
                    key={`${u.discordId ?? "mc"}-${u.mcNick ?? u.username}`}
                    className={cn(
                      "flex items-center gap-3 py-3 first:pt-0",
                      isMe && "rounded-xl bg-solar-gold/10 px-2",
                    )}
                  >
                    {u.avatar ? (
                      <Image
                        src={u.avatar}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded-lg"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-xs font-bold">
                        {(u.mcNick?.[0] ?? u.username[0] ?? "?").toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={u.profileHref}
                          className="font-medium hover:text-solar-gold"
                        >
                          {u.mcNick ?? u.username}
                        </Link>
                        {isMe ? (
                          <span className="rounded-full bg-solar-gold/20 px-2 py-0.5 text-[10px] font-semibold text-solar-gold">
                            ты
                          </span>
                        ) : null}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {u.mcNick && u.username !== u.mcNick ? `${u.username} · ` : null}
                        {u.discordId ?? "без Discord"}
                        {u.lastSeenAt
                          ? ` · ${new Date(u.lastSeenAt).toLocaleString("ru-RU")}`
                          : null}
                      </p>
                      <p className="mt-0.5 flex flex-wrap gap-1">
                        {u.sources.map((s) => (
                          <span
                            key={s}
                            className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </p>
                    </div>
                    <Link
                      href={u.profileHref}
                      className="shrink-0 text-xs text-solar-gold hover:underline"
                    >
                      Профиль
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </ContentCard>
      ) : null}

      {tab === "achievements" ? (
        <ContentCard>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Ачивки игроков</h3>
              <p className="text-sm text-muted-foreground">
                Из usercache + world/advancements · без рецептов
              </p>
            </div>
            <input
              value={advQ}
              onChange={(e) => setAdvQ(e.target.value)}
              placeholder="Поиск ника…"
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm sm:max-w-xs"
            />
          </div>
          {!mcPlayers ? (
            <p className="mt-4 text-sm text-muted-foreground">Загрузка...</p>
          ) : filteredMc.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Нет данных — проверь MINECRAFT_SERVER_PATH
            </p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead className="text-xs text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="py-2 pr-3 font-medium">#</th>
                    <th className="py-2 pr-3 font-medium">Ник</th>
                    <th className="py-2 pr-3 font-medium">Ачивок</th>
                    <th className="py-2 font-medium">Профиль</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMc.map((p, i) => (
                    <tr key={p.uuid} className="border-b border-border/60">
                      <td className="py-2.5 pr-3 text-muted-foreground">{i + 1}</td>
                      <td className="py-2.5 pr-3 font-medium">{p.nick}</td>
                      <td className="py-2.5 pr-3 tabular-nums">{p.achievements}</td>
                      <td className="py-2.5">
                        <Link
                          href={p.profileHref}
                          className="text-solar-gold hover:underline"
                        >
                          Открыть
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ContentCard>
      ) : null}

      {tab === "roles" ? (
        <ContentCard>
          <h3 className="text-lg font-semibold">Роли на сайте → Discord</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Выбери игрока (логин на сайте или заявка) и назначь роль проекта.
          </p>
          <div className="mt-4">
            <RoleAssignPanel />
          </div>
        </ContentCard>
      ) : null}

      {tab === "tools" ? <ToolsPanel /> : null}
    </div>
  );
}

function OverviewPanel({
  stats,
  overview,
  pending,
  openSupport,
  onGo,
}: {
  stats: SiteStats | null;
  overview: Overview | null;
  pending: number;
  openSupport: number;
  onGo: (t: Tab) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          label="Заявки в очереди"
          value={String(pending)}
          warn={pending > 0}
          action={() => onGo("applications")}
        />
        <Metric
          label="Открытые тикеты"
          value={String(openSupport)}
          warn={openSupport > 0}
          action={() => onGo("support")}
        />
        <Metric
          label="Пользователи (каталог)"
          value={stats ? String(stats.directoryUsers ?? stats.siteUsers) : "—"}
          action={() => onGo("users")}
        />
        <Metric
          label="Онлайн сейчас"
          value={
            overview
              ? `${overview.status.players.online}/${overview.status.players.max}`
              : "—"
          }
          action={() => onGo("players")}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Города" value={stats ? String(stats.cities) : "—"} />
        <Metric
          label="Одобрено заявок"
          value={stats ? String(stats.apps.approved) : "—"}
        />
        <Metric
          label="Файлов ачивок"
          value={stats ? String(stats.mc.advancementsFiles) : "—"}
          action={() => onGo("achievements")}
        />
        <Metric
          label="MC sync"
          value={stats?.mc.configured ? "OK" : "Нет пути"}
          warn={stats ? !stats.mc.configured : undefined}
        />
      </div>

      <ContentCard>
        <h3 className="font-semibold">Быстрые действия</h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/admin/wiki", label: "Редактор вики" },
            { href: "/cities", label: "Города" },
            { href: "/applications", label: "Лента заявок" },
            { href: "/map", label: "Карта" },
            { href: "/status", label: "Статус публичный" },
            { href: "/shop", label: "Магазин" },
            { href: "/terms", label: "Соглашение" },
            { href: "/feed", label: "Лента" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="menu-item justify-center">
              {l.label}
            </Link>
          ))}
        </div>
      </ContentCard>
    </div>
  );
}

function ToolsPanel() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [href, setHref] = useState("/");
  const [audience, setAudience] = useState<"all" | "staff">("all");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function sendBroadcast() {
    setBusy(true);
    setOk(null);
    setErr(null);
    try {
      const r = await fetch("/api/admin/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast",
          title,
          message,
          href,
          audience,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "fail");
      setOk("Уведомление отправлено");
      setTitle("");
      setMessage("");
    } catch {
      setErr("Не удалось отправить");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ContentCard>
        <h3 className="text-lg font-semibold">Рассылка уведомлений</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Появится в колокольчике у всех (или только staff).
        </p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            Кому
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value as "all" | "staff")}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
            >
              <option value="all">Всем на сайте</option>
              <option value="staff">Только staff</option>
            </select>
          </label>
          <label className="block text-sm">
            Заголовок
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
              placeholder="Техработы в 20:00"
            />
          </label>
          <label className="block text-sm">
            Текст
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
              placeholder="Сервер будет недоступен 30 минут…"
            />
          </label>
          <label className="block text-sm">
            Ссылка
            <input
              value={href}
              onChange={(e) => setHref(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
              placeholder="/status"
            />
          </label>
          <button
            type="button"
            disabled={busy || !title.trim() || !message.trim()}
            onClick={sendBroadcast}
            className="btn-primary disabled:opacity-50"
          >
            {busy ? "Отправка…" : "Отправить"}
          </button>
          {ok ? <p className="text-sm text-green-400">{ok}</p> : null}
          {err ? <p className="text-sm text-red-400">{err}</p> : null}
        </div>
      </ContentCard>

      <ContentCard>
        <h3 className="text-lg font-semibold">Полезные ссылки</h3>
        <ul className="mt-3 space-y-2 text-sm">
          <li>
            <Link href="/admin/wiki" className="text-solar-gold hover:underline">
              Редактор вики
            </Link>
          </li>
          <li>
            <Link href="/cities" className="text-solar-gold hover:underline">
              Управление городами
            </Link>
          </li>
          <li>
            <Link href="/terms" className="text-solar-gold hover:underline">
              Пользовательское соглашение
            </Link>
          </li>
          <li>
            <Link href="/cookies" className="text-solar-gold hover:underline">
              Cookies
            </Link>
          </li>
          <li className="text-muted-foreground">
            Env: <code className="text-xs">MINECRAFT_SERVER_PATH</code> — ачивки и
            usercache
          </li>
        </ul>
      </ContentCard>
    </div>
  );
}

function fmt(v: number | null | undefined) {
  return v == null ? "—" : String(v);
}

function Metric({
  label,
  value,
  warn,
  action,
}: {
  label: string;
  value: string;
  warn?: boolean;
  action?: () => void;
}) {
  const inner = (
    <>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-2xl font-bold", warn && "text-amber-300")}>{value}</p>
    </>
  );

  if (action) {
    return (
      <button
        type="button"
        onClick={action}
        className={cn(
          "panel-surface rounded-2xl p-6 text-left transition-colors hover:border-solar-gold/40",
          warn && "border-amber-500/30",
        )}
      >
        {inner}
      </button>
    );
  }

  return (
    <ContentCard className={warn ? "border-amber-500/30" : undefined}>
      {inner}
    </ContentCard>
  );
}

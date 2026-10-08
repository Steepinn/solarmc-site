"use client";

import { useEffect, useMemo, useState } from "react";
import { projectRoles, type ProjectRoleKey } from "@/lib/roles";
import { cn } from "@/lib/utils";

type SiteUser = {
  discordId: string;
  username: string;
  mcNick?: string;
  sources?: string[];
  roles: ProjectRoleKey[];
};

const keys = Object.keys(projectRoles) as ProjectRoleKey[];

export function RoleAssignPanel() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<SiteUser[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState<ProjectRoleKey[]>([]);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/admin/roles?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => {
          setUsers(d.users ?? []);
          if (d.me) setMeId(d.me);
        })
        .finally(() => setLoading(false));
    }, 150);
    return () => clearTimeout(t);
  }, [query]);

  const selectedUser = useMemo(
    () => users.find((x) => x.discordId === selectedId) ?? null,
    [users, selectedId],
  );

  useEffect(() => {
    if (selectedUser) setSelected(selectedUser.roles);
  }, [selectedUser]);

  function toggle(key: ProjectRoleKey) {
    setSelected((s) =>
      s.includes(key) ? s.filter((k) => k !== key) : [...s, key],
    );
  }

  async function save() {
    if (!selectedId) {
      setMsg("Выбери пользователя");
      return;
    }
    setMsg("Сохранение...");
    const res = await fetch("/api/admin/roles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordId: selectedId, roles: selected }),
    });
    const data = await res.json();
    setMsg(
      res.ok
        ? "Роли на сайте сохранены и синхронизированы с Discord"
        : (data.error ?? "Ошибка"),
    );
    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) =>
          u.discordId === selectedId
            ? { ...u, roles: data.roles ?? selected }
            : u,
        ),
      );
    }
  }

  async function quickPass(grant: boolean) {
    if (!selectedId) return;
    setMsg(grant ? "Выдаём Player..." : "Забираем Player...");
    const res = await fetch("/api/admin/pass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discordId: selectedId, grant }),
    });
    if (res.ok) {
      setSelected((s) =>
        grant
          ? ([...new Set([...s, "player" as const])] as ProjectRoleKey[])
          : s.filter((k) => k !== "player"),
      );
      setMsg(
        grant
          ? "Player (проходка) выдана в Discord"
          : "Player (проходка) снята в Discord",
      );
    } else {
      setMsg("Ошибка синхронизации с Discord");
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Каталог: сайт + заявки + /dslink + MC usercache (только с Discord).{" "}
        <strong>Player</strong> — роль проходки на сервере.
      </p>

      <div className="space-y-2">
        <input
          className="input-field w-full"
          placeholder="Поиск: Steepy3, steepin, Discord ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoComplete="off"
        />
        <div className="max-h-72 overflow-y-auto rounded-xl border border-border bg-card/60">
          {loading ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">Поиск…</p>
          ) : users.length === 0 ? (
            <p className="px-3 py-3 text-sm text-muted-foreground">
              Никого не найдено.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {users.map((u) => {
                const active = u.discordId === selectedId;
                const isMe = meId === u.discordId;
                return (
                  <li key={u.discordId}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(u.discordId)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm transition-colors",
                        active
                          ? "bg-solar-gold/15 text-foreground"
                          : "hover:bg-accent/70",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 truncate font-medium">
                          {u.mcNick ?? u.username}
                          {isMe ? (
                            <span className="rounded-full bg-solar-gold/20 px-1.5 py-0.5 text-[10px] text-solar-gold">
                              ты
                            </span>
                          ) : null}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {u.mcNick ? u.username : null}
                          {u.mcNick ? " · " : null}
                          {u.discordId}
                          {u.sources?.length
                            ? ` · ${u.sources.join(", ")}`
                            : null}
                        </span>
                      </span>
                      {u.roles.length > 0 ? (
                        <span className="shrink-0 text-[10px] uppercase tracking-wide text-solar-gold">
                          {u.roles.length} рол.
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {selectedUser ? (
          <p className="text-xs text-muted-foreground">
            Выбран:{" "}
            <span className="font-medium text-foreground">
              {selectedUser.mcNick ?? selectedUser.username}
            </span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={`rounded-xl border px-3 py-2 text-sm ${
              selected.includes(key)
                ? "border-solar-gold bg-solar-gold/10"
                : "border-border"
            }`}
          >
            {projectRoles[key].label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn-primary" onClick={save}>
          Сохранить роли
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => quickPass(true)}
        >
          Выдать Player
        </button>
        <button
          type="button"
          className="btn-secondary border-red-500/40 text-red-400"
          onClick={() => quickPass(false)}
        >
          Забрать Player
        </button>
      </div>
      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
    </div>
  );
}

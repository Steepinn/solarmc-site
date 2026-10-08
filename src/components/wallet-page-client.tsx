"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ContentCard, PageShell } from "@/components/page-shell";
import botSync from "@/config/bot-sync.json";

type Balance = {
  mcNick: string | null;
  balance: number | null;
  hasCell: boolean;
  symbol: string;
  linked: boolean;
  spmoney: boolean;
  unavailable?: boolean;
  hint?: string;
};

type BaltopEntry = { rank: number; player: string; balance: number };

async function fetchJson<T>(url: string, timeoutMs = 5000): Promise<T | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { cache: "no-store", signal: ctrl.signal });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export function WalletPageClient() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [baltop, setBaltop] = useState<{
    symbol: string;
    entries: BaltopEntry[];
    available?: boolean;
  } | null>(null);
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      const me = await fetchJson<{ user?: unknown }>("/api/auth/me");
      if (!alive) return;
      setLoggedIn(Boolean(me?.user));

      const [bal, top] = await Promise.all([
        me?.user ? fetchJson<Balance>("/api/bank/balance") : Promise.resolve(null),
        fetchJson<{ symbol: string; entries: BaltopEntry[]; available?: boolean }>(
          "/api/bank/baltop?limit=10",
        ),
      ]);

      if (!alive) return;
      setBalance(
        bal ?? {
          mcNick: null,
          balance: null,
          hasCell: false,
          symbol: "¤",
          linked: false,
          spmoney: false,
          unavailable: true,
          hint: "Баланс доступен в игре (/spmoney) или в Discord-канале статуса → выбери игрока → «Баланс».",
        },
      );
      setBaltop(
        top ?? {
          symbol: "¤",
          entries: [],
          available: false,
        },
      );
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, []);

  const statusChannel = botSync.channels.status ?? "1487395981480956047";
  const guildId = botSync.guildId;

  return (
    <PageShell
      title="Банк Solar"
      description="SPmoney — та же экономика, что в игре. Ник берётся из Discord после /dslink."
      eyebrow="SPmoney"
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <ContentCard>
          <h2 className="text-xl font-semibold">Твой баланс</h2>
          {loggedIn === false ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-muted-foreground">
                Войди через Discord — ник подтянется из сервера (как у бота после /dslink).
              </p>
              <Link href="/api/auth/discord" className="btn-discord inline-flex">
                Войти через Discord
              </Link>
            </div>
          ) : loading ? (
            <div className="mt-4 space-y-2 animate-pulse">
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-10 w-48 rounded bg-muted" />
            </div>
          ) : balance?.unavailable || balance?.balance == null ? (
            <div className="mt-4 space-y-3">
              {balance?.mcNick ? (
                <p className="text-sm text-solar-gold">MC: {balance.mcNick}</p>
              ) : (
                <p className="text-sm text-amber-300">
                  Привяжи аккаунт в игре: <strong>/dslink</strong>
                </p>
              )}
              <p className="text-sm text-muted-foreground">
                {balance?.hint ??
                  "Сумма на сайте пока недоступна — смотри в игре или в Discord."}
              </p>
              {statusChannel ? (
                <Link
                  href={`https://discord.com/channels/${guildId}/${statusChannel}`}
                  className="btn-secondary inline-flex"
                  target="_blank"
                  rel="noreferrer"
                >
                  Канал статуса в Discord
                </Link>
              ) : null}
            </div>
          ) : (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">
                {balance.mcNick}
                {balance.hasCell ? " · ячейка открыта" : ""}
              </p>
              <p className="mt-2 text-4xl font-bold text-solar-gold">
                {balance.balance!.toLocaleString("ru-RU")}{" "}
                <span className="text-2xl">{balance.symbol}</span>
              </p>
            </div>
          )}
        </ContentCard>

        <ContentCard>
          <h2 className="text-xl font-semibold">Топ богачей</h2>
          {loading ? (
            <div className="mt-4 space-y-2 animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 rounded-xl bg-muted" />
              ))}
            </div>
          ) : !baltop?.available || baltop.entries.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Топ недоступен — данные синхронизируются из Discord (~1–2 мин после старта сервера).
            </p>
          ) : (
            <ol className="mt-4 space-y-2">
              {baltop.entries.map((e) => (
                <li
                  key={e.rank}
                  className="flex justify-between rounded-xl bg-muted/30 px-4 py-2.5 text-sm"
                >
                  <span>
                    #{e.rank} {e.player}
                  </span>
                  <span className="font-semibold">
                    {e.balance} {baltop.symbol}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </ContentCard>
      </div>

      <ContentCard className="mt-6">
        <h2 className="text-lg font-semibold">Магазин</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Покупки Solar+ и проходки — скоро. Переводы и ячейки — в игре через SPmoney.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/applications" className="btn-primary">
            Заявка на проходку
          </Link>
        </div>
      </ContentCard>
    </PageShell>
  );
}

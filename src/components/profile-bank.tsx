"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import botSync from "@/config/bot-sync.json";

type Balance = {
  mcNick: string | null;
  balance: number | null;
  symbol: string;
  linked: boolean;
  unavailable?: boolean;
  hint?: string;
};

export function ProfileBank() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [fineId, setFineId] = useState("");
  const [msg, setMsg] = useState("");

  const loadBalance = useCallback(() => {
    fetch("/api/bank/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setBalance(d));
  }, []);

  useEffect(() => {
    loadBalance();
  }, [loadBalance]);

  async function transfer() {
    setMsg("Отправка...");
    const res = await fetch("/api/bank/transfer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: transferTo.trim(), amount: Number(transferAmount) }),
    });
    const data = await res.json();
    setMsg(data.message ?? (res.ok ? "Готово" : "Ошибка перевода"));
    if (res.ok) loadBalance();
  }

  async function payFine() {
    setMsg("Оплата...");
    const res = await fetch("/api/bank/pay-fine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fineId: fineId.trim() }),
    });
    const data = await res.json();
    setMsg(data.message ?? (res.ok ? "Штраф оплачен" : "Ошибка"));
    if (res.ok) loadBalance();
  }

  const statusChannel = botSync.channels.status ?? "1487395981480956047";

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Банк SPmoney</h3>
        {!balance ? (
          <p className="mt-2 text-sm text-muted-foreground animate-pulse">Загрузка...</p>
        ) : balance.balance != null ? (
          <p className="mt-2 text-3xl font-bold text-solar-gold">
            {balance.balance.toLocaleString("ru-RU")}{" "}
            <span className="text-lg">{balance.symbol}</span>
          </p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            {balance.mcNick ? `MC: ${balance.mcNick}. ` : ""}
            {balance.unavailable
              ? (balance.hint ?? "Баланс синхронизируется из Discord — обнови через минуту.")
              : "Привяжи Discord через /dslink в игре, чтобы увидеть баланс."}
          </p>
        )}
        <Link
          href={`https://discord.com/channels/${botSync.guildId}/${statusChannel}`}
          className="btn-secondary mt-3 inline-flex text-sm"
          target="_blank"
          rel="noreferrer"
        >
          Баланс в Discord
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3">
          <p className="text-sm font-medium">Перевод игроку</p>
          <input
            className="input-field mt-2 w-full"
            placeholder="Ник получателя"
            value={transferTo}
            onChange={(e) => setTransferTo(e.target.value)}
          />
          <input
            className="input-field mt-2 w-full"
            placeholder="Сумма"
            type="number"
            min={1}
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
          />
          <button type="button" className="btn-primary mt-2 w-full" onClick={transfer}>
            Перевести
          </button>
        </div>
        <div className="rounded-xl border border-border p-3">
          <p className="text-sm font-medium">Оплата штрафа</p>
          <input
            className="input-field mt-2 w-full"
            placeholder="ID штрафа из игры"
            value={fineId}
            onChange={(e) => setFineId(e.target.value)}
          />
          <button type="button" className="btn-secondary mt-2 w-full" onClick={payFine}>
            Оплатить штраф
          </button>
        </div>
      </div>
      {msg ? <p className="text-xs text-muted-foreground">{msg}</p> : null}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const ERROR_TEXT: Record<string, string> = {
  no_mc_nick:
    "Discord вошёл, но MC-ник не найден. Зайди на сервер, привяжи Discord (/dslink), затем снова нажми «Войти» в лаунчере.",
  blocked: "Аккаунт заблокирован на сайте.",
  oauth_not_configured: "OAuth Discord на сайте не настроен.",
  token_failed: "Не удалось подтвердить вход Discord. Попробуй ещё раз из лаунчера.",
  user_failed: "Не удалось получить профиль Discord.",
  no_code: "Вход отменён в Discord.",
  invalid_launcher_device: "Сессия лаунчера устарела. Закрой браузер и нажми «Войти» в Solar Launcher снова.",
  discord_route_failed: "Ошибка маршрута входа. Обнови страницу или перезапусти лаунчер.",
};

type Props = {
  ok: boolean;
  nick: string;
  error: string;
};

export function LauncherDoneView({ ok, nick, error }: Props) {
  useEffect(() => {
    if (!ok) return;
    try {
      window.close();
    } catch {
      /* popup may block close */
    }
  }, [ok]);

  const message = ok
    ? "Аккаунт передан в Solar Launcher."
    : ERROR_TEXT[error] ?? (error ? `Ошибка: ${error}` : "Не удалось завершить вход.");

  return (
    <div className="launcher-done mx-auto flex min-h-[calc(100svh-8rem)] max-w-md flex-col items-center justify-center px-4 py-10 sm:min-h-[calc(100svh-6rem)]">
      <div className="launcher-done__card w-full rounded-3xl border border-solar-gold/25 bg-card/90 p-8 text-center shadow-[0_0_60px_rgba(255,242,0,0.08)] backdrop-blur-md">
        <Image
          src="/logo.png"
          alt=""
          width={72}
          height={72}
          className="mx-auto rounded-2xl ring-2 ring-solar-gold/40"
          priority
        />

        <div className="mt-6 flex justify-center">
          {ok ? (
            <CheckCircle2 className="size-14 text-green-400" strokeWidth={1.75} aria-hidden />
          ) : (
            <XCircle className="size-14 text-red-400" strokeWidth={1.75} aria-hidden />
          )}
        </div>

        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.2em] text-solar-gold">
          Solar Launcher
        </p>
        <h1 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {ok ? "Вход успешен" : "Вход не выполнен"}
        </h1>

        {ok && nick ? (
          <p className="mt-3 text-lg font-semibold text-foreground">{nick}</p>
        ) : null}

        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{message}</p>

        {ok ? (
          <p className="mt-5 rounded-xl bg-solar-gold/10 px-4 py-3 text-sm font-medium text-foreground">
            Вернитесь в лаунчер — это окно можно закрыть.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/launcher" className="btn-primary inline-flex justify-center px-5 py-2.5 text-sm">
              Страница лаунчера
            </Link>
            <button
              type="button"
              className="btn-secondary inline-flex justify-center px-5 py-2.5 text-sm"
              onClick={() => {
                try {
                  window.close();
                } catch {
                  /* ignore */
                }
              }}
            >
              Закрыть окно
            </button>
          </div>
        )}

        <Link
          href="/"
          className="mt-6 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-solar-gold hover:underline"
        >
          На главную сайта
        </Link>
      </div>
    </div>
  );
}

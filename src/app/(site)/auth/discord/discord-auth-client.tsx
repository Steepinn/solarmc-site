"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ContentCard, PageShell } from "@/components/page-shell";
import { siteConfig } from "@/config/site";

type Props = {
  redirectUri: string;
  clientId: string;
  hasSecret: boolean;
};

export default function DiscordAuthPage({
  redirectUri,
  clientId,
  hasSecret,
}: Props) {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessages: Record<string, string> = {
    oauth_not_configured:
      "Добавь DISCORD_CLIENT_SECRET в .env.local (Discord Developer Portal → OAuth2 → Client Secret).",
    token_failed: "Не удалось получить токен Discord — проверь Client Secret и redirect URI.",
    user_failed: "Не удалось получить профиль Discord",
    redirect_uri:
      "Discord не принимает redirect URI — добавь его в настройках приложения (см. ниже).",
  };

  const devRedirects = [
    redirectUri,
    "http://localhost:3000/api/auth/callback",
    "http://127.0.0.1:3000/api/auth/callback",
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <PageShell
      title="Авторизация"
      description="Войди через Discord — откроется личный кабинет, заявки и лента."
      eyebrow="Аккаунт"
    >
      <ContentCard className="mx-auto max-w-md text-center">
        <Image src="/logo.png" alt="SolarMC" width={80} height={80} className="mx-auto" />
        <h2 className="mt-4 text-xl font-semibold">Войти через Discord</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Авторизация привязывает аккаунт Discord к сайту SolarMC — для заявок на
          проходку и личного кабинета.
        </p>

        {error || searchParams.get("login") === "fail" ? (
          <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error
              ? errorMessages[error] ?? `Ошибка: ${error}`
              : "Вход не удался. Попробуй ещё раз."}
          </p>
        ) : null}

        {!hasSecret ? (
          <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
            В .env.local не задан DISCORD_CLIENT_SECRET — вход не сработает после
            авторизации на Discord.
          </p>
        ) : null}

        <div className="mt-6 space-y-3">
          <Link
            href="/api/auth/discord"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Войти через Discord
          </Link>
          <Link
            href={siteConfig.links.discord}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm text-muted-foreground hover:text-foreground"
          >
            Или зайди на Discord-сервер
          </Link>
        </div>

        <details className="mt-6 text-start text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            Настройка OAuth (если ошибка redirect_uri)
          </summary>
          <ol className="mt-3 list-decimal space-y-2 ps-4">
            <li>
              Открой{" "}
              <a
                href={
                  clientId
                    ? `https://discord.com/developers/applications/${clientId}/oauth2`
                    : "https://discord.com/developers/applications"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-solar-gold hover:underline"
              >
                Discord Developer Portal → OAuth2
              </a>
            </li>
            <li>
              В блоке <strong>Redirects</strong> добавь (каждый с новой строки):
              <ul className="mt-1 space-y-1 font-mono text-[11px]">
                {devRedirects.map((uri) => (
                  <li key={uri} className="break-all rounded bg-muted/40 px-2 py-1">
                    {uri}
                  </li>
                ))}
              </ul>
            </li>
            <li>Сохрани и попробуй войти снова с того же адреса в браузере.</li>
          </ol>
        </details>
      </ContentCard>
    </PageShell>
  );
}

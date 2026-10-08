import Link from "next/link";

export const metadata = { title: "Вход в лаунчер" };

export default async function LauncherDonePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ok = String(sp.ok ?? "") === "1";
  const nick = typeof sp.nick === "string" ? sp.nick : "";
  const error = typeof sp.error === "string" ? sp.error : "";

  const errorText: Record<string, string> = {
    no_mc_nick:
      "Discord вошёл, но MC-ник не найден. Зайди на сервер, привяжи Discord (код боту), потом снова войди в лаунчер.",
    blocked: "Аккаунт заблокирован на сайте.",
    oauth_not_configured: "OAuth Discord на сайте не настроен.",
    token_failed: "Не удалось обменять код Discord.",
    user_failed: "Не удалось получить профиль Discord.",
    no_code: "Вход отменён.",
  };

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">
        {ok ? "Лаунчер готов" : "Не удалось войти"}
      </h1>
      {ok ? (
        <p className="text-muted-foreground">
          Аккаунт <span className="text-foreground font-medium">{nick || "OK"}</span>{" "}
          передан в Solar Launcher. Это окно можно закрыть.
        </p>
      ) : (
        <p className="text-muted-foreground">
          {errorText[error] ?? `Ошибка: ${error || "unknown"}`}
        </p>
      )}
      <Link href="/" className="text-sm underline underline-offset-4">
        На главную сайта
      </Link>
    </main>
  );
}

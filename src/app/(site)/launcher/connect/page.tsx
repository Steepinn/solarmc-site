import Link from "next/link";
import { redirect } from "next/navigation";
import { getEnrichedSession } from "@/lib/auth";
import { createLauncherDevice } from "@/lib/launcher-auth";

export const metadata = { title: "Вход в лаунчер" };
export const dynamic = "force-dynamic";

export default async function LauncherConnectPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const device = typeof sp.device === "string" ? sp.device.trim() : "";

  if (!device || device.length < 8 || device.length > 128) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Неверная ссылка</h1>
        <p className="text-muted-foreground">
          Открой вход заново из Solar Launcher.
        </p>
        <Link href="/" className="text-sm underline underline-offset-4">
          На главную
        </Link>
      </main>
    );
  }

  try {
    await createLauncherDevice(device);
  } catch {
    // уже есть / невалидный — poll всё равно сработает после confirm
  }

  const session = await getEnrichedSession();

  if (!session) {
    redirect(`/api/auth/discord?device=${encodeURIComponent(device)}`);
  }

  const nick = session.mcNick?.trim() ?? "";
  if (!nick) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">Нужен MC-ник</h1>
        <p className="text-muted-foreground">
          Ты уже вошёл на сайт, но Minecraft-ник не привязан. Зайди на сервер, привяжи
          Discord, затем снова нажми «Войти» в лаунчере.
        </p>
        <Link href="/profile" className="btn-primary inline-flex w-fit items-center justify-center px-5 py-2.5">
          Открыть профиль
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center gap-5 px-6 py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-solar-gold">
        Solar Launcher
      </p>
      <h1 className="text-3xl font-semibold tracking-tight">Подтверди вход</h1>
      <p className="text-muted-foreground leading-relaxed">
        Ты уже авторизован на сайте как{" "}
        <span className="text-foreground font-medium">{nick}</span>
        {session.username ? (
          <>
            {" "}
            <span className="text-muted-foreground">(@{session.username})</span>
          </>
        ) : null}
        . Подтверди вход в лаунчер — аккаунт на сайте останется активным.
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <a
          href={`/api/launcher/confirm?device=${encodeURIComponent(device)}`}
          className="btn-primary inline-flex items-center justify-center px-6 py-3 text-sm font-semibold"
        >
          Подтвердить вход и вернуться в лаунчер
        </a>
        <a
          href={`/api/auth/discord?device=${encodeURIComponent(device)}&force=1`}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Войти другим Discord
        </a>
      </div>
      <p className="text-xs text-muted-foreground">
        После подтверждения это окно можно закрыть — лаунчер подхватит аккаунт сам.
      </p>
    </main>
  );
}

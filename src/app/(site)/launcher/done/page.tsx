import { LauncherDoneView } from "@/components/launcher-done-view";

export const metadata = {
  title: "Вход в лаунчер",
  robots: { index: false, follow: false },
};

export default async function LauncherDonePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const ok = String(sp.ok ?? "") === "1";
  const nick = typeof sp.nick === "string" ? sp.nick : "";
  const error = typeof sp.error === "string" ? sp.error : "";

  return <LauncherDoneView ok={ok} nick={nick} error={error} />;
}

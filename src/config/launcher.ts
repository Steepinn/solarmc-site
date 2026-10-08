/**
 * Сборки Solar Launcher.
 * Положи файлы в public/downloads/ — ссылки подхватятся сами.
 * Можно переопределить через env (внешние URL).
 */
export type LauncherBuild = {
  id: "official" | "tlauncher";
  title: string;
  subtitle: string;
  description: string;
  /** Путь в public/ или полный https:// */
  file: string;
  hint: string;
};

export const launcherBuilds: LauncherBuild[] = [
  {
    id: "official",
    title: "Официальный Minecraft",
    subtitle: "Launcher от Mojang / Microsoft",
    description:
      "Если играешь через официальный лаунчер Minecraft (Microsoft-аккаунт) — качай эту сборку.",
    file:
      process.env.NEXT_PUBLIC_LAUNCHER_OFFICIAL_URL?.trim() ||
      "/downloads/solar-launcher-official.zip",
    hint: "Minecraft Java 1.21.1 + Fabric уже в комплекте.",
  },
  {
    id: "tlauncher",
    title: "TLauncher",
    subtitle: "TLauncher / похожие",
    description:
      "Если сидишь на TLauncher — бери эту версию, она заточена под его структуру папок.",
    file:
      process.env.NEXT_PUBLIC_LAUNCHER_TLAUNCHER_URL?.trim() ||
      "/downloads/solar-launcher-tlauncher.zip",
    hint: "Не мешай сборки: официалку в TLauncher не ставь.",
  },
];

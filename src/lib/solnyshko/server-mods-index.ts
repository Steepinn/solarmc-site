import { loadServerPack } from "@/lib/solnyshko/pack-mods";

/** Список серверных jar для промпта. */
export function serverModsPromptBlurb(): string {
  const m = loadServerPack();
  if (!m.mods.length) {
    return "СЕРВЕРНЫЕ МОДЫ: папка/манифест пусты — не выдумывай состав.";
  }
  const files = m.mods.map((x) => x.file);
  const src = m.live ? "live-папка" : "JSON fallback";
  return [
    `СЕРВЕРНЫЕ МОДЫ — источник правды (${src}, ${m.updated}, ${files.length} jar):`,
    files.join(", "),
    "Клиентские-only (Sodium/Iris/LambDynamicLights/Mouse Tweaks и т.п.) на сервере НЕ лежат — они в client-mods.",
  ].join("\n");
}

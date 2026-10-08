/**
 * Синхронизация манифестов модов для Солнышка из папок сборки.
 * Usage: node scripts/sync-solnyshko-mods.mjs
 * Env: SOLAR_CLIENT_MODS, SOLAR_SERVER_MODS — пути к папкам (опционально).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const outDir = path.join(root, "content", "solnyshko");

const DEFAULT_CLIENT =
  process.env.SOLAR_CLIENT_MODS ||
  "C:\\Users\\Steep\\OneDrive\\Рабочий стол\\Солярка закрытая\\client-mods";
const DEFAULT_SERVER =
  process.env.SOLAR_SERVER_MODS ||
  "C:\\Users\\Steep\\OneDrive\\Рабочий стол\\Солярка закрытая\\mods";

function idOf(file) {
  return file
    .replace(/\.jar$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isActiveJar(name) {
  if (!name.toLowerCase().endsWith(".jar")) return false;
  if (/\.(prev|old|disabled)/i.test(name)) return false;
  if (name.toLowerCase().includes(".disabled")) return false;
  return true;
}

function scanJars(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(isActiveJar)
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((file) => ({ file, id: idOf(file) }));
}

function scanOptional(clientDir) {
  const opt = path.join(clientDir, "optional");
  if (!fs.existsSync(opt)) return [];
  return scanJars(opt).map((e) => ({
    ...e,
    note: e.file.toLowerCase().includes("fwa")
      ? "Fancy World Animations, не обязателен"
      : "optional",
  }));
}

function writeJson(name, data) {
  const p = path.join(outDir, name);
  fs.writeFileSync(p, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`wrote ${name}: ${data.mods?.length ?? 0} mods`);
}

const clientDir = DEFAULT_CLIENT;
const serverDir = DEFAULT_SERVER;
const today = new Date().toISOString().slice(0, 10);

const clientMods = scanJars(clientDir);
const optional = scanOptional(clientDir);
const serverMods = scanJars(serverDir);

if (!clientMods.length) {
  console.warn("WARN: client-mods пусто или путь не найден:", clientDir);
} else {
  writeJson("client-mods-manifest.json", {
    source: clientDir,
    updated: today,
    note: "Актуальная клиентская сборка Season 3 (без .prev/.old/.disabled). optional/ отдельно.",
    mods: clientMods,
    optional,
    extras_note:
      "CLIENT_EXTRA_MODS: Sodium/Iris/LambDynamicLights/Mouse Tweaks/InvMove и др. — в этой папке.",
  });
}

if (!serverMods.length) {
  console.warn("WARN: server mods пусто или путь не найден:", serverDir);
} else {
  writeJson("server-mods-manifest.json", {
    source: serverDir,
    updated: today,
    note: "Активные jar на сервере (без .prev/.old/.disabled).",
    mods: serverMods,
  });
}

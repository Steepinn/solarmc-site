import fs from "fs";
import path from "path";

export type PackModEntry = { file: string; id: string; note?: string };

export type ClientPackManifest = {
  source: string;
  updated: string;
  note: string;
  mods: PackModEntry[];
  optional: PackModEntry[];
  live: boolean;
};

export type ServerPackManifest = {
  source: string;
  updated: string;
  note: string;
  mods: PackModEntry[];
  live: boolean;
};

const CACHE_MS = 20_000;

const DEFAULT_CLIENT =
  process.env.SOLAR_CLIENT_MODS?.trim() ||
  "C:\\Users\\Steep\\OneDrive\\Рабочий стол\\Солярка закрытая\\client-mods";

const DEFAULT_SERVER =
  process.env.SOLAR_SERVER_MODS?.trim() ||
  "C:\\Users\\Steep\\OneDrive\\Рабочий стол\\Солярка закрытая\\mods";

const CLIENT_JSON = path.join(
  process.cwd(),
  "content",
  "solnyshko",
  "client-mods-manifest.json",
);
const SERVER_JSON = path.join(
  process.cwd(),
  "content",
  "solnyshko",
  "server-mods-manifest.json",
);

let clientCache: { at: number; data: ClientPackManifest } | null = null;
let serverCache: { at: number; data: ServerPackManifest } | null = null;

function idOf(file: string) {
  return file
    .replace(/\.jar$/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function isActiveJar(name: string) {
  if (!name.toLowerCase().endsWith(".jar")) return false;
  if (/\.(prev|old|disabled)/i.test(name)) return false;
  if (name.toLowerCase().includes(".disabled")) return false;
  return true;
}

function scanJars(dir: string): PackModEntry[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(isActiveJar)
    .sort((a, b) => a.localeCompare(b, "en"))
    .map((file) => ({ file, id: idOf(file) }));
}

function scanOptional(clientDir: string): PackModEntry[] {
  const opt = path.join(clientDir, "optional");
  if (!fs.existsSync(opt)) return [];
  return scanJars(opt).map((e) => ({
    ...e,
    note: e.file.toLowerCase().includes("fwa")
      ? "Fancy World Animations, не обязателен"
      : "optional",
  }));
}

function readJson<T>(file: string): T | null {
  try {
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "")) as T;
  } catch {
    return null;
  }
}

/** Тихо пишем манифест — чтобы сайт/деплой тоже были в курсе. */
function persist(file: string, data: unknown) {
  try {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  } catch (err) {
    console.warn("[solnyshko] persist mods failed", file, err);
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

/** Живая папка client-mods → иначе JSON. */
export function loadClientPack(): ClientPackManifest {
  const now = Date.now();
  if (clientCache && now - clientCache.at < CACHE_MS) return clientCache.data;

  const liveMods = scanJars(DEFAULT_CLIENT);
  if (liveMods.length) {
    const data: ClientPackManifest = {
      source: DEFAULT_CLIENT,
      updated: today(),
      note: "Live scan client-mods (без .prev/.old/.disabled).",
      mods: liveMods,
      optional: scanOptional(DEFAULT_CLIENT),
      live: true,
    };
    persist(CLIENT_JSON, {
      source: data.source,
      updated: data.updated,
      note: data.note,
      mods: data.mods,
      optional: data.optional,
      extras_note:
        "Автосинк: Солнышко читает папку live. JSON — кэш/fallback.",
    });
    clientCache = { at: now, data };
    return data;
  }

  const fallback = readJson<{
    source?: string;
    updated?: string;
    note?: string;
    mods?: PackModEntry[];
    optional?: PackModEntry[];
  }>(CLIENT_JSON);

  const data: ClientPackManifest = {
    source: fallback?.source ?? CLIENT_JSON,
    updated: fallback?.updated ?? "?",
    note: fallback?.note ?? "JSON fallback (live-папка недоступна).",
    mods: fallback?.mods ?? [],
    optional: fallback?.optional ?? [],
    live: false,
  };
  clientCache = { at: now, data };
  return data;
}

/** Живая папка mods → иначе JSON. */
export function loadServerPack(): ServerPackManifest {
  const now = Date.now();
  if (serverCache && now - serverCache.at < CACHE_MS) return serverCache.data;

  const liveMods = scanJars(DEFAULT_SERVER);
  if (liveMods.length) {
    const data: ServerPackManifest = {
      source: DEFAULT_SERVER,
      updated: today(),
      note: "Live scan server mods.",
      mods: liveMods,
      live: true,
    };
    persist(SERVER_JSON, {
      source: data.source,
      updated: data.updated,
      note: data.note,
      mods: data.mods,
    });
    serverCache = { at: now, data };
    return data;
  }

  const fallback = readJson<{
    source?: string;
    updated?: string;
    note?: string;
    mods?: PackModEntry[];
  }>(SERVER_JSON);

  const data: ServerPackManifest = {
    source: fallback?.source ?? SERVER_JSON,
    updated: fallback?.updated ?? "?",
    note: fallback?.note ?? "JSON fallback (live-папка недоступна).",
    mods: fallback?.mods ?? [],
    live: false,
  };
  serverCache = { at: now, data };
  return data;
}

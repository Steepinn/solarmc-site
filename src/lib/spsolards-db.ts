import { DatabaseSync } from "node:sqlite";
import path from "path";
import { getServerRoot } from "@/lib/minecraft-paths";

function dbPath(): string | null {
  const explicit = process.env.SPSOLARDS_DB?.trim();
  if (explicit) return explicit;
  const root = getServerRoot();
  if (!root) return null;
  return path.join(root, "plugins", "SPSolards", "data.db");
}

let cached: { at: number; path: string; db: DatabaseSync } | null = null;

function openDb(): DatabaseSync | null {
  const file = dbPath();
  if (!file) return null;
  try {
    if (cached && cached.path === file && Date.now() - cached.at < 15_000) {
      return cached.db;
    }
    const db = new DatabaseSync(file, { readOnly: true });
    cached = { at: Date.now(), path: file, db };
    return db;
  } catch {
    cached = null;
    return null;
  }
}

export async function uuidByDiscordId(discordId: string): Promise<string | null> {
  const id = discordId.trim();
  if (!id) return null;
  const db = openDb();
  if (!db) return null;
  try {
    const row = db
      .prepare("SELECT mc_uuid FROM links WHERE discord_id = ? LIMIT 1")
      .get(id) as { mc_uuid?: string } | undefined;
    return row?.mc_uuid ?? null;
  } catch {
    return null;
  }
}

export async function discordIdByUuid(uuid: string): Promise<string | null> {
  const id = uuid.trim().toLowerCase();
  if (!id) return null;
  const db = openDb();
  if (!db) return null;
  try {
    const row = db
      .prepare("SELECT discord_id FROM links WHERE lower(mc_uuid) = ? LIMIT 1")
      .get(id) as { discord_id?: string } | undefined;
    return row?.discord_id ?? null;
  } catch {
    return null;
  }
}

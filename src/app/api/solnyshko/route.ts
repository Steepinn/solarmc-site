import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import {
  answerFromWiki,
  answerWithGemini,
  type ChatTurn,
} from "@/lib/solnyshko/answer";
import type { SolAudience } from "@/lib/solnyshko/policy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const buckets = new Map<string, { n: number; reset: number }>();
const LIMIT = 40;
const WINDOW_MS = 60 * 60 * 1000;

function clientKey(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

function rateOk(key: string) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { n: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (b.n >= LIMIT) return false;
  b.n += 1;
  return true;
}

function resolveAudience(
  session: Awaited<ReturnType<typeof getEnrichedSession>>,
): SolAudience {
  if (!session) return "guest";
  const keys = new Set(session.projectRoles?.map((r) => r.key) ?? []);
  if (session.isAdministrator || keys.has("administrator")) {
    return "administrator";
  }
  if (session.isModerator || keys.has("moderator")) return "moderator";
  if (keys.has("helper")) return "helper";
  if (session.hasWhitelist || keys.has("player")) return "player";
  return "guest";
}

function parseHistory(raw: unknown): ChatTurn[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatTurn[] = [];
  for (const item of raw.slice(-12)) {
    if (!item || typeof item !== "object") continue;
    const role = (item as { role?: string }).role;
    const text = String((item as { text?: string }).text ?? "").trim();
    if ((role !== "user" && role !== "bot") || text.length < 1) continue;
    out.push({ role, text: text.slice(0, 400) });
  }
  return out;
}

export async function POST(req: NextRequest) {
  if (!rateOk(clientKey(req))) {
    return NextResponse.json(
      { error: "Слишком много вопросов. Подожди немного." },
      { status: 429 },
    );
  }

  let body: { message?: string; history?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }

  const message = body.message?.trim() ?? "";
  if (message.length < 2 || message.length > 500) {
    return NextResponse.json(
      { error: "Вопрос от 2 до 500 символов." },
      { status: 400 },
    );
  }

  const history = parseHistory(body.history);
  const session = await getEnrichedSession();
  const audience = resolveAudience(session);

  const gemini = await answerWithGemini(message, audience, history);
  const result = gemini ?? answerFromWiki(message, audience, history);

  return NextResponse.json({
    answer: result.answer,
    sources: result.sources,
    mode: result.mode,
    audience,
  });
}

import { NextRequest, NextResponse } from "next/server";
import {
  getDiscordOAuthUrl,
  getEnrichedSession,
  getPublicOriginFromRequest,
} from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Starts Discord OAuth. Launcher passes ?device=xxx -> state=launcher:xxx
 * Если уже есть сессия сайта и device — уводим на confirm, без повторного Discord.
 * ?force=1 — всё равно Discord (смена аккаунта).
 */
export async function GET(req: NextRequest) {
  const origin = getPublicOriginFromRequest(req);
  const device = req.nextUrl.searchParams.get("device")?.trim() ?? "";
  const force = req.nextUrl.searchParams.get("force") === "1";

  try {
    if (device) {
      if (device.length < 8 || device.length > 128) {
        return NextResponse.redirect(
          `${origin}/auth/discord?error=invalid_launcher_device`,
        );
      }
      if (!force) {
        const session = await getEnrichedSession();
        if (session?.mcNick?.trim()) {
          return NextResponse.redirect(
            `${origin}/launcher/connect?device=${encodeURIComponent(device)}`,
            302,
          );
        }
      }
    }

    let state: string | undefined;
    if (device) {
      state = `launcher:${device}`;
    }

    const url = getDiscordOAuthUrl(origin, state);
    if (!url) {
      return NextResponse.redirect(
        `${origin}/auth/discord?error=oauth_not_configured`,
      );
    }

    return NextResponse.redirect(url, 302);
  } catch (err) {
    console.error("[auth/discord]", err);
    return NextResponse.redirect(
      `${origin}/auth/discord?error=discord_route_failed`,
    );
  }
}

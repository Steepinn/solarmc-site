import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { completeLauncherDevice, failLauncherDevice } from "@/lib/launcher-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Подтверждение входа в лаунчер для уже залогиненного на сайте пользователя.
 * Сессию сайта не трогает.
 */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const device = req.nextUrl.searchParams.get("device")?.trim() ?? "";

  if (!device || device.length < 8 || device.length > 128) {
    return NextResponse.redirect(`${origin}/launcher/done?ok=0&error=invalid_launcher_device`);
  }

  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.redirect(
      `${origin}/api/auth/discord?device=${encodeURIComponent(device)}`,
    );
  }

  const nick = session.mcNick?.trim();
  if (!nick) {
    await failLauncherDevice(device, "no_mc_nick");
    return NextResponse.redirect(`${origin}/launcher/done?ok=0&error=no_mc_nick`);
  }

  await completeLauncherDevice(device, session, nick);
  return NextResponse.redirect(
    `${origin}/launcher/done?ok=1&nick=${encodeURIComponent(nick)}`,
  );
}

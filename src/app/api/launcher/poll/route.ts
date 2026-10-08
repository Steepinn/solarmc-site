import { NextRequest, NextResponse } from "next/server";
import { getLauncherDevice } from "@/lib/launcher-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const device = req.nextUrl.searchParams.get("device")?.trim() ?? "";
  if (!device) {
    return NextResponse.json({ error: "missing_device" }, { status: 400 });
  }

  const rec = await getLauncherDevice(device);
  if (!rec) {
    return NextResponse.json({ pending: true });
  }

  if (rec.status === "pending") {
    return NextResponse.json({ pending: true });
  }

  if (rec.status === "error") {
    return NextResponse.json({
      ok: false,
      error: rec.error ?? "login_failed",
    });
  }

  if (!rec.nick) {
    return NextResponse.json({
      ok: false,
      error: "no_mc_nick",
    });
  }

  return NextResponse.json({
    ok: true,
    nick: rec.nick,
    discordId: rec.discordId,
    username: rec.username,
    avatar: rec.avatar,
  });
}

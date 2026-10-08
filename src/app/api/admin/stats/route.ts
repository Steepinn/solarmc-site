import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import {
  getAdminSiteStats,
  listAdminMcPlayers,
} from "@/lib/admin-stats";
import { filterDirectory, listAdminDirectory } from "@/lib/admin-directory";
import { createNotification } from "@/lib/notifications-db";

export async function GET(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const view = req.nextUrl.searchParams.get("view") ?? "stats";
  const q = req.nextUrl.searchParams.get("q") ?? "";

  if (view === "users") {
    const all = await listAdminDirectory();
    const users = filterDirectory(all, q);
    return NextResponse.json({
      users,
      total: all.length,
      me: session.discordId,
    });
  }

  if (view === "achievements") {
    const players = await listAdminMcPlayers();
    return NextResponse.json({ players });
  }

  const [stats, directory] = await Promise.all([
    getAdminSiteStats(),
    listAdminDirectory(),
  ]);
  return NextResponse.json({
    stats: { ...stats, directoryUsers: directory.length },
    me: session.discordId,
  });
}

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    action?: string;
    title?: string;
    message?: string;
    href?: string;
    audience?: "all" | "staff";
  };

  if (body.action !== "broadcast") {
    return NextResponse.json({ error: "unknown_action" }, { status: 400 });
  }

  const title = body.title?.trim();
  const message = body.message?.trim();
  if (!title || !message) {
    return NextResponse.json({ error: "title_and_message_required" }, { status: 400 });
  }

  const item = await createNotification({
    audience: body.audience === "staff" ? "staff" : "all",
    title,
    body: message,
    href: body.href?.trim() || "/",
  });

  return NextResponse.json({ ok: true, notification: item });
}

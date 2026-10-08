import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import {
  getNotificationsForUser,
  markNotificationsRead,
} from "@/lib/notifications-db";

export async function GET() {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const notifications = await getNotificationsForUser({
    discordId: session.discordId,
    isStaff: session.isAdmin,
  });

  const unread = notifications.filter(
    (n) => !n.readBy.includes(session.discordId),
  ).length;

  return NextResponse.json({
    notifications: notifications.slice(0, 40).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      href: n.href,
      createdAt: n.createdAt,
      read: n.readBy.includes(session.discordId),
    })),
    unread,
  });
}

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const ids = Array.isArray(body.ids)
    ? body.ids.map((x: unknown) => String(x))
    : undefined;

  await markNotificationsRead(session.discordId, ids);
  return NextResponse.json({ ok: true });
}

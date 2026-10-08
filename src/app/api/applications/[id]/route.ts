import { NextRequest, NextResponse } from "next/server";
import {
  addApplicationMessage,
  getApplicationById,
  updateApplicationStatus,
} from "@/lib/db";
import { dmApplicationDecision, dmSupportReply } from "@/lib/discord-bot";
import { createNotification } from "@/lib/notifications-db";
import { grantPlayerPass, revokePlayerPass } from "@/lib/site-roles";
import { getEnrichedSession } from "@/lib/auth";
import {
  mirrorApplicationMessageToDiscord,
  syncApplicationFromDiscord,
} from "@/lib/application-bridge";

type Params = { params: Promise<{ id: string }> };

const MAX_BODY = 4000;

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let app = await getApplicationById(id);
  if (!app) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!session.isAdmin && app.discordId !== session.discordId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  app = await syncApplicationFromDiscord(app);
  return NextResponse.json({ application: app });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let app = await getApplicationById(id);
  if (!app) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const isOwner = app.discordId === session.discordId;
  if (!session.isAdmin && !isOwner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (app.status !== "pending") {
    return NextResponse.json({ error: "closed" }, { status: 400 });
  }

  app = await syncApplicationFromDiscord(app);

  const body = await req.json();
  const text = String(body.body ?? "").trim();
  if (!text || text.length > MAX_BODY) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const authorRole = session.isAdmin ? "staff" : "user";

  if (!session.isAdmin) {
    const lastOwn = [...(app.messages ?? [])]
      .reverse()
      .find((m) => m.authorDiscordId === session.discordId);
    if (lastOwn) {
      const elapsed = Date.now() - new Date(lastOwn.createdAt).getTime();
      if (elapsed < 60_000) {
        return NextResponse.json(
          { error: "rate_limit", retryAfterMs: 60_000 - elapsed },
          { status: 429 },
        );
      }
    }
  }

  const updated = await addApplicationMessage(id, {
    authorDiscordId: session.discordId,
    authorUsername: session.username,
    authorRole,
    body: text,
  });

  if (!updated) {
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }

  const last = updated.messages?.at(-1);
  if (last) {
    const label = session.isAdmin
      ? `${session.username} · Staff`
      : session.mcNick ?? session.username;
    await mirrorApplicationMessageToDiscord(updated, last.id, label, text);
  }

  if (authorRole === "staff") {
    await createNotification({
      audience: "user",
      userId: app.discordId,
      title: `Ответ по заявке #${app.ticketNumber ?? ""}`.trim(),
      body: text.slice(0, 140),
      href: `/applications/${app.id}`,
    });
    void dmSupportReply({
      discordId: app.discordId,
      ticketNumber: app.ticketNumber ?? 0,
      ticketId: app.id,
      preview: text,
      fromStaff: true,
      kind: "application",
    });
  } else {
    await createNotification({
      audience: "staff",
      title: `Заявка #${app.ticketNumber ?? "—"}: сообщение`,
      body: text.slice(0, 140),
      href: `/applications/${app.id}`,
    });
  }

  return NextResponse.json({
    application: (await getApplicationById(id)) ?? updated,
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const status = body.status as "approved" | "rejected" | "revoked";

  if (!["approved", "rejected", "revoked"].includes(status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const app = await getApplicationById(id);
  if (!app) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (status === "approved") {
    await grantPlayerPass(app.discordId);
    const updated = await updateApplicationStatus(id, "approved", session.username);
    void dmApplicationDecision({
      discordId: app.discordId,
      approved: true,
      mcNick: app.mcNick,
    });
    return NextResponse.json({ application: updated });
  }

  await revokePlayerPass(app.discordId);
  const rejectReason =
    body.rejectReason ?? (status === "revoked" ? "Проходка отозвана" : undefined);
  const updated = await updateApplicationStatus(
    id,
    "rejected",
    session.username,
    rejectReason,
  );

  void dmApplicationDecision({
    discordId: app.discordId,
    approved: false,
    mcNick: app.mcNick,
    reason: rejectReason,
  });

  return NextResponse.json({ application: updated });
}

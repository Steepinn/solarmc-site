import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { dmSupportReply, sendDiscordDm } from "@/lib/discord-bot";
import { createNotification } from "@/lib/notifications-db";
import { parseEvidenceUrls } from "@/lib/support-evidence";
import {
  addSupportMessage,
  getSupportTicketById,
  updateSupportTicketStatus,
} from "@/lib/support-db";
import {
  closeSupportDiscordChannel,
  mirrorSupportMessageToDiscord,
  reopenSupportDiscordChannel,
  syncSupportTicketFromDiscord,
} from "@/lib/support-bridge";
import type { SupportTicketStatus } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

const MAX_BODY = 4000;

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let ticket = await getSupportTicketById(id);
  if (!ticket) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!session.isAdmin && ticket.discordId !== session.discordId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  ticket = await syncSupportTicketFromDiscord(ticket);
  return NextResponse.json({ ticket });
}

export async function POST(req: NextRequest, { params }: Params) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  let ticket = await getSupportTicketById(id);
  if (!ticket) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const isOwner = ticket.discordId === session.discordId;
  if (!session.isAdmin && !isOwner) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (ticket.status === "closed") {
    return NextResponse.json({ error: "closed" }, { status: 400 });
  }

  // сначала подтянуть Discord, потом писать
  ticket = await syncSupportTicketFromDiscord(ticket);

  const body = await req.json();
  const text = String(body.body ?? "").trim();
  if (!text || text.length > MAX_BODY) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const evidence = parseEvidenceUrls(body.evidenceUrls ?? body.evidence);
  if (evidence.error) {
    return NextResponse.json({ error: evidence.error }, { status: 400 });
  }

  const authorRole = session.isAdmin ? "staff" : "user";

  // 1 сообщение в минуту для игроков
  if (!session.isAdmin) {
    const lastOwn = [...ticket.messages]
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

  const updated = await addSupportMessage(id, {
    authorDiscordId: session.discordId,
    authorUsername: session.username,
    authorRole,
    body: text,
    evidenceUrls: evidence.urls,
  });

  if (!updated) {
    return NextResponse.json({ error: "failed" }, { status: 400 });
  }

  const last = updated.messages.at(-1);
  if (last) {
    const label = session.isAdmin
      ? `${session.username} · Staff`
      : session.mcNick ?? session.username;
    await mirrorSupportMessageToDiscord(
      updated,
      last.id,
      label,
      text,
      evidence.urls,
    );
  }

  if (authorRole === "staff") {
    await createNotification({
      audience: "user",
      userId: ticket.discordId,
      title: `Ответ по тикету #${ticket.number}`,
      body: text.slice(0, 140),
      href: `/support/${ticket.id}`,
    });
    void dmSupportReply({
      discordId: ticket.discordId,
      ticketNumber: ticket.number,
      ticketId: ticket.id,
      preview: text,
      fromStaff: true,
    });
  } else {
    await createNotification({
      audience: "staff",
      title: `Тикет #${ticket.number}: сообщение игрока`,
      body: text.slice(0, 140),
      href: `/support/${ticket.id}`,
    });
  }

  return NextResponse.json({
    ticket: (await getSupportTicketById(id)) ?? updated,
  });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const ticket = await getSupportTicketById(id);
  if (!ticket) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await req.json();
  const status = body.status as SupportTicketStatus;

  if (!["open", "answered", "closed"].includes(status)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }

  const isOwner = ticket.discordId === session.discordId;
  if (!session.isAdmin) {
    if (!isOwner || status !== "closed") {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const updated = await updateSupportTicketStatus(
    id,
    status,
    session.username,
  );

  if (updated && status === "closed") {
    const closed = await closeSupportDiscordChannel(updated, session.username);
    if (session.isAdmin) {
      await createNotification({
        audience: "user",
        userId: ticket.discordId,
        title: `Тикет #${ticket.number} закрыт`,
        body: `Модератор ${session.username} закрыл тикет`,
        href: `/support/${ticket.id}`,
      });
      const base =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
        process.env.SITE_URL?.replace(/\/$/, "") ||
        "";
      const href = base ? `${base}/support/${ticket.id}` : undefined;
      void sendDiscordDm(ticket.discordId, {
        title: `🔒 Тикет #${ticket.number} закрыт`,
        description: [
          `Модератор ${session.username} закрыл тикет.`,
          href ? `\n[Открыть на сайте](${href})` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        color: 0x94a3b8,
        url: href,
      });
    } else {
      await createNotification({
        audience: "staff",
        title: `Тикет #${ticket.number} закрыт игроком`,
        body: ticket.subject,
        href: `/support/${ticket.id}`,
      });
    }
    return NextResponse.json({ ticket: closed });
  }
  if (updated && status === "open" && ticket.status === "closed") {
    const reopened = await reopenSupportDiscordChannel(updated);
    return NextResponse.json({ ticket: reopened });
  }

  return NextResponse.json({ ticket: updated });
}

import { NextRequest, NextResponse } from "next/server";
import { sendDiscordDm } from "@/lib/discord-bot";
import { createNotification } from "@/lib/notifications-db";
import {
  getSupportTicketById,
  updateSupportTicketStatus,
} from "@/lib/support-db";
import {
  closeSupportDiscordChannel,
  reopenSupportDiscordChannel,
} from "@/lib/support-bridge";

function actionSecretOk(req: NextRequest) {
  const secret =
    process.env.DISCORD_BOT_ACTION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("x-solar-bot-secret")?.trim();
  const auth = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return header === secret || auth === secret;
}

function ticketSiteUrl(ticketId: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.SITE_URL?.replace(/\/$/, "") ||
    "";
  return base ? `${base}/support/${ticketId}` : undefined;
}

/** Действия из Discord-кнопок (SOLARBOT) */
export async function POST(req: NextRequest) {
  if (!actionSecretOk(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const action = String(body.action ?? "");
  const ticketId = String(body.ticketId ?? "").trim();
  const by = String(body.by ?? "Discord").trim();

  if (!ticketId || !["close", "open"].includes(action)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const ticket = await getSupportTicketById(ticketId);
  if (!ticket) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (action === "close") {
    // уже закрыт — ок для кнопки Discord (повторный клик)
    if (ticket.status === "closed") {
      if (ticket.discordChannelId) {
        await closeSupportDiscordChannel(ticket, by);
      }
      return NextResponse.json({ ticket, channelDeleted: true, alreadyClosed: true });
    }

    const updated = await updateSupportTicketStatus(ticketId, "closed", by);
    const closed = updated
      ? await closeSupportDiscordChannel(updated, by)
      : ticket;
    await createNotification({
      audience: "user",
      userId: ticket.discordId,
      title: `Тикет #${ticket.number} закрыт`,
      body: `Модератор ${by} закрыл тикет «${ticket.subject}»`,
      href: `/support/${ticket.id}`,
    });
    const href = ticketSiteUrl(ticket.id);
    void sendDiscordDm(ticket.discordId, {
      title: `🔒 Тикет #${ticket.number} закрыт`,
      description: [
        `Модератор ${by} закрыл тикет.`,
        href ? `\n[Открыть на сайте](${href})` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      color: 0x94a3b8,
      url: href,
    });
    return NextResponse.json({ ticket: closed, channelDeleted: true });
  }

  const updated = await updateSupportTicketStatus(ticketId, "open", by);
  const reopened = updated
    ? await reopenSupportDiscordChannel(updated)
    : ticket;
  await createNotification({
    audience: "user",
    userId: ticket.discordId,
    title: `Тикет #${ticket.number} открыт`,
    body: `Модератор ${by} снова открыл тикет «${ticket.subject}»`,
    href: `/support/${ticket.id}`,
  });
  const href = ticketSiteUrl(ticket.id);
  void sendDiscordDm(ticket.discordId, {
    title: `🔓 Тикет #${ticket.number} снова открыт`,
    description: [
      `Модератор ${by} снова открыл тикет.`,
      href ? `\n[Открыть на сайте](${href})` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    color: 0xfff200,
    url: href,
  });
  return NextResponse.json({
    ticket: reopened,
    channelId: reopened.discordChannelId ?? null,
  });
}

import {
  deleteSupportChannel,
  dmSupportReply,
  fetchSupportChannelMessages,
  notifySupportTicket,
  postSupportChannelMessage,
} from "@/lib/discord-bot";
import { createNotification } from "@/lib/notifications-db";
import { supportCategoryLabels } from "@/lib/support-labels";
import {
  addSupportMessage,
  attachDiscordMessageId,
  getSupportTicketById,
  setSupportTicketChannel,
} from "@/lib/support-db";
import type { SupportTicket } from "@/lib/types";

const SITE_BRIDGE_PREFIX = "🌐 ";

/** Подтянуть новые сообщения из Discord-канала тикета на сайт */
export async function syncSupportTicketFromDiscord(
  ticket: SupportTicket,
): Promise<SupportTicket> {
  if (!ticket.discordChannelId || ticket.status === "closed") return ticket;

  const knownIds = new Set(
    ticket.messages
      .map((m) => m.discordMessageId)
      .filter((id): id is string => Boolean(id)),
  );

  const lastDiscordId = ticket.messages
    .map((m) => m.discordMessageId)
    .filter((id): id is string => Boolean(id))
    .sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1))
    .at(-1);

  const messages = await fetchSupportChannelMessages(
    ticket.discordChannelId,
    lastDiscordId,
  );

  let current = ticket;

  for (const msg of messages) {
    if (knownIds.has(msg.id)) continue;
    if (msg.authorBot) continue;
    if (!msg.content && msg.attachments.length === 0) continue;
    if (msg.content.startsWith(SITE_BRIDGE_PREFIX)) continue;

    const body = [msg.content, ...msg.attachments].filter(Boolean).join("\n");
    if (!body.trim()) continue;

    const authorRole =
      msg.authorId === ticket.discordId ? "user" : "staff";

    const updated = await addSupportMessage(
      ticket.id,
      {
        authorDiscordId: msg.authorId,
        authorUsername: msg.authorUsername,
        authorRole,
        body,
        discordMessageId: msg.id,
        createdAt: msg.createdAt,
      },
      authorRole === "staff" ? "answered" : undefined,
    );

    if (updated) {
      current = updated;
      knownIds.add(msg.id);

      if (authorRole === "staff") {
        await createNotification({
          audience: "user",
          userId: ticket.discordId,
          title: `Ответ по тикету #${ticket.number}`,
          body: body.slice(0, 140),
          href: `/support/${ticket.id}`,
        });
        void dmSupportReply({
          discordId: ticket.discordId,
          ticketNumber: ticket.number,
          ticketId: ticket.id,
          preview: body,
          fromStaff: true,
        });
      } else {
        await createNotification({
          audience: "staff",
          title: `Тикет #${ticket.number}: сообщение игрока`,
          body: body.slice(0, 140),
          href: `/support/${ticket.id}`,
        });
      }
    }
  }

  return (await getSupportTicketById(ticket.id)) ?? current;
}

/** Отправить сообщение с сайта в Discord-канал тикета */
export async function mirrorSupportMessageToDiscord(
  ticket: SupportTicket,
  messageId: string,
  authorLabel: string,
  body: string,
  evidenceUrls?: string[],
) {
  if (!ticket.discordChannelId) return;

  const lines = [
    `${SITE_BRIDGE_PREFIX}**${authorLabel}** (сайт):`,
    body,
  ];
  if (evidenceUrls?.length) {
    lines.push("", "Доказательства:", ...evidenceUrls);
  }

  const discordMessageId = await postSupportChannelMessage(
    ticket.discordChannelId,
    lines.join("\n"),
  );
  if (discordMessageId) {
    await attachDiscordMessageId(ticket.id, messageId, discordMessageId);
  }
}

export async function postSupportSystemToDiscord(
  ticket: SupportTicket,
  text: string,
) {
  if (!ticket.discordChannelId) return;
  await postSupportChannelMessage(
    ticket.discordChannelId,
    `${SITE_BRIDGE_PREFIX}${text}`,
  );
}

/** Закрытие: короткое сообщение и удаление Discord-канала */
export async function closeSupportDiscordChannel(
  ticket: SupportTicket,
  closedBy: string,
): Promise<SupportTicket> {
  if (!ticket.discordChannelId) return ticket;
  try {
    await postSupportSystemToDiscord(
      ticket,
      `🔒 Тикет закрыт (${closedBy}). Канал будет удалён.`,
    );
  } catch {
    /* канал мог уже пропасть */
  }
  try {
    await deleteSupportChannel(ticket.discordChannelId);
  } catch {
    /* ignore */
  }
  return (await setSupportTicketChannel(ticket.id, null)) ?? ticket;
}

/** Повторное открытие: создать новый Discord-канал */
export async function reopenSupportDiscordChannel(
  ticket: SupportTicket,
): Promise<SupportTicket> {
  if (ticket.discordChannelId) {
    await deleteSupportChannel(ticket.discordChannelId);
  }

  const first = ticket.messages[0];
  const channel = await notifySupportTicket({
    number: ticket.number,
    id: ticket.id,
    discordId: ticket.discordId,
    discordUsername: ticket.discordUsername,
    category: ticket.category,
    categoryLabel: supportCategoryLabels[ticket.category],
    subject: ticket.subject,
    body: first?.body ?? ticket.subject,
    evidenceUrls: ticket.evidenceUrls,
    rulePoint: ticket.rulePoint,
    incidentAt: ticket.incidentAt,
    reportedPlayer: ticket.reportedPlayer,
    mcNick: ticket.mcNick,
  });

  if (!channel?.channelId) return ticket;
  return (
    (await setSupportTicketChannel(ticket.id, channel.channelId)) ?? ticket
  );
}

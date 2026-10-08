import {
  fetchSupportChannelMessages,
  postSupportChannelMessage,
} from "@/lib/discord-bot";
import { createNotification } from "@/lib/notifications-db";
import {
  addApplicationMessage,
  attachApplicationDiscordMessageId,
  getApplicationById,
} from "@/lib/db";
import type { Application } from "@/lib/types";

const SITE_BRIDGE_PREFIX = "🌐 ";

/** Подтянуть сообщения из Discord-канала заявки на сайт */
export async function syncApplicationFromDiscord(
  app: Application,
): Promise<Application> {
  if (!app.discordChannelId || app.status !== "pending") return app;

  const knownIds = new Set(
    (app.messages ?? [])
      .map((m) => m.discordMessageId)
      .filter((id): id is string => Boolean(id)),
  );

  const lastDiscordId = (app.messages ?? [])
    .map((m) => m.discordMessageId)
    .filter((id): id is string => Boolean(id))
    .sort((a, b) => (BigInt(a) < BigInt(b) ? -1 : 1))
    .at(-1);

  const messages = await fetchSupportChannelMessages(
    app.discordChannelId,
    lastDiscordId,
  );

  let current = app;

  for (const msg of messages) {
    if (knownIds.has(msg.id)) continue;
    if (msg.authorBot) continue;
    if (!msg.content && msg.attachments.length === 0) continue;
    if (msg.content.startsWith(SITE_BRIDGE_PREFIX)) continue;

    const body = [msg.content, ...msg.attachments].filter(Boolean).join("\n");
    if (!body.trim()) continue;

    const authorRole =
      msg.authorId === app.discordId ? "user" : "staff";

    const updated = await addApplicationMessage(app.id, {
      authorDiscordId: msg.authorId,
      authorUsername: msg.authorUsername,
      authorRole,
      body,
      discordMessageId: msg.id,
      createdAt: msg.createdAt,
    });

    if (updated) {
      current = updated;
      knownIds.add(msg.id);

      if (authorRole === "staff") {
        await createNotification({
          audience: "user",
          userId: app.discordId,
          title: `Сообщение по заявке #${app.ticketNumber ?? ""}`.trim(),
          body: body.slice(0, 140),
          href: `/applications/${app.id}`,
        });
      }
    }
  }

  return (await getApplicationById(app.id)) ?? current;
}

export async function mirrorApplicationMessageToDiscord(
  app: Application,
  messageId: string,
  authorLabel: string,
  body: string,
) {
  if (!app.discordChannelId) return;
  const discordMessageId = await postSupportChannelMessage(
    app.discordChannelId,
    `${SITE_BRIDGE_PREFIX}**${authorLabel}** (сайт):\n${body}`,
  );
  if (discordMessageId) {
    await attachApplicationDiscordMessageId(app.id, messageId, discordMessageId);
  }
}

import { discordConfig } from "@/lib/bot-config";
import { nextApplicationTicketNumber } from "@/lib/ticket-counter";
import {
  isAdminRequestChannel,
  isPassApplicationEmbedTitle,
  isPassTicketChannelName,
  parsePassTicketNumber,
  PASS_TICKET_PREFIX,
} from "@/lib/pass-applications";
import { allRoleIds, roleIdsFromKeys } from "@/lib/roles";
import type { ProjectRoleKey } from "@/lib/roles";
import type { Application, ApplicationStatus } from "./types";

const DISCORD_API = "https://discord.com/api/v10";

const PERM_VIEW = 1024;
const PERM_SEND = 2048;
const PERM_HISTORY = 65536;
const PERM_ATTACH = 32768;
const PERM_EMBED = 16384;
const PERM_MANAGE_CH = 16;
const PERM_MANAGE_MSG = 8192;

function botHeaders() {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return null;
  return {
    Authorization: `Bot ${token}`,
    "Content-Type": "application/json",
  };
}

function allowBits(...bits: number[]) {
  return String(bits.reduce((a, b) => a | b, 0));
}

async function getBotUserId(headers: HeadersInit) {
  const res = await fetch(`${DISCORD_API}/users/@me`, { headers, cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { id: string };
  return data.id;
}

export async function isGuildMember(discordId: string) {
  const headers = botHeaders();
  if (!headers) return false;
  const res = await fetch(
    `${DISCORD_API}/guilds/${discordConfig.guildId}/members/${discordId}`,
    { headers, cache: "no-store" },
  );
  return res.ok;
}

export async function notifyApplicationTicket(app: Application) {
  const headers = botHeaders();
  if (!headers) return null;

  const botId = await getBotUserId(headers);
  if (!botId) return null;

  const ticketNumber = await nextApplicationTicketNumber();
  const channelName = `${PASS_TICKET_PREFIX}${ticketNumber}`;

  // Игрока в канал не добавляем — переписка на сайте; вручную (+) при необходимости
  const staffAllow = allowBits(
    PERM_VIEW,
    PERM_SEND,
    PERM_HISTORY,
    PERM_ATTACH,
    PERM_EMBED,
  );
  const botAllow = allowBits(
    PERM_VIEW,
    PERM_SEND,
    PERM_HISTORY,
    PERM_ATTACH,
    PERM_EMBED,
    PERM_MANAGE_CH,
    PERM_MANAGE_MSG,
  );

  const channelRes = await fetch(
    `${DISCORD_API}/guilds/${discordConfig.guildId}/channels`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        name: channelName,
        type: 0,
        parent_id: discordConfig.applicationCategoryId,
        topic: `solarbot_applicant:${app.discordId}\nsolarsite_app:${app.id}`,
        permission_overwrites: [
          {
            id: discordConfig.guildId,
            type: 0,
            deny: allowBits(PERM_VIEW),
          },
          {
            id: discordConfig.staffRoleId,
            type: 0,
            allow: staffAllow,
          },
          {
            id: discordConfig.adminRoleId,
            type: 0,
            allow: staffAllow,
          },
          {
            id: botId,
            type: 1,
            allow: botAllow,
          },
        ],
      }),
    },
  );

  if (!channelRes.ok) return null;
  const channel = (await channelRes.json()) as { id: string; name: string };

  const avatarUrl = app.discordAvatar?.startsWith("http")
    ? app.discordAvatar
    : app.discordAvatar
      ? `https://cdn.discordapp.com/avatars/${app.discordId}/${app.discordAvatar}.png`
      : undefined;

  const siteBase =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.SITE_URL?.replace(/\/$/, "") ||
    "";
  const siteAppUrl = siteBase
    ? `${siteBase}/applications/${app.id}`
    : `/applications/${app.id}`;

  const embed = {
    title: "📋 Заявка на проходку (сайт)",
    color: 0xffe566,
    fields: [
      { name: "Ник Minecraft", value: app.mcNick.slice(0, 1024), inline: false },
      { name: "Имя", value: app.realName.slice(0, 1024), inline: false },
      { name: "Возраст", value: app.age.slice(0, 1024), inline: false },
      { name: "Прочитал правила", value: app.rulesRead.slice(0, 1024), inline: false },
      { name: "Часы (будни)", value: app.weekdayHours.slice(0, 1024), inline: false },
      { name: "Часы (выходные)", value: app.weekendHours.slice(0, 1024), inline: false },
      { name: "Хобби / спорт", value: app.hobby.slice(0, 1024), inline: false },
      { name: "Откуда узнал", value: app.source.slice(0, 1024), inline: false },
      { name: "Идея проекта", value: app.ideaKnown.slice(0, 1024), inline: false },
      ...(app.aboutSelf
        ? [{ name: "О себе", value: app.aboutSelf.slice(0, 1024), inline: false }]
        : []),
      ...(app.experience
        ? [{ name: "Опыт в Minecraft", value: app.experience.slice(0, 1024), inline: false }]
        : []),
      ...(app.plans
        ? [{ name: "Планы на сервере", value: app.plans.slice(0, 1024), inline: false }]
        : []),
      {
        name: "Discord",
        value: `<@${app.discordId}> (${app.discordUsername})`,
        inline: false,
      },
      {
        name: "Переписка",
        value: `[Чат на сайте](${siteAppUrl})\nИгрок **не** в канале — добавь вручную (+), если нужен диалог в Discord.`,
        inline: false,
      },
    ],
    thumbnail: avatarUrl ? { url: avatarUrl } : undefined,
    footer: { text: `ID: ${app.discordId} • Solar` },
    timestamp: app.createdAt,
  };

  const components = [
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 3,
          label: "Одобрить",
          custom_id: `sapp_a:${channel.id}`,
          emoji: { name: "✅" },
        },
        {
          type: 2,
          style: 4,
          label: "Отказать",
          custom_id: `sapp_r:${channel.id}`,
          emoji: { name: "❌" },
        },
        {
          type: 2,
          style: 2,
          label: "Удалить заявку",
          custom_id: `sapp_d:${channel.id}`,
          emoji: { name: "🗑️" },
        },
      ],
    },
  ];

  const msgRes = await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      content: `<@&${discordConfig.staffRoleId}> новая заявка с сайта`,
      embeds: [embed],
      components,
      allowed_mentions: { roles: [discordConfig.staffRoleId] },
    }),
  });

  if (!msgRes.ok) return { channelId: channel.id, ticketNumber };

  const msg = (await msgRes.json()) as { id: string };

  await fetch(`${DISCORD_API}/channels/${channel.id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({
      topic: `solarbot_applicant:${app.discordId}\nsolarbot_msg:${msg.id}\nsolarsite_app:${app.id}`,
    }),
  });

  await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      content:
        "💬 Сообщения с сайта появятся здесь. Одобрение/отказ — кнопками выше. Игрок в канал не добавлен — при необходимости добавь вручную (+).",
    }),
  });

  return { channelId: channel.id, ticketNumber };
}

export async function syncSiteRolesToDiscord(discordId: string, keys: ProjectRoleKey[]) {
  const roleIds = roleIdsFromKeys(keys);
  return setMemberRoles(discordId, roleIds);
}

export async function setMemberWhitelist(discordId: string, approved: boolean) {
  const headers = botHeaders();
  if (!headers) return false;

  const memberRes = await fetch(
    `${DISCORD_API}/guilds/${discordConfig.guildId}/members/${discordId}`,
    { headers },
  );
  if (!memberRes.ok) return false;

  const member = (await memberRes.json()) as { roles: string[] };
  const roles = new Set(member.roles);

  if (approved) {
    roles.add(discordConfig.approvedRoleId);
  } else {
    roles.delete(discordConfig.approvedRoleId);
  }

  const patchRes = await fetch(
    `${DISCORD_API}/guilds/${discordConfig.guildId}/members/${discordId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ roles: [...roles] }),
    },
  );

  return patchRes.ok;
}

export async function setMemberRoles(discordId: string, roleIds: string[]) {
  const headers = botHeaders();
  if (!headers) return false;

  const memberRes = await fetch(
    `${DISCORD_API}/guilds/${discordConfig.guildId}/members/${discordId}`,
    { headers },
  );
  if (!memberRes.ok) return false;

  const member = (await memberRes.json()) as { roles: string[] };
  const managed = new Set(roleIds);
  const keep = member.roles.filter((r) => !allRoleIds().includes(r));
  const patchRes = await fetch(
    `${DISCORD_API}/guilds/${discordConfig.guildId}/members/${discordId}`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({ roles: [...new Set([...keep, ...managed])] }),
    },
  );
  return patchRes.ok;
}


export function parseEmbedToApplication(
  embed: {
    title?: string;
    fields?: { name: string; value: string }[];
    timestamp?: string;
  },
  channel: {
    id: string;
    name: string;
    topic?: string | null;
  },
  status: ApplicationStatus = "pending",
): Application | null {
  if (isAdminRequestChannel(channel)) return null;
  if (!isPassApplicationEmbedTitle(embed.title)) return null;

  const fields = embed.fields ?? [];
  const get = (name: string) =>
    fields.find((f) => f.name.toLowerCase().includes(name.toLowerCase()))
      ?.value ?? "—";

  const discordField = get("discord");
  const discordIdMatch =
    channel.topic?.match(/solarbot_applicant:(\d+)/) ??
    discordField.match(/<@!?(\d+)>/);

  const discordId = discordIdMatch?.[1];
  if (!discordId) return null;

  const mcNick = get("ник minecraft");
  if (!mcNick.trim() || mcNick === "—") return null;

  return {
    id: `discord-${channel.id}`,
    kind: "pass",
    ticketNumber: parsePassTicketNumber(channel.name),
    discordId,
    discordUsername: discordField.replace(/<@!?\d+>/g, "").trim() || "Игрок",
    mcNick,
    realName: get("имя"),
    age: get("возраст"),
    rulesRead: get("правила"),
    weekdayHours: get("будни"),
    weekendHours: get("выходные"),
    hobby: get("хобби"),
    source: get("узнал"),
    ideaKnown: get("идея"),
    aboutSelf: get("о себе") !== "—" ? get("о себе") : undefined,
    experience: get("опыт") !== "—" ? get("опыт") : undefined,
    plans: get("планы") !== "—" ? get("планы") : undefined,
    status,
    sourceChannel: "discord",
    discordChannelId: channel.id,
    createdAt: embed.timestamp ?? new Date().toISOString(),
  };
}

export async function notifySupportTicket(ticket: {
  number: number;
  id: string;
  discordId: string;
  discordUsername: string;
  category: string;
  subject: string;
  body: string;
  categoryLabel?: string;
  evidenceUrls?: string[];
  rulePoint?: string;
  incidentAt?: string;
  reportedPlayer?: string;
  mcNick?: string;
}): Promise<{ channelId: string } | null> {
  const headers = botHeaders();
  if (!headers) return null;

  const botId = await getBotUserId(headers);
  if (!botId) return null;

  const parentId =
    process.env.DISCORD_SUPPORT_CATEGORY_ID?.trim() ||
    discordConfig.supportCategoryId;

  const channelName = `web-support-${ticket.number}`;
  // Игрока в канал не добавляем — переписка на сайте; вручную (+) при необходимости
  const staffAllow = allowBits(
    PERM_VIEW,
    PERM_SEND,
    PERM_HISTORY,
    PERM_ATTACH,
    PERM_EMBED,
  );
  const botAllow = allowBits(
    PERM_VIEW,
    PERM_SEND,
    PERM_HISTORY,
    PERM_ATTACH,
    PERM_EMBED,
    PERM_MANAGE_CH,
    PERM_MANAGE_MSG,
  );

  const channelRes = await fetch(`${DISCORD_API}/guilds/${discordConfig.guildId}/channels`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: channelName,
      type: 0,
      parent_id: parentId,
      topic: `solarsupport:${ticket.id}\nsolarsupport_user:${ticket.discordId}`,
      permission_overwrites: [
        {
          id: discordConfig.guildId,
          type: 0,
          deny: allowBits(PERM_VIEW),
        },
        {
          id: discordConfig.staffRoleId,
          type: 0,
          allow: staffAllow,
        },
        {
          id: discordConfig.adminRoleId,
          type: 0,
          allow: staffAllow,
        },
        {
          id: botId,
          type: 1,
          allow: botAllow,
        },
      ],
    }),
  });

  if (!channelRes.ok) {
    // fallback: старый способ — пост в help-канал
    const helpId = discordConfig.helpChannelId;
    if (helpId) {
      await fetch(`${DISCORD_API}/channels/${helpId}/messages`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content: `<@&${discordConfig.staffRoleId}> не удалось создать канал тикета #${ticket.number}`,
          embeds: [
            {
              title: `Тикет #${ticket.number} — ${ticket.subject.slice(0, 80)}`,
              description: ticket.body.slice(0, 1500),
              color: 0xfff200,
            },
          ],
        }),
      });
    }
    return null;
  }

  const channel = (await channelRes.json()) as { id: string };

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.SITE_URL?.replace(/\/$/, "") ||
    "";
  const supportLink = siteUrl ? `${siteUrl}/support` : "/support";
  const adminLink = siteUrl ? `${siteUrl}/admin` : "/admin";

  const fields: { name: string; value: string; inline?: boolean }[] = [
    {
      name: "Игрок",
      value: `<@${ticket.discordId}> (${ticket.discordUsername})`,
      inline: true,
    },
    {
      name: "Категория",
      value: ticket.categoryLabel ?? ticket.category,
      inline: true,
    },
  ];
  if (ticket.mcNick) {
    fields.push({ name: "MC ник", value: ticket.mcNick, inline: true });
  }
  if (ticket.reportedPlayer) {
    fields.push({ name: "Нарушитель", value: ticket.reportedPlayer, inline: true });
  }
  if (ticket.rulePoint) {
    fields.push({ name: "Пункт правил", value: ticket.rulePoint, inline: true });
  }
  if (ticket.incidentAt) {
    fields.push({
      name: "Когда",
      value: new Date(ticket.incidentAt).toLocaleString("ru-RU"),
      inline: true,
    });
  }
  if (ticket.evidenceUrls?.length) {
    fields.push({
      name: "Доказательства",
      value: ticket.evidenceUrls.join("\n").slice(0, 1024),
      inline: false,
    });
  }
  fields.push({
    name: "На сайте",
    value: `[Тикет игрока](${supportLink}) · [Админка](${adminLink})\nИгрок **не** в канале — добавь вручную (+), если нужен диалог в Discord.`,
    inline: false,
  });

  await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      content: `<@&${discordConfig.staffRoleId}> новый тикет на сайте`,
      embeds: [
        {
          title: `Тикет #${ticket.number} — ${ticket.subject.slice(0, 80)}`,
          description: ticket.body.slice(0, 1500),
          color: 0xfff200,
          fields,
          footer: { text: `ID: ${ticket.id}` },
          timestamp: new Date().toISOString(),
        },
      ],
      components: [
        {
          type: 1,
          components: [
            {
              type: 2,
              style: 4,
              label: "Закрыть тикет",
              custom_id: `ssup_c:${ticket.id}`,
              emoji: { name: "🔒" },
            },
            {
              type: 2,
              style: 3,
              label: "Открыть снова",
              custom_id: `ssup_o:${ticket.id}`,
              emoji: { name: "🔓" },
            },
          ],
        },
      ],
      allowed_mentions: {
        roles: [discordConfig.staffRoleId],
      },
    }),
  });

  await fetch(`${DISCORD_API}/channels/${channel.id}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      content:
        "Переписка с игроком — на сайте `/support` (сообщения сюда зеркалятся). Игрок в канал не добавлен. Кнопки выше — закрыть/открыть.",
    }),
  });

  return { channelId: channel.id };
}

/** Удалить Discord-канал тикета после закрытия */
export async function deleteSupportChannel(channelId: string): Promise<boolean> {
  const headers = botHeaders();
  if (!headers) return false;
  const res = await fetch(`${DISCORD_API}/channels/${channelId}`, {
    method: "DELETE",
    headers,
  });
  return res.ok || res.status === 404;
}

export async function postSupportChannelMessage(
  channelId: string,
  content: string,
): Promise<string | null> {
  const headers = botHeaders();
  if (!headers) return null;
  const res = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({ content: content.slice(0, 1900) }),
  });
  if (!res.ok) return null;
  const msg = (await res.json()) as { id: string };
  return msg.id;
}

export type DiscordChannelMessage = {
  id: string;
  content: string;
  authorId: string;
  authorUsername: string;
  authorBot: boolean;
  createdAt: string;
  attachments: string[];
};

export async function fetchSupportChannelMessages(
  channelId: string,
  afterMessageId?: string,
): Promise<DiscordChannelMessage[]> {
  const headers = botHeaders();
  if (!headers) return [];

  const params = new URLSearchParams({ limit: "50" });
  if (afterMessageId) params.set("after", afterMessageId);

  const res = await fetch(
    `${DISCORD_API}/channels/${channelId}/messages?${params}`,
    { headers, cache: "no-store" },
  );
  if (!res.ok) return [];

  const raw = (await res.json()) as Array<{
    id: string;
    content?: string;
    timestamp: string;
    author: { id: string; username: string; bot?: boolean };
    attachments?: Array<{ url: string }>;
    embeds?: unknown[];
  }>;

  // Discord отдаёт от новых к старым — разворачиваем
  return raw
    .slice()
    .reverse()
    .map((m) => ({
      id: m.id,
      content: (m.content ?? "").trim(),
      authorId: m.author.id,
      authorUsername: m.author.username,
      authorBot: Boolean(m.author.bot),
      createdAt: m.timestamp,
      attachments: (m.attachments ?? []).map((a) => a.url),
    }));
}

function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.SITE_URL?.replace(/\/$/, "") ||
    ""
  );
}

/** Личное сообщение от бота (если у пользователя открыты ЛС) */
export async function sendDiscordDm(
  discordId: string,
  embed: {
    title: string;
    description: string;
    color?: number;
    url?: string;
  },
): Promise<boolean> {
  const headers = botHeaders();
  if (!headers) return false;

  const dmRes = await fetch(`${DISCORD_API}/users/@me/channels`, {
    method: "POST",
    headers,
    body: JSON.stringify({ recipient_id: discordId }),
  });
  if (!dmRes.ok) return false;

  const dm = (await dmRes.json()) as { id: string };
  const msgRes = await fetch(`${DISCORD_API}/channels/${dm.id}/messages`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      embeds: [
        {
          title: embed.title.slice(0, 256),
          description: embed.description.slice(0, 4000),
          color: embed.color ?? 0xfff200,
          url: embed.url,
          footer: { text: "SolarMC" },
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  });
  return msgRes.ok;
}

export async function dmSupportReply(input: {
  discordId: string;
  ticketNumber: number;
  ticketId: string;
  preview: string;
  fromStaff: boolean;
  /** По умолчанию support; для заявок — applications */
  kind?: "support" | "application";
}) {
  const base = siteBaseUrl();
  const kind = input.kind ?? "support";
  const href = base
    ? `${base}/${kind === "application" ? "applications" : "support"}/${input.ticketId}`
    : undefined;
  const label = kind === "application" ? "заявке" : "тикету";
  const num = input.ticketNumber ? `#${input.ticketNumber}` : "";
  return sendDiscordDm(input.discordId, {
    title: input.fromStaff
      ? `💬 Ответ по ${label} ${num}`.trim()
      : `💬 Новое сообщение в ${label} ${num}`.trim(),
    description: [
      input.preview.slice(0, 300) || "Новое сообщение",
      href ? `\n[Открыть на сайте](${href})` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    color: 0xfff200,
    url: href,
  });
}

export async function dmApplicationDecision(input: {
  discordId: string;
  approved: boolean;
  mcNick?: string;
  reason?: string;
}) {
  const base = siteBaseUrl();
  const profile = base ? `${base}/profile` : undefined;
  if (input.approved) {
    return sendDiscordDm(input.discordId, {
      title: "✅ Заявка одобрена",
      description: [
        "Твоя заявка на проходку SolarMC **одобрена**.",
        input.mcNick ? `Ник: **${input.mcNick}**` : "",
        "Заходи на сервер — роль Player выдана.",
        profile ? `\n[Личный кабинет](${profile})` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      color: 0x4ade80,
      url: profile,
    });
  }
  return sendDiscordDm(input.discordId, {
    title: "❌ Заявка отклонена",
    description: [
      "Твоя заявка на проходку SolarMC **отклонена**.",
      input.reason ? `Причина: ${input.reason}` : "Причина не указана.",
      "Можно подать новую через 24 часа.",
      profile ? `\n[Личный кабинет](${profile})` : "",
    ]
      .filter(Boolean)
      .join("\n"),
    color: 0xf87171,
    url: profile,
  });
}

export { isPassTicketChannelName, parsePassTicketNumber };

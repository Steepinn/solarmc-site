import botSync from "@/config/bot-sync.json";

function id(v: unknown, fallback: string) {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
}

export const botConfig = botSync as {
  brandName: string;
  guildId: string;
  channels: Record<string, string | null>;
  applications: {
    staff_role_id?: string;
    approved_role_id?: string;
    ticket_category_id?: string;
    cooldown_hours?: number;
  };
  discord?: {
    moderator_role_id?: string;
    admin_role_id?: string;
    approved_role_id?: string;
  };
  roles: Record<string, string | null>;
  welcome: Record<string, string>;
  serverInfo: {
    ip: string;
    port: string;
    dynmap: string;
    wiki: string;
    monitoring: string;
    help: string;
  };
  colors: Record<string, string>;
};

const moderatorRoleId =
  process.env.DISCORD_MODERATOR_ROLE_ID ??
  botConfig.discord?.moderator_role_id ??
  botConfig.applications.staff_role_id ??
  "1480602248831696987";

const adminRoleId =
  process.env.DISCORD_ADMIN_ROLE_ID ??
  botConfig.discord?.admin_role_id ??
  "1466352163398619293";

export const discordConfig = {
  guildId: id(process.env.DISCORD_GUILD_ID, botConfig.guildId),
  staffRoleIds: [moderatorRoleId, adminRoleId],
  moderatorRoleId,
  adminRoleId,
  staffRoleId: moderatorRoleId,
  approvedRoleId: id(
    process.env.DISCORD_APPROVED_ROLE_ID,
    botConfig.discord?.approved_role_id ??
      botConfig.applications.approved_role_id ??
      "1466352891932577926",
  ),
  /** Роль «Странник» — снимается при выдаче Player. */
  strangerRoleId: process.env.DISCORD_STRANGER_ROLE_ID?.trim() || "",
  applicationCategoryId: id(
    process.env.DISCORD_APPLICATION_CATEGORY_ID,
    botConfig.applications.ticket_category_id ?? "1487428372220088452",
  ),
  applicationsChannelId: botConfig.channels.applications
    ? id(botConfig.channels.applications, "")
    : null,
  statusChannelId: id(
    process.env.DISCORD_STATUS_CHANNEL_ID,
    botConfig.channels.status ?? "1487395981480956047",
  ),
  helpChannelId: (() => {
    const fromEnv = process.env.DISCORD_HELP_CHANNEL_ID?.trim();
    if (fromEnv) return fromEnv;
    const match = botConfig.serverInfo.help?.match(/\/channels\/\d+\/(\d+)/);
    return match?.[1] ?? "1487647305594306661";
  })(),
  supportCategoryId:
    process.env.DISCORD_SUPPORT_CATEGORY_ID?.trim() ||
    "1487647069416980531",
};

export const serverConfig = {
  ip: process.env.MINECRAFT_SERVER_IP ?? botConfig.serverInfo.ip,
  port: Number(process.env.MINECRAFT_SERVER_PORT ?? botConfig.serverInfo.port),
  dynmap: botConfig.serverInfo.dynmap,
  wiki: botConfig.serverInfo.wiki,
  monitoring: botConfig.serverInfo.monitoring,
  solardsUrl:
    process.env.SOLARDS_API_URL?.trim() ||
    `http://${process.env.MINECRAFT_SERVER_IP ?? botConfig.serverInfo.ip}:${process.env.SOLARDS_PORT ?? "8080"}`,
  solardsPort: Number(process.env.SOLARDS_PORT ?? "8080"),
};

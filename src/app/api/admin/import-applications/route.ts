import { NextResponse } from "next/server";
import { upsertApplications } from "@/lib/db";
import { parseEmbedToApplication } from "@/lib/discord-bot";
import { getEnrichedSession } from "@/lib/auth";
import { discordConfig } from "@/lib/bot-config";
import {
  isAdminRequestChannel,
  isPassApplicationEmbedTitle,
  isPassTicketChannelName,
} from "@/lib/pass-applications";
import type { ApplicationStatus } from "@/lib/types";

const DISCORD_API = "https://discord.com/api/v10";

export async function POST() {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "no_bot_token" }, { status: 500 });
  }

  const headers = { Authorization: `Bot ${token}` };

  const channelsRes = await fetch(
    `${DISCORD_API}/guilds/${discordConfig.guildId}/channels`,
    { headers },
  );
  if (!channelsRes.ok) {
    return NextResponse.json({ error: "channels_failed" }, { status: 502 });
  }

  const channels = (await channelsRes.json()) as {
    id: string;
    name: string;
    topic?: string | null;
    parent_id?: string;
  }[];

  const ticketChannels = channels.filter(
    (c) =>
      isPassTicketChannelName(c.name) &&
      c.parent_id === discordConfig.applicationCategoryId &&
      !isAdminRequestChannel(c),
  );

  const imported = [];

  for (const channel of ticketChannels) {
    const messagesRes = await fetch(
      `${DISCORD_API}/channels/${channel.id}/messages?limit=10`,
      { headers },
    );
    if (!messagesRes.ok) continue;

    const messages = (await messagesRes.json()) as {
      embeds?: { title?: string; fields?: { name: string; value: string }[]; timestamp?: string }[];
      content?: string;
    }[];

    const embedMsg = messages.find((m) =>
      m.embeds?.some((e) => isPassApplicationEmbedTitle(e.title)),
    );
    if (!embedMsg?.embeds?.[0]) continue;

    let status: ApplicationStatus = "pending";
    const content = messages.map((m) => m.content ?? "").join("\n").toLowerCase();
    if (content.includes("одобр") || content.includes("approved")) {
      status = "approved";
    } else if (content.includes("отклон") || content.includes("отказ")) {
      status = "rejected";
    }

    const app = parseEmbedToApplication(
      embedMsg.embeds[0],
      channel,
      status,
    );
    if (app) imported.push(app);
  }

  const saved = await upsertApplications(imported);
  return NextResponse.json({ imported: imported.length, total: saved.length });
}

import fs from "fs";
import path from "path";

const DISCORD_API = "https://discord.com/api/v10";
const GUILD_ID = "1466351394523971620";
const CATEGORY_ID = "1487428372220088452";

const PASS_TICKET_PREFIX = "заявка-";
const PASS_TICKET_PREFIX_LATIN = "zayavka-";
const ADMIN_REQUEST_PREFIX = "запрос-";
const ADMIN_REQUEST_TOPIC = "solarbot_kind:admin_request";
const PASS_EMBED_TITLE = "Заявка на проходку";

function isAdminRequestChannel(channel) {
  if (channel.topic?.includes(ADMIN_REQUEST_TOPIC)) return true;
  return channel.name?.startsWith(ADMIN_REQUEST_PREFIX);
}

function isPassTicketChannelName(name) {
  return (
    name?.startsWith(PASS_TICKET_PREFIX) ||
    name?.startsWith(PASS_TICKET_PREFIX_LATIN)
  );
}

function parsePassTicketNumber(name) {
  const match = name.match(/(?:заявка|zayavka)-(\d+)/u);
  return match ? Number(match[1]) : undefined;
}

function isPassApplicationEmbedTitle(title) {
  return Boolean(title?.includes(PASS_EMBED_TITLE));
}

function loadToken() {
  const envLocal = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envLocal)) {
    for (const line of fs.readFileSync(envLocal, "utf8").split("\n")) {
      const m = line.match(/^DISCORD_BOT_TOKEN=(.+)$/);
      if (m?.[1]) return m[1].trim();
    }
  }
  const botEnv = path.join("C:", "Python", "SOLARBOT", ".env");
  if (fs.existsSync(botEnv)) {
    for (const line of fs.readFileSync(botEnv, "utf8").split("\n")) {
      const m = line.match(/^DISCORD_BOT_TOKEN=(.+)$/);
      if (m?.[1]) return m[1].trim();
    }
  }
  return process.env.DISCORD_BOT_TOKEN;
}

function parseEmbed(embed, channel) {
  if (isAdminRequestChannel(channel)) return null;
  if (!isPassApplicationEmbedTitle(embed.title)) return null;

  const fields = embed.fields ?? [];
  const get = (name) =>
    fields.find((f) => f.name.toLowerCase().includes(name.toLowerCase()))?.value ??
    "—";

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
    status: "pending",
    sourceChannel: "discord",
    discordChannelId: channel.id,
    createdAt: embed.timestamp ?? new Date().toISOString(),
  };
}

async function main() {
  const token = loadToken();
  if (!token) {
    console.error("DISCORD_BOT_TOKEN not found");
    process.exit(1);
  }

  const headers = { Authorization: `Bot ${token}` };

  const channelsRes = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/channels`, {
    headers,
  });
  if (!channelsRes.ok) {
    console.error("Failed to fetch channels", await channelsRes.text());
    process.exit(1);
  }

  const channels = await channelsRes.json();
  const ticketChannels = channels.filter(
    (c) =>
      isPassTicketChannelName(c.name) &&
      c.parent_id === CATEGORY_ID &&
      !isAdminRequestChannel(c),
  );

  console.log(`Found ${ticketChannels.length} pass ticket channels`);

  const imported = [];
  for (const channel of ticketChannels) {
    const messagesRes = await fetch(
      `${DISCORD_API}/channels/${channel.id}/messages?limit=10`,
      { headers },
    );
    if (!messagesRes.ok) continue;

    const messages = await messagesRes.json();
    const embedMsg = messages.find((m) =>
      m.embeds?.some((e) => isPassApplicationEmbedTitle(e.title)),
    );
    if (!embedMsg?.embeds?.[0]) continue;

    const content = messages.map((m) => m.content ?? "").join("\n").toLowerCase();
    const app = parseEmbed(embedMsg.embeds[0], channel);
    if (!app) continue;

    if (content.includes("одобр") || content.includes("approved")) {
      app.status = "approved";
    } else if (content.includes("отклон") || content.includes("отказ")) {
      app.status = "rejected";
    }

    imported.push(app);
  }

  const outPath = path.join(process.cwd(), "data", "applications.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });

  let existing = [];
  if (fs.existsSync(outPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(outPath, "utf8")).applications ?? [];
    } catch {
      existing = [];
    }
  }

  const validExisting = existing.filter(
    (a) =>
      a.kind !== "admin_request" &&
      a.mcNick?.trim() &&
      a.mcNick !== "—" &&
      !String(a.id).startsWith("history-"),
  );

  const byId = new Map(validExisting.map((a) => [a.id, a]));
  for (const app of imported) byId.set(app.id, app);

  const merged = [...byId.values()];
  fs.writeFileSync(outPath, JSON.stringify({ applications: merged }, null, 2));
  console.log(
    `Imported ${imported.length} pass applications (${merged.length} total) -> ${outPath}`,
  );
}

main();

import fs from "fs";
import path from "path";

const BOT_DIR = process.env.SOLARBOT_PATH ?? "C:\\Python\\SOLARBOT";
const SOLARDS_DIR = process.env.SOLARDS_PATH ?? "C:\\плагины cAI\\SOLARDS";
const configPath = path.join(BOT_DIR, "config.json");
const solardsConfigPath = path.join(SOLARDS_DIR, "src", "main", "resources", "config.yml");
const botEnvPath = path.join(BOT_DIR, ".env");
const outConfig = path.join(process.cwd(), "src", "config", "bot-sync.json");
const envLocal = path.join(process.cwd(), ".env.local");

function parseEnv(content) {
  const env = {};
  for (const line of content.split("\n")) {
    if (line.startsWith("#")) continue;
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return parseEnv(fs.readFileSync(filePath, "utf8"));
}

function parseBotConfig(text) {
  const cfg = JSON.parse(text);
  const guildMatch = text.match(/"test_guild_ids"\s*:\s*\[\s*(\d{15,})/);
  if (guildMatch) {
    cfg.test_guild_ids = [guildMatch[1]];
  }
  return cfg;
}

function snowflake(v, fallback = "") {
  if (v === null || v === undefined || v === "") return fallback;
  return String(v);
}

function stringifyDeepIds(value) {
  if (Array.isArray(value)) return value.map(stringifyDeepIds);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (typeof v === "number" && v > 1e15) out[k] = String(v);
      else if (typeof v === "object") out[k] = stringifyDeepIds(v);
      else out[k] = v;
    }
    return out;
  }
  return value;
}

async function fetchDiscordAppId(token) {
  const res = await fetch("https://discord.com/api/v10/oauth2/applications/@me", {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.id;
}

function extractServerIp(description) {
  const m = description.match(/(\d{1,3}(?:\.\d{1,3}){3}):(\d{2,5})/);
  if (!m) return null;
  return { ip: m[1], port: m[2] };
}

async function main() {
  if (!fs.existsSync(configPath)) {
    console.error("Bot config not found:", configPath);
    process.exit(1);
  }

  const cfg = parseBotConfig(fs.readFileSync(configPath, "utf8"));
  const botEnv = readEnvFile(botEnvPath);
  const localEnv = readEnvFile(envLocal);
  const token = localEnv.DISCORD_BOT_TOKEN ?? botEnv.DISCORD_BOT_TOKEN ?? "";

  let solardsYaml = "";
  if (fs.existsSync(solardsConfigPath)) {
    solardsYaml = fs.readFileSync(solardsConfigPath, "utf8");
  }

  const solardsModerator = solardsYaml.match(/support-moderator-role-id:\s*"?(\d+)"?/)?.[1] ?? "";
  const solardsAdmin = solardsYaml.match(/support-admin-role-id:\s*"?(\d+)"?/)?.[1] ?? "";
  const solardsApproved = solardsYaml.match(/required-role-id:\s*"?(\d+)"?/)?.[1] ?? "";
  const solardsStatusChannel =
    solardsYaml.match(/status-channel-id:\s*"?(\d+)"?/)?.[1] ?? "1487395981480956047";
  const solardsApiPort = solardsYaml.match(/^\s*port:\s*(\d+)\s*$/m)?.[1] ?? "8080";
  const solardsApiToken =
    solardsYaml.match(/^\s*token:\s*"?([^"\n#]+)"?\s*$/m)?.[1]?.trim() ?? "";

  const serverPanel = cfg.server_info_panel ?? {};
  const serverAddr = extractServerIp(serverPanel.embed_description ?? "") ?? {
    ip: "26.13.227.132",
    port: "25813",
  };

  const sync = stringifyDeepIds({
    brandName: cfg.brand_name ?? "Solar",
    guildId: snowflake(cfg.test_guild_ids?.[0], "1466351394523971620"),
    channels: {
      ...(cfg.channels ?? {}),
      status: snowflake(solardsStatusChannel, "1487395981480956047"),
    },
    applications: cfg.applications ?? {},
    roles: cfg.roles ?? {},
    discord: {
      moderator_role_id: snowflake(
        solardsModerator || cfg.applications?.staff_role_id,
        "1480602248831696987",
      ),
      admin_role_id: snowflake(solardsAdmin, "1466352163398619293"),
      approved_role_id: snowflake(
        solardsApproved || cfg.applications?.approved_role_id,
        "1466352891932577926",
      ),
    },
    welcome: cfg.welcome ?? {},
    serverInfo: {
      ip: serverAddr.ip,
      port: serverAddr.port,
      dynmap: serverPanel.url_dynmap ?? "http://26.13.227.132:8100/",
      wiki: serverPanel.url_wiki ?? "https://mcsolar.gitbook.io/",
      monitoring: serverPanel.url_monitoring ?? "",
      help: serverPanel.help ?? serverPanel.url_help ?? "",
    },
    colors: cfg.colors_hex ?? {},
    syncedAt: new Date().toISOString(),
  });

  fs.mkdirSync(path.dirname(outConfig), { recursive: true });
  fs.writeFileSync(outConfig, JSON.stringify(sync, null, 2));
  console.log("Wrote", outConfig);

  let clientId = localEnv.DISCORD_CLIENT_ID;
  if (token && !clientId) {
    clientId = (await fetchDiscordAppId(token)) ?? "";
    if (clientId) console.log("Discord Application ID:", clientId);
  }

  const solardsApiUrl =
    localEnv.SOLARDS_API_URL || `http://${serverAddr.ip}:${solardsApiPort || "8080"}`;

  const envLines = [
    `SESSION_SECRET=${localEnv.SESSION_SECRET ?? "solarmc-dev-session-secret-change-in-prod"}`,
    `DISCORD_BOT_TOKEN=${token}`,
    `DISCORD_CLIENT_ID=${clientId ?? localEnv.DISCORD_CLIENT_ID ?? ""}`,
    `DISCORD_CLIENT_SECRET=${localEnv.DISCORD_CLIENT_SECRET ?? ""}`,
    `# Оставь пустым — redirect берётся из адреса сайта. Для продакшена: https://твой-домен/api/auth/callback`,
    `DISCORD_REDIRECT_URI=${localEnv.DISCORD_REDIRECT_URI ?? ""}`,
    `SOLARDS_API_URL=${localEnv.SOLARDS_API_URL ?? solardsApiUrl}`,
    `SOLARDS_PORT=${localEnv.SOLARDS_PORT ?? (solardsApiPort || "8080")}`,
    `SOLARDS_API_TOKEN=${localEnv.SOLARDS_API_TOKEN ?? solardsApiToken ?? ""}`,
    `MINECRAFT_SERVER_IP=${serverAddr.ip}`,
    `MINECRAFT_SERVER_PORT=${serverAddr.port}`,
    `DISCORD_GUILD_ID=${sync.guildId}`,
    `DISCORD_STATUS_CHANNEL_ID=${sync.channels.status ?? "1487395981480956047"}`,
    `DISCORD_MODERATOR_ROLE_ID=${sync.discord.moderator_role_id}`,
    `DISCORD_ADMIN_ROLE_ID=${sync.discord.admin_role_id}`,
    `DISCORD_STAFF_ROLE_ID=${sync.discord.moderator_role_id}`,
    `DISCORD_APPROVED_ROLE_ID=${sync.discord.approved_role_id}`,
    `DISCORD_APPLICATION_CATEGORY_ID=${snowflake(cfg.applications?.ticket_category_id, "1487428372220088452")}`,
    `SOLARBOT_PATH=${BOT_DIR.replace(/\\/g, "\\\\")}`,
    `SOLARDS_PATH=${SOLARDS_DIR.replace(/\\/g, "\\\\")}`,
  ];

  fs.writeFileSync(envLocal, envLines.join("\n") + "\n");
  console.log("Updated .env.local");

  const { spawnSync } = await import("child_process");
  spawnSync("node", ["scripts/import-discord-applications.mjs"], {
    stdio: "inherit",
    cwd: process.cwd(),
  });
}

main();

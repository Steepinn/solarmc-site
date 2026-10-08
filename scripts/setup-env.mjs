import fs from "fs";
import path from "path";

const botEnvPath = path.join("C:", "Python", "SOLARBOT", ".env");
const siteEnvPath = path.join(process.cwd(), ".env.local");

function parseEnv(content) {
  const env = {};
  for (const line of content.split("\n")) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

const botEnv = fs.existsSync(botEnvPath)
  ? parseEnv(fs.readFileSync(botEnvPath, "utf8"))
  : {};

const lines = [
  "SESSION_SECRET=solarmc-dev-session-secret-change-in-prod",
  `DISCORD_BOT_TOKEN=${botEnv.DISCORD_BOT_TOKEN ?? ""}`,
  "DISCORD_CLIENT_ID=",
  "DISCORD_CLIENT_SECRET=",
  "DISCORD_REDIRECT_URI=",
  "SOLARDS_API_URL=",
  "MINECRAFT_SERVER_IP=143.20.155.16",
  "MINECRAFT_SERVER_PORT=25813",
];

if (!fs.existsSync(siteEnvPath)) {
  fs.writeFileSync(siteEnvPath, lines.join("\n") + "\n");
  console.log("Created .env.local");
} else {
  console.log(".env.local already exists");
}

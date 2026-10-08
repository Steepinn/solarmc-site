import fs from "fs/promises";
import path from "path";

function counterPath() {
  const botDir = process.env.SOLARBOT_PATH ?? "C:\\Python\\SOLARBOT";
  const file =
    process.env.APPLICATION_TICKET_COUNTER_FILE ?? "application_ticket_counter.json";
  return path.join(botDir, file);
}

export async function nextApplicationTicketNumber(): Promise<number> {
  const filePath = counterPath();
  let n = 1;
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(raw) as { next?: number };
    n = Number(data.next ?? 1);
  } catch {
    /* start at 1 */
  }
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ next: n + 1 }, null, 2), "utf8");
  } catch {
    /* shared counter optional */
  }
  return n;
}

import type { Application } from "./types";

/** Префикс канала заявки на проходку в Discord (SOLARBOT). */
export const PASS_TICKET_PREFIX = "заявка-";
/** Устаревший латинский префикс с сайта — учитываем при подсчёте номера. */
export const PASS_TICKET_PREFIX_LATIN = "zayavka-";
export const ADMIN_REQUEST_PREFIX = "запрос-";
export const ADMIN_REQUEST_TOPIC = "solarbot_kind:admin_request";
export const PASS_EMBED_TITLE = "Заявка на проходку";

export function isAdminRequestChannel(channel: {
  name: string;
  topic?: string | null;
}) {
  if (channel.topic?.includes(ADMIN_REQUEST_TOPIC)) return true;
  return channel.name.startsWith(ADMIN_REQUEST_PREFIX);
}

export function isPassTicketChannelName(name: string) {
  return (
    name.startsWith(PASS_TICKET_PREFIX) ||
    name.startsWith(PASS_TICKET_PREFIX_LATIN)
  );
}

export function parsePassTicketNumber(name: string): number | undefined {
  const match = name.match(/(?:заявка|zayavka)-(\d+)/u);
  return match ? Number(match[1]) : undefined;
}

export function isPassApplicationEmbedTitle(title?: string) {
  return Boolean(title?.includes(PASS_EMBED_TITLE));
}

export function isValidPassApplication(app: Application) {
  if (app.kind === "admin_request") return false;
  const nick = app.mcNick?.trim();
  if (!nick || nick === "—") return false;
  return true;
}

export function filterPassApplications(apps: Application[]) {
  return apps.filter(isValidPassApplication);
}

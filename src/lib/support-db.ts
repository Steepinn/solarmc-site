import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import type {
  SupportMessage,
  SupportTicket,
  SupportTicketCategory,
  SupportTicketStatus,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "support-tickets.json");

type Store = {
  nextNumber: number;
  tickets: SupportTicket[];
};

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<Store> {
  await ensureDataDir();
  try {
    const raw = await readFile(FILE, "utf8");
    const parsed = JSON.parse(raw) as Partial<Store>;
    return {
      nextNumber: parsed.nextNumber ?? 1,
      tickets: parsed.tickets ?? [],
    };
  } catch {
    return { nextNumber: 1, tickets: [] };
  }
}

async function writeStore(store: Store) {
  await ensureDataDir();
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

function sortTickets(tickets: SupportTicket[]) {
  return [...tickets].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}

export async function getSupportTickets(): Promise<SupportTicket[]> {
  const store = await readStore();
  return sortTickets(store.tickets);
}

export async function getOpenSupportCount(): Promise<number> {
  const tickets = await getSupportTickets();
  return tickets.filter((t) => t.status !== "closed").length;
}

export async function getSupportTicketById(id: string) {
  const tickets = await getSupportTickets();
  return tickets.find((t) => t.id === id) ?? null;
}

export async function getSupportTicketByChannelId(channelId: string) {
  const tickets = await getSupportTickets();
  return tickets.find((t) => t.discordChannelId === channelId) ?? null;
}

export async function getUserSupportTickets(discordId: string) {
  const tickets = await getSupportTickets();
  return tickets.filter((t) => t.discordId === discordId);
}

export async function countOpenUserTickets(discordId: string) {
  const tickets = await getUserSupportTickets(discordId);
  return tickets.filter((t) => t.status !== "closed").length;
}

export async function createSupportTicket(input: {
  discordId: string;
  discordUsername: string;
  discordAvatar?: string;
  mcNick?: string;
  category: SupportTicketCategory;
  subject: string;
  body: string;
  evidenceUrls?: string[];
  rulePoint?: string;
  incidentAt?: string;
  reportedPlayer?: string;
}): Promise<SupportTicket> {
  const store = await readStore();
  const now = new Date().toISOString();
  const firstMessage: SupportMessage = {
    id: randomUUID(),
    authorDiscordId: input.discordId,
    authorUsername: input.discordUsername,
    authorRole: "user",
    body: input.body.trim(),
    createdAt: now,
  };

  const ticket: SupportTicket = {
    id: randomUUID(),
    number: store.nextNumber,
    discordId: input.discordId,
    discordUsername: input.discordUsername,
    discordAvatar: input.discordAvatar,
    mcNick: input.mcNick,
    category: input.category,
    subject: input.subject.trim(),
    status: "open",
    evidenceUrls: input.evidenceUrls?.length ? input.evidenceUrls : undefined,
    rulePoint: input.rulePoint?.trim() || undefined,
    incidentAt: input.incidentAt || undefined,
    reportedPlayer: input.reportedPlayer?.trim() || undefined,
    messages: [firstMessage],
    createdAt: now,
    updatedAt: now,
  };

  store.nextNumber += 1;
  store.tickets.unshift(ticket);
  await writeStore(store);
  return ticket;
}

export async function setSupportTicketChannel(
  id: string,
  discordChannelId: string | null,
): Promise<SupportTicket | null> {
  const store = await readStore();
  const idx = store.tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;
  const next = { ...store.tickets[idx], updatedAt: new Date().toISOString() };
  if (discordChannelId) {
    next.discordChannelId = discordChannelId;
  } else {
    delete next.discordChannelId;
  }
  store.tickets[idx] = next;
  await writeStore(store);
  return store.tickets[idx];
}

export async function addSupportMessage(
  id: string,
  message: Omit<SupportMessage, "id" | "createdAt"> & { createdAt?: string },
  nextStatus?: SupportTicketStatus,
): Promise<SupportTicket | null> {
  const store = await readStore();
  const idx = store.tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const ticket = store.tickets[idx];
  if (ticket.status === "closed") return null;

  // не дублируем уже синкнутое Discord-сообщение
  if (
    message.discordMessageId &&
    ticket.messages.some((m) => m.discordMessageId === message.discordMessageId)
  ) {
    return ticket;
  }

  const now = new Date().toISOString();
  const entry: SupportMessage = {
    ...message,
    id: randomUUID(),
    body: message.body.trim(),
    evidenceUrls: message.evidenceUrls?.length
      ? message.evidenceUrls
      : undefined,
    discordMessageId: message.discordMessageId,
    createdAt: message.createdAt ?? now,
  };

  let status = nextStatus ?? ticket.status;
  if (!nextStatus) {
    status = message.authorRole === "staff" ? "answered" : "open";
  }

  store.tickets[idx] = {
    ...ticket,
    status,
    messages: [...ticket.messages, entry],
    updatedAt: now,
  };
  await writeStore(store);
  return store.tickets[idx];
}

export async function attachDiscordMessageId(
  ticketId: string,
  messageId: string,
  discordMessageId: string,
): Promise<void> {
  const store = await readStore();
  const idx = store.tickets.findIndex((t) => t.id === ticketId);
  if (idx === -1) return;
  const messages = store.tickets[idx].messages.map((m) =>
    m.id === messageId ? { ...m, discordMessageId } : m,
  );
  store.tickets[idx] = { ...store.tickets[idx], messages };
  await writeStore(store);
}

export async function updateSupportTicketStatus(
  id: string,
  status: SupportTicketStatus,
  closedBy?: string,
): Promise<SupportTicket | null> {
  const store = await readStore();
  const idx = store.tickets.findIndex((t) => t.id === id);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  store.tickets[idx] = {
    ...store.tickets[idx],
    status,
    updatedAt: now,
    closedAt: status === "closed" ? now : undefined,
    closedBy: status === "closed" ? closedBy : undefined,
  };
  await writeStore(store);
  return store.tickets[idx];
}

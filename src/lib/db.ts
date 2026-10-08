import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { filterPassApplications } from "./pass-applications";
import type {
  Application,
  ApplicationMessage,
  ApplicationStatus,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const APPLICATIONS_FILE = path.join(DATA_DIR, "applications.json");

type ApplicationsStore = { applications: Application[] };

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function readStore(): Promise<ApplicationsStore> {
  await ensureDataDir();
  try {
    const raw = await readFile(APPLICATIONS_FILE, "utf8");
    return JSON.parse(raw) as ApplicationsStore;
  } catch {
    return { applications: [] };
  }
}

async function writeStore(store: ApplicationsStore) {
  await ensureDataDir();
  await writeFile(APPLICATIONS_FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function getApplications(): Promise<Application[]> {
  const store = await readStore();
  return store.applications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function getPassApplications(): Promise<Application[]> {
  return filterPassApplications(await getApplications());
}

export async function getApplicationById(id: string) {
  const apps = await getApplications();
  return apps.find((a) => a.id === id) ?? null;
}

export async function getUserApplications(discordId: string) {
  const apps = await getPassApplications();
  return apps.filter((a) => a.discordId === discordId);
}

export async function getLatestUserApplication(discordId: string) {
  const apps = await getUserApplications(discordId);
  return apps[0] ?? null;
}

export async function hasPendingApplication(discordId: string) {
  const apps = await getUserApplications(discordId);
  return apps.some((a) => a.status === "pending");
}

export async function createApplication(
  data: Omit<Application, "id" | "createdAt" | "status">,
): Promise<Application> {
  const store = await readStore();
  const now = new Date().toISOString();
  const summary = [
    `Ник: ${data.mcNick}`,
    `Имя: ${data.realName}`,
    `Возраст: ${data.age}`,
    `О себе: ${data.aboutSelf ?? "—"}`,
    `Опыт: ${data.experience ?? "—"}`,
    `Планы: ${data.plans ?? "—"}`,
  ].join("\n");

  const app: Application = {
    ...data,
    kind: "pass",
    id: randomUUID(),
    status: "pending",
    messages: [
      {
        id: randomUUID(),
        authorDiscordId: data.discordId,
        authorUsername: data.discordUsername,
        authorRole: "user",
        body: summary,
        createdAt: now,
      },
    ],
    createdAt: now,
  };
  store.applications.unshift(app);
  await writeStore(store);
  return app;
}

export async function attachApplicationTicket(
  id: string,
  ticket: { ticketNumber: number; channelId: string },
): Promise<Application | null> {
  const store = await readStore();
  const idx = store.applications.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  store.applications[idx] = {
    ...store.applications[idx],
    ticketNumber: ticket.ticketNumber,
    discordChannelId: ticket.channelId,
  };
  await writeStore(store);
  return store.applications[idx];
}

export async function addApplicationMessage(
  id: string,
  message: Omit<ApplicationMessage, "id" | "createdAt"> & { createdAt?: string },
): Promise<Application | null> {
  const store = await readStore();
  const idx = store.applications.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  const app = store.applications[idx];
  if (app.status !== "pending") return null;

  if (
    message.discordMessageId &&
    (app.messages ?? []).some((m) => m.discordMessageId === message.discordMessageId)
  ) {
    return app;
  }

  const entry: ApplicationMessage = {
    ...message,
    id: randomUUID(),
    body: message.body.trim(),
    createdAt: message.createdAt ?? new Date().toISOString(),
  };

  store.applications[idx] = {
    ...app,
    messages: [...(app.messages ?? []), entry],
  };
  await writeStore(store);
  return store.applications[idx];
}

export async function attachApplicationDiscordMessageId(
  applicationId: string,
  messageId: string,
  discordMessageId: string,
): Promise<void> {
  const store = await readStore();
  const idx = store.applications.findIndex((a) => a.id === applicationId);
  if (idx === -1) return;
  const messages = (store.applications[idx].messages ?? []).map((m) =>
    m.id === messageId ? { ...m, discordMessageId } : m,
  );
  store.applications[idx] = { ...store.applications[idx], messages };
  await writeStore(store);
}

export async function getPendingApplicationByDiscordId(discordId: string) {
  const apps = await getUserApplications(discordId);
  return apps.find((a) => a.status === "pending") ?? null;
}

export async function upsertApplications(apps: Application[]) {
  const store = await readStore();
  const byId = new Map(store.applications.map((a) => [a.id, a]));

  for (const app of apps) {
    byId.set(app.id, app);
  }

  store.applications = [...byId.values()].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  await writeStore(store);
  return store.applications;
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
  reviewedBy: string,
  rejectReason?: string,
) {
  const store = await readStore();
  const idx = store.applications.findIndex((a) => a.id === id);
  if (idx === -1) return null;

  store.applications[idx] = {
    ...store.applications[idx],
    status,
    rejectReason,
    reviewedAt: new Date().toISOString(),
    reviewedBy,
  };
  await writeStore(store);
  return store.applications[idx];
}

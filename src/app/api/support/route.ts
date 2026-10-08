import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { isGuildMember, notifySupportTicket } from "@/lib/discord-bot";
import { parseEvidenceUrls } from "@/lib/support-evidence";
import {
  countOpenUserTickets,
  createSupportTicket,
  getSupportTickets,
  getUserSupportTickets,
  setSupportTicketChannel,
} from "@/lib/support-db";
import { supportCategoryLabels } from "@/lib/support-labels";
import type { SupportTicketCategory } from "@/lib/types";

const CATEGORIES: SupportTicketCategory[] = [
  "bug",
  "access",
  "report",
  "question",
  "other",
];

const MAX_OPEN = 3;
const MAX_SUBJECT = 120;
const MAX_BODY = 4000;

export async function GET() {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (session.isAdmin) {
    const tickets = await getSupportTickets();
    return NextResponse.json({ tickets });
  }

  const tickets = await getUserSupportTickets(session.discordId);
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await isGuildMember(session.discordId))) {
    return NextResponse.json({ error: "not_in_guild" }, { status: 403 });
  }

  const openCount = await countOpenUserTickets(session.discordId);
  if (openCount >= MAX_OPEN) {
    return NextResponse.json({ error: "too_many_open" }, { status: 400 });
  }

  const body = await req.json();
  const category = body.category as SupportTicketCategory;
  const subject = String(body.subject ?? "").trim();
  const text = String(body.body ?? "").trim();
  const rulePoint = String(body.rulePoint ?? "").trim();
  const reportedPlayer = String(body.reportedPlayer ?? "").trim();
  const incidentDate = String(body.incidentDate ?? "").trim();
  const incidentTime = String(body.incidentTime ?? "").trim();

  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }
  if (!subject || subject.length > MAX_SUBJECT) {
    return NextResponse.json({ error: "invalid_subject" }, { status: 400 });
  }
  if (!text || text.length < 10 || text.length > MAX_BODY) {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const evidence = parseEvidenceUrls(body.evidenceUrls ?? body.evidence);
  if (evidence.error) {
    return NextResponse.json({ error: evidence.error }, { status: 400 });
  }

  let incidentAt: string | undefined;
  if (category === "report") {
    if (!rulePoint || rulePoint.length > 80) {
      return NextResponse.json({ error: "missing_rule_point" }, { status: 400 });
    }
    if (!reportedPlayer || reportedPlayer.length > 32) {
      return NextResponse.json({ error: "missing_reported_player" }, { status: 400 });
    }
    if (!incidentDate || !incidentTime) {
      return NextResponse.json({ error: "missing_incident_time" }, { status: 400 });
    }
    const parsed = new Date(`${incidentDate}T${incidentTime}`);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: "invalid_incident_time" }, { status: 400 });
    }
    if (parsed.getTime() > Date.now() + 60_000) {
      return NextResponse.json({ error: "incident_in_future" }, { status: 400 });
    }
    incidentAt = parsed.toISOString();

    if (evidence.urls.length === 0) {
      return NextResponse.json({ error: "evidence_required" }, { status: 400 });
    }
  }

  let ticket = await createSupportTicket({
    discordId: session.discordId,
    discordUsername: session.username,
    discordAvatar: session.avatar,
    mcNick: session.mcNick,
    category,
    subject,
    body: text,
    evidenceUrls: evidence.urls,
    rulePoint: category === "report" ? rulePoint : undefined,
    incidentAt,
    reportedPlayer: category === "report" ? reportedPlayer : undefined,
  });

  const notifyBody = [
    text,
    category === "report"
      ? `\nНарушитель: ${reportedPlayer}\nПункт: ${rulePoint}\nКогда: ${incidentDate} ${incidentTime}`
      : "",
    evidence.urls.length ? `\nДоказательства:\n${evidence.urls.join("\n")}` : "",
  ]
    .filter(Boolean)
    .join("");

  const channel = await notifySupportTicket({
    number: ticket.number,
    id: ticket.id,
    discordId: ticket.discordId,
    discordUsername: ticket.discordUsername,
    category: ticket.category,
    categoryLabel: supportCategoryLabels[ticket.category],
    subject: ticket.subject,
    body: notifyBody,
    evidenceUrls: evidence.urls,
    rulePoint: ticket.rulePoint,
    incidentAt: ticket.incidentAt,
    reportedPlayer: ticket.reportedPlayer,
    mcNick: ticket.mcNick,
  });

  if (channel?.channelId) {
    ticket = (await setSupportTicketChannel(ticket.id, channel.channelId)) ?? ticket;
  }

  return NextResponse.json({ ticket }, { status: 201 });
}

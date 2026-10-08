import { NextRequest, NextResponse } from "next/server";
import {
  attachApplicationTicket,
  createApplication,
  getPassApplications,
  getLatestUserApplication,
  hasPendingApplication,
} from "@/lib/db";
import { isGuildMember, notifyApplicationTicket } from "@/lib/discord-bot";
import { getEnrichedSession } from "@/lib/auth";

export async function GET() {
  const apps = await getPassApplications();
  const publicApps = apps.map((app) => ({
    id: app.id,
    ticketNumber: app.ticketNumber,
    mcNick: app.mcNick,
    discordUsername: maskName(app.discordUsername),
    status: app.status,
    sourceChannel: app.sourceChannel,
    createdAt: app.createdAt,
    reviewedAt: app.reviewedAt,
  }));
  return NextResponse.json({ applications: publicApps });
}

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!(await isGuildMember(session.discordId))) {
    return NextResponse.json({ error: "not_in_guild" }, { status: 403 });
  }

  if (session.hasWhitelist) {
    return NextResponse.json({ error: "already_whitelisted" }, { status: 400 });
  }

  if (await hasPendingApplication(session.discordId)) {
    return NextResponse.json({ error: "pending_exists" }, { status: 400 });
  }

  const last = await getLatestUserApplication(session.discordId);
  if (last) {
    const hoursSince =
      (Date.now() - new Date(last.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) {
      return NextResponse.json({ error: "cooldown" }, { status: 429 });
    }
  }

  const body = await req.json();

  if (!body.rulesAgreed || !body.ageConfirmed) {
    return NextResponse.json({ error: "agreement_required" }, { status: 400 });
  }

  const ageNum = Number.parseInt(String(body.age ?? "").trim(), 10);
  if (!Number.isFinite(ageNum) || ageNum < 14) {
    return NextResponse.json({ error: "age_min_14" }, { status: 400 });
  }

  const required = [
    "mcNick",
    "realName",
    "age",
    "hobby",
    "source",
    "rulesRead",
    "weekdayHours",
    "weekendHours",
    "ideaKnown",
    "aboutSelf",
    "experience",
    "plans",
  ] as const;

  for (const key of required) {
    if (!String(body[key] ?? "").trim()) {
      return NextResponse.json({ error: `missing_${key}` }, { status: 400 });
    }
  }

  let app = await createApplication({
    discordId: session.discordId,
    discordUsername: session.username,
    discordAvatar: session.avatar,
    mcNick: body.mcNick.trim(),
    realName: body.realName.trim(),
    age: body.age.trim(),
    hobby: body.hobby.trim(),
    source: body.source.trim(),
    rulesRead: body.rulesRead,
    weekdayHours: body.weekdayHours,
    weekendHours: body.weekendHours,
    ideaKnown: body.ideaKnown,
    aboutSelf: body.aboutSelf.trim(),
    experience: body.experience.trim(),
    plans: body.plans.trim(),
    sourceChannel: "website",
  });

  const ticket = await notifyApplicationTicket(app);
  if (ticket) {
    app =
      (await attachApplicationTicket(app.id, {
        ticketNumber: ticket.ticketNumber,
        channelId: ticket.channelId,
      })) ?? app;
  }

  return NextResponse.json({ application: app }, { status: 201 });
}

function maskName(name: string) {
  if (name.length <= 2) return name[0] + "*";
  return name.slice(0, 2) + "***";
}

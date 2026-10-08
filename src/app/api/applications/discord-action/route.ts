import { NextRequest, NextResponse } from "next/server";
import {
  getApplicationById,
  getPendingApplicationByDiscordId,
  updateApplicationStatus,
} from "@/lib/db";
import { createNotification } from "@/lib/notifications-db";
import { grantPlayerPass, revokePlayerPass } from "@/lib/site-roles";

function actionSecretOk(req: NextRequest) {
  const secret =
    process.env.DISCORD_BOT_ACTION_SECRET?.trim() ||
    process.env.SESSION_SECRET?.trim();
  if (!secret) return false;
  const header = req.headers.get("x-solar-bot-secret")?.trim();
  const auth = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return header === secret || auth === secret;
}

/** Одобрение/отказ заявки из Discord-кнопок SOLARBOT */
export async function POST(req: NextRequest) {
  if (!actionSecretOk(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const action = String(body.action ?? "");
  const by = String(body.by ?? "Discord").trim();
  const reason = body.reason ? String(body.reason).trim() : undefined;
  const applicationId = body.applicationId
    ? String(body.applicationId).trim()
    : "";
  const discordId = body.discordId ? String(body.discordId).trim() : "";

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  let app = applicationId ? await getApplicationById(applicationId) : null;
  if (!app && discordId) {
    app = await getPendingApplicationByDiscordId(discordId);
  }
  if (!app) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  if (app.status !== "pending") {
    return NextResponse.json({ application: app, already: true });
  }

  if (action === "approve") {
    await grantPlayerPass(app.discordId);
    const updated = await updateApplicationStatus(app.id, "approved", by);
    await createNotification({
      audience: "user",
      userId: app.discordId,
      title: "Заявка одобрена",
      body: "Тебе выдана проходка на SolarMC",
      href: "/applications",
    });
    // DM уже шлёт SOLARBOT — дублировать не обязательно
    return NextResponse.json({ application: updated });
  }

  await revokePlayerPass(app.discordId);
  const updated = await updateApplicationStatus(
    app.id,
    "rejected",
    by,
    reason,
  );
  await createNotification({
    audience: "user",
    userId: app.discordId,
    title: "Заявка отклонена",
    body: reason?.slice(0, 140) || "Заявка отклонена модератором",
    href: "/applications",
  });
  return NextResponse.json({ application: updated });
}

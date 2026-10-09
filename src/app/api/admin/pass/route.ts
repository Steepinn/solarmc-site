import { NextRequest, NextResponse } from "next/server";
import { clearEnrichedSessionCache, getEnrichedSession } from "@/lib/auth";
import { getApplicationById, updateApplicationStatus } from "@/lib/db";
import { dmApplicationDecision } from "@/lib/discord-bot";
import { grantPlayerPass, revokePlayerPass } from "@/lib/site-roles";

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { discordId, grant, applicationId } = (await req.json()) as {
    discordId?: string;
    grant?: boolean;
    applicationId?: string;
  };

  if (!discordId?.trim() || typeof grant !== "boolean") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const id = discordId.trim();
  const app = applicationId ? await getApplicationById(applicationId) : null;

  if (grant) {
    await grantPlayerPass(id);
    if (applicationId) {
      await updateApplicationStatus(applicationId, "approved", session.username);
    }
    void dmApplicationDecision({
      discordId: id,
      approved: true,
      mcNick: app?.mcNick,
    });
  } else {
    await revokePlayerPass(id);
    if (applicationId) {
      await updateApplicationStatus(
        applicationId,
        "rejected",
        session.username,
        "Проходка отозвана",
      );
    }
    void dmApplicationDecision({
      discordId: id,
      approved: false,
      mcNick: app?.mcNick,
      reason: "Проходка отозвана",
    });
  }

  clearEnrichedSessionCache(id);
  return NextResponse.json({ ok: true, grant });
}

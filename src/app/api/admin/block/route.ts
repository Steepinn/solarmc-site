import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import {
  blockUser,
  getUserBlock,
  listBlockedUsers,
  unblockUser,
} from "@/lib/site-blocks";

export async function GET(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const discordId = req.nextUrl.searchParams.get("discordId")?.trim();
  if (discordId) {
    const block = await getUserBlock(discordId);
    return NextResponse.json({ blocked: Boolean(block), block });
  }

  const blocks = await listBlockedUsers();
  return NextResponse.json({ blocks });
}

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json()) as {
    discordId?: string;
    action?: "block" | "unblock";
    reason?: string;
  };

  const discordId = body.discordId?.trim();
  if (!discordId) {
    return NextResponse.json({ error: "discordId_required" }, { status: 400 });
  }

  if (discordId === session.discordId) {
    return NextResponse.json({ error: "cannot_block_self" }, { status: 400 });
  }

  if (body.action === "unblock") {
    await unblockUser(discordId);
    return NextResponse.json({ ok: true, blocked: false });
  }

  const block = await blockUser({
    discordId,
    reason: body.reason,
    blockedBy: session.discordId,
    blockedByName: session.username,
  });

  return NextResponse.json({ ok: true, blocked: true, block });
}

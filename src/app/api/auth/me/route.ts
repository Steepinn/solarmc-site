import { NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { upsertSiteUser } from "@/lib/site-users";

export async function GET() {
  const user = await getEnrichedSession();
  if (!user) return NextResponse.json({ user: null });

  await upsertSiteUser({
    discordId: user.discordId,
    username: user.username,
    mcNick: user.mcNick,
    avatar: user.avatar,
  });

  return NextResponse.json({ user });
}

import { NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { fetchAdminOverview } from "@/lib/status";

export async function GET() {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const overview = await fetchAdminOverview();
  if (!overview) {
    return NextResponse.json(
      { error: "status_unavailable", message: "Нет данных — проверь DISCORD_BOT_TOKEN" },
      { status: 502 },
    );
  }

  return NextResponse.json(overview);
}

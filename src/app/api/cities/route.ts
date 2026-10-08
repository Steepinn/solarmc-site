import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { createCity, getCities } from "@/lib/cities-db";

export async function GET() {
  const cities = await getCities();
  return NextResponse.json({ cities });
}

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = await req.json();
  if (!body.name?.trim() || !body.description?.trim()) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const city = await createCity({
    name: body.name.trim(),
    description: body.description.trim(),
    law: body.law?.trim() ?? "",
    founderDiscordId: body.founderDiscordId?.trim() ?? session.discordId,
    founderName: body.founderName?.trim() ?? session.username,
    founderMcNick: body.founderMcNick?.trim(),
    image: body.image?.trim(),
    mapX: body.mapX != null ? Number(body.mapX) : undefined,
    mapZ: body.mapZ != null ? Number(body.mapZ) : undefined,
  });

  return NextResponse.json({ city }, { status: 201 });
}

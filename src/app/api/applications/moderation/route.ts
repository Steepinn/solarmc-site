import { NextResponse } from "next/server";
import { getPassApplications } from "@/lib/db";
import { getEnrichedSession } from "@/lib/auth";

export async function GET() {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const applications = await getPassApplications();
  return NextResponse.json({ applications });
}

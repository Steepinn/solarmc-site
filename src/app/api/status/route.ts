import { NextResponse } from "next/server";
import { fetchServerStatus } from "@/lib/status";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = await fetchServerStatus();
  return NextResponse.json(status, {
    headers: { "Cache-Control": "no-store" },
  });
}

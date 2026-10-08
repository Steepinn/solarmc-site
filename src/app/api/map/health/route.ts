import { NextResponse } from "next/server";
import { getMapUpstream } from "@/lib/map-config";

export const dynamic = "force-dynamic";

export async function GET() {
  const upstream = getMapUpstream();
  try {
    const res = await fetch(`${upstream}/`, {
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      headers: { Accept: "text/html,*/*" },
    });
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      upstream,
    });
  } catch {
    return NextResponse.json({
      ok: false,
      status: 0,
      upstream,
      error: "unreachable",
    });
  }
}

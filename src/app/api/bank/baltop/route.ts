import { NextResponse } from "next/server";

/** SPmoney интеграция отключена */
export async function GET() {
  return NextResponse.json(
    { available: false, entries: [], symbol: "АР", message: "Банк на сайте отключён" },
    { status: 410 },
  );
}

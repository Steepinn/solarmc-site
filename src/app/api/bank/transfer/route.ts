import { NextResponse } from "next/server";

/** SPmoney интеграция отключена */
export async function POST() {
  return NextResponse.json(
    { ok: false, message: "Банк на сайте отключён" },
    { status: 410 },
  );
}

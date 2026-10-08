import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile } from "fs/promises";
import path from "path";
import { getEnrichedSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { slug, content } = await req.json();
  if (!slug?.trim() || typeof content !== "string") {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const safe = slug.replace(/\.\./g, "").replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "content", "wiki", `${safe}.md`);

  if (!filePath.startsWith(path.join(process.cwd(), "content", "wiki"))) {
    return NextResponse.json({ error: "invalid_path" }, { status: 400 });
  }

  await writeFile(filePath, content, "utf8");
  return NextResponse.json({ ok: true });
}

export async function GET(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session?.isAdmin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "missing_slug" }, { status: 400 });

  const safe = slug.replace(/\.\./g, "").replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "content", "wiki", `${safe}.md`);

  try {
    const content = await readFile(filePath, "utf8");
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}

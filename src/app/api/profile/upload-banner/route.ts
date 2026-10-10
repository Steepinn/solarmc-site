import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import { saveFeedMedia } from "@/lib/feed-media";
import { updateProfileSettings } from "@/lib/profile-settings";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const saved = await saveFeedMedia(buffer, file.type, "profile");
    if (saved.type !== "image") {
      return NextResponse.json({ error: "images_only" }, { status: 400 });
    }
    await updateProfileSettings(session.discordId, { bannerUrl: saved.url });
    return NextResponse.json({ url: saved.url });
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "too_large") {
        return NextResponse.json({ error: "too_large" }, { status: 413 });
      }
      if (e.message === "invalid_type") {
        return NextResponse.json({ error: "invalid_type" }, { status: 400 });
      }
    }
    throw e;
  }
}

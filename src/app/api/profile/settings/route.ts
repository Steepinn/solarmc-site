import { NextRequest, NextResponse } from "next/server";
import { getEnrichedSession } from "@/lib/auth";
import {
  BANNER_PRESETS,
  getProfileSettings,
  updateProfileSettings,
  type BannerPreset,
} from "@/lib/profile-settings";
import { getSiteUserBySlug } from "@/lib/site-users";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "slug_required" }, { status: 400 });
  }

  const user = await getSiteUserBySlug(slug);
  if (!user) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const settings = await getProfileSettings(user.discordId);
  return NextResponse.json({
    settings: {
      bio: settings.bio,
      bannerPreset: settings.bannerPreset,
      bannerUrl: settings.bannerUrl,
    },
    presets: Object.keys(BANNER_PRESETS),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getEnrichedSession();
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: {
    bio?: string;
    bannerPreset?: string;
    bannerUrl?: string | null;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const bannerPreset =
    body.bannerPreset && body.bannerPreset in BANNER_PRESETS
      ? (body.bannerPreset as BannerPreset)
      : undefined;

  const settings = await updateProfileSettings(session.discordId, {
    bio: body.bio,
    bannerPreset,
    bannerUrl: body.bannerUrl,
  });

  return NextResponse.json({
    settings: {
      bio: settings.bio,
      bannerPreset: settings.bannerPreset,
      bannerUrl: settings.bannerUrl,
    },
  });
}

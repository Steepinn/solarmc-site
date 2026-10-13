import { NextRequest, NextResponse } from "next/server";
import {
  loadAdvancementsForProfile,
  resolvePublicProfile,
} from "@/lib/public-profile";
import { getPublicProjectRoles } from "@/lib/public-roles";
import { listFeedPostsByDiscordId } from "@/lib/feed-posts";
import { getProfileSettings } from "@/lib/profile-settings";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ nick: string }> };

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { nick: nickRaw } = await ctx.params;
  const nick = decodeURIComponent(nickRaw || "").trim();
  if (!nick) {
    return NextResponse.json({ ok: false, error: "missing_nick" }, { status: 400 });
  }

  const profile = await resolvePublicProfile(nick);
  if (!profile) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 });
  }

  const [advancements, publicRoles, profileSettings, feedPosts] = await Promise.all([
    loadAdvancementsForProfile(profile),
    profile.discordId
      ? getPublicProjectRoles(profile.discordId)
      : Promise.resolve({ roles: [], hasWhitelist: false }),
    profile.discordId
      ? getProfileSettings(profile.discordId)
      : Promise.resolve({
          discordId: "",
          bio: "",
          bannerPreset: "default" as const,
          bannerUrl: null,
          updatedAt: new Date(0).toISOString(),
        }),
    profile.discordId
      ? listFeedPostsByDiscordId(profile.discordId, 20)
      : Promise.resolve([]),
  ]);

  const mcNick = profile.mcNick?.trim() || profile.displayName;
  const stats: { label: string; tone?: string }[] = [
    { label: `Достижений: ${advancements.total}`, tone: "muted" },
  ];
  if (publicRoles.hasWhitelist) {
    stats.push({ label: "Проходка", tone: "success" });
  }

  const roles = publicRoles.roles.map((r) => ({
    label: r.label,
    color: r.color,
    key: r.key,
  }));

  const bio = profileSettings.bio?.trim() || "";
  const posts = feedPosts.map((p) => ({
    id: p.id,
    text: p.content,
    body: p.content,
    date: p.createdAt,
    created_at: p.createdAt,
    media_url: p.mediaUrl ?? "",
    likes: p.likedBy?.length ?? 0,
  }));
  const posts_empty =
    posts.length > 0
      ? ""
      : `${profile.displayName} ещё ничего не публиковал.`;

  return NextResponse.json({
    ok: true,
    nick: mcNick,
    display_name: profile.displayName,
    discord_name: profile.username,
    avatar_url: profile.avatar,
    stats,
    roles,
    posts,
    posts_empty,
    bio,
    slug: profile.slug,
  });
}

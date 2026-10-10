import { notFound } from "next/navigation";
import { ProfileView } from "@/components/profile-view";
import { getEnrichedSession } from "@/lib/auth";
import { getLatestUserApplication } from "@/lib/db";
import { listFeedPostsByDiscordId } from "@/lib/feed-posts";
import {
  loadAdvancementsForProfile,
  resolvePublicProfile,
} from "@/lib/public-profile";
import { getPublicProjectRoles } from "@/lib/public-roles";
import { getProfileSettings } from "@/lib/profile-settings";
import { getUserBlock } from "@/lib/site-blocks";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const profile = await resolvePublicProfile(slug);
  if (!profile) return { title: "Профиль не найден" };
  return {
    title: `${profile.displayName} — профиль`,
    description: `Профиль игрока ${profile.displayName} на SolarMC`,
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { slug } = await params;
  const profile = await resolvePublicProfile(slug);
  if (!profile) notFound();

  const session = await getEnrichedSession();
  const isOwner = Boolean(
    session &&
      profile.discordId &&
      session.discordId === profile.discordId,
  );

  const [advancements, application, publicRoles, block, profileSettings, feedPosts] =
    await Promise.all([
      loadAdvancementsForProfile(profile),
      isOwner && session
        ? getLatestUserApplication(session.discordId)
        : Promise.resolve(null),
      profile.discordId
        ? getPublicProjectRoles(profile.discordId)
        : Promise.resolve({ roles: [], hasWhitelist: false }),
      profile.discordId ? getUserBlock(profile.discordId) : Promise.resolve(null),
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
        ? listFeedPostsByDiscordId(profile.discordId)
        : Promise.resolve([]),
    ]);

  const statusLabel =
    application?.status === "pending"
      ? "На рассмотрении"
      : application?.status === "approved"
        ? "Одобрено"
        : application?.status === "rejected"
          ? "Отклонено"
          : null;

  const profilePosts = feedPosts.map((p) => ({
    id: p.id,
    content: p.content,
    createdAt: p.createdAt,
    mediaUrl: p.mediaUrl ?? null,
    mediaType: p.mediaType ?? null,
    likes: p.likedBy.length,
  }));

  return (
    <ProfileView
      displayName={profile.displayName}
      username={profile.username}
      mcNick={profile.mcNick}
      avatar={profile.avatar}
      advancements={advancements}
      profileSettings={profileSettings}
      profilePosts={profilePosts}
      isOwner={isOwner}
      roles={publicRoles.roles}
      hasWhitelist={publicRoles.hasWhitelist}
      applicationStatus={statusLabel}
      viewerIsAdmin={Boolean(session?.isAdmin)}
      targetDiscordId={profile.discordId}
      isBlocked={Boolean(block)}
      blockReason={block?.reason ?? null}
    />
  );
}

import { notFound, redirect } from "next/navigation";
import { ProfileView } from "@/components/profile-view";
import { clearSessionCookie, getEnrichedSession } from "@/lib/auth";
import { getLatestUserApplication } from "@/lib/db";
import {
  loadAdvancementsForProfile,
  resolvePublicProfile,
} from "@/lib/public-profile";
import { getPublicProjectRoles } from "@/lib/public-roles";
import { getUserBlock } from "@/lib/site-blocks";
import { profilePath } from "@/lib/site-users";

type Props = { params: Promise<{ slug: string }> };

export const dynamic = "force-dynamic";

async function logoutAction() {
  "use server";
  await clearSessionCookie();
  redirect("/");
}

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

  const [advancements, application, publicRoles, block] = await Promise.all([
    loadAdvancementsForProfile(profile),
    isOwner && session
      ? getLatestUserApplication(session.discordId)
      : Promise.resolve(null),
    profile.discordId
      ? getPublicProjectRoles(profile.discordId)
      : Promise.resolve({ roles: [], hasWhitelist: false }),
    profile.discordId ? getUserBlock(profile.discordId) : Promise.resolve(null),
  ]);

  const shareHref = profilePath({
    mcNick: profile.mcNick ?? undefined,
    discordId: profile.discordId ?? profile.slug,
    username: profile.username,
  });

  const statusLabel =
    application?.status === "pending"
      ? "На рассмотрении"
      : application?.status === "approved"
        ? "Одобрено"
        : application?.status === "rejected"
          ? "Отклонено"
          : null;

  return (
    <ProfileView
      displayName={profile.displayName}
      username={profile.username}
      mcNick={profile.mcNick}
      avatar={profile.avatar}
      shareHref={shareHref}
      advancements={advancements}
      isOwner={isOwner}
      roles={publicRoles.roles}
      hasWhitelist={publicRoles.hasWhitelist}
      applicationStatus={statusLabel}
      isOwnerAdmin={isOwner ? session?.isAdmin : undefined}
      viewerIsAdmin={Boolean(session?.isAdmin)}
      targetDiscordId={profile.discordId}
      isBlocked={Boolean(block)}
      blockReason={block?.reason ?? null}
      logoutAction={isOwner ? logoutAction : undefined}
    />
  );
}

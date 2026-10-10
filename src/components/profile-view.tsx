import Image from "next/image";
import Link from "next/link";
import { AdminBlockButton } from "@/components/admin-block-button";
import { ProfilePostsSection, type ProfilePostItem } from "@/components/profile-posts-section";
import { ProfileSettingsForm } from "@/components/profile-settings-form";
import { ContentCard } from "@/components/page-shell";
import type { AdvancementsSummary } from "@/lib/minecraft-advancements";
import type { ProfileSettings } from "@/lib/profile-settings";

type RoleChip = { key: string; label: string; color: string };

export type ProfileViewProps = {
  displayName: string;
  username: string;
  mcNick: string | null;
  avatar: string | null;
  advancements: AdvancementsSummary;
  profileSettings: ProfileSettings;
  profilePosts: ProfilePostItem[];
  isOwner: boolean;
  roles?: RoleChip[];
  hasWhitelist?: boolean;
  applicationStatus?: string | null;
  viewerIsAdmin?: boolean;
  targetDiscordId?: string | null;
  isBlocked?: boolean;
  blockReason?: string | null;
};

export function ProfileView({
  displayName,
  username,
  mcNick,
  avatar,
  advancements,
  profileSettings,
  profilePosts,
  isOwner,
  roles = [],
  hasWhitelist,
  applicationStatus,
  viewerIsAdmin,
  targetDiscordId,
  isBlocked,
  blockReason,
}: ProfileViewProps) {
  const bio = profileSettings.bio.trim();

  return (
    <div className="mx-auto max-w-3xl px-4 pb-16 pt-6 sm:pt-8">
      <ContentCard className="p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {avatar ? (
            <Image
              src={avatar}
              alt={displayName}
              width={96}
              height={96}
              className="size-24 shrink-0 rounded-2xl ring-2 ring-solar-gold/30 sm:size-28"
              unoptimized={avatar.includes("discordapp.com")}
            />
          ) : (
            <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl bg-muted text-3xl font-bold text-solar-gold sm:size-28">
              {(displayName[0] ?? "?").toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {isOwner ? "Профиль" : "Игрок"}
            </p>
            <h1 className="font-display text-2xl font-bold break-words sm:text-3xl">
              {displayName}
            </h1>
            {mcNick && mcNick !== username ? (
              <p className="text-sm text-muted-foreground">Discord: {username}</p>
            ) : mcNick ? (
              <p className="text-sm text-solar-gold">MC: {mcNick}</p>
            ) : isOwner ? (
              <p className="text-sm text-muted-foreground">Привяжи MC: /dslink в игре</p>
            ) : null}

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                Достижений: {advancements.total}
              </span>
              {hasWhitelist ? (
                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-400">
                  Проходка
                </span>
              ) : null}
            </div>

            {bio && !isOwner ? (
              <p className="user-content mt-4 text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">
                {bio}
              </p>
            ) : null}

            {isBlocked ? (
              <p className="mt-4 rounded-xl bg-red-500/15 px-3 py-2 text-sm text-red-300">
                Заблокирован
                {blockReason ? `: ${blockReason}` : null}
              </p>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-1.5">
              {roles.length > 0
                ? roles.map((r) => (
                    <span
                      key={r.key}
                      className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${r.color}22`, color: r.color }}
                    >
                      {r.label}
                    </span>
                  ))
                : (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] text-muted-foreground">
                    Без ролей
                  </span>
                )}
            </div>
          </div>
        </div>
      </ContentCard>

      {isOwner ? (
        <ContentCard className="mt-4 p-4 sm:p-6">
          <h3 className="font-semibold">О себе</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Текст видят все на странице профиля.
          </p>
          <div className="mt-4">
            <ProfileSettingsForm initialBio={profileSettings.bio} />
          </div>
        </ContentCard>
      ) : null}

      {isOwner ? (
        <ContentCard className="mt-4 p-4 sm:p-6">
          <h3 className="font-semibold">Заявка на проходку</h3>
          {hasWhitelist ? (
            <p className="mt-2 text-sm text-green-400">Проходка активна.</p>
          ) : applicationStatus ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Статус заявки: {applicationStatus}
            </p>
          ) : (
            <Link href="/applications" className="btn-primary mt-3 inline-flex">
              Подать заявку
            </Link>
          )}
        </ContentCard>
      ) : null}

      {viewerIsAdmin && targetDiscordId && !isOwner ? (
        <ContentCard className="mt-4 p-4 sm:p-6">
          <AdminBlockButton
            discordId={targetDiscordId}
            initiallyBlocked={Boolean(isBlocked)}
            initialReason={blockReason}
          />
        </ContentCard>
      ) : null}

      <ProfilePostsSection
        initialPosts={profilePosts}
        isOwner={isOwner}
        displayName={displayName}
      />
    </div>
  );
}

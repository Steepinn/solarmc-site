import Image from "next/image";

import Link from "next/link";

import { AdminBlockButton } from "@/components/admin-block-button";

import { CopyProfileLink } from "@/components/copy-profile-link";

import { ProfileSettingsForm } from "@/components/profile-settings-form";

import { ContentCard } from "@/components/page-shell";

import type { AdvancementsSummary } from "@/lib/minecraft-advancements";

import {

  BANNER_PRESETS,

  resolveBannerStyle,

  type ProfileSettings,

} from "@/lib/profile-settings";



type RoleChip = { key: string; label: string; color: string };



export type ProfileViewProps = {

  displayName: string;

  username: string;

  mcNick: string | null;

  avatar: string | null;

  shareHref: string;

  advancements: AdvancementsSummary;

  profileSettings: ProfileSettings;

  isOwner: boolean;

  roles?: RoleChip[];

  hasWhitelist?: boolean;

  applicationStatus?: string | null;

  isOwnerAdmin?: boolean;

  viewerIsAdmin?: boolean;

  targetDiscordId?: string | null;

  isBlocked?: boolean;

  blockReason?: string | null;

  logoutAction?: () => Promise<void>;

};



export function ProfileView({

  displayName,

  username,

  mcNick,

  avatar,

  shareHref,

  advancements,

  profileSettings,

  isOwner,

  roles = [],

  hasWhitelist,

  applicationStatus,

  isOwnerAdmin,

  viewerIsAdmin,

  targetDiscordId,

  isBlocked,

  blockReason,

  logoutAction,

}: ProfileViewProps) {

  const bannerStyle = resolveBannerStyle(profileSettings);

  const bio = profileSettings.bio.trim();



  return (

    <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-6 sm:pt-8">

      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-lg">

        <div

          className="relative h-32 sm:h-44"

          style={{

            backgroundImage: bannerStyle.backgroundImage,

            backgroundSize: bannerStyle.backgroundSize ?? "cover",

            backgroundPosition: bannerStyle.backgroundPosition ?? "center",

          }}

        >

          {!profileSettings.bannerUrl &&

          profileSettings.bannerPreset === "default" ? (

            <div className="absolute inset-0 bg-gradient-to-br from-solar-yellow/20 via-transparent to-transparent" />

          ) : null}

        </div>



        <div className="relative px-4 pb-6 sm:px-8 sm:pb-8">

          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">

            <div className="flex min-w-0 items-end gap-4">

              {avatar ? (

                <Image

                  src={avatar}

                  alt={displayName}

                  width={112}

                  height={112}

                  className="size-24 shrink-0 rounded-2xl border-4 border-card ring-2 ring-solar-gold/30 sm:size-28"

                  unoptimized={avatar.includes("discordapp.com")}

                />

              ) : (

                <div className="flex size-24 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-muted text-3xl font-bold text-solar-gold sm:size-28">

                  {(displayName[0] ?? "?").toUpperCase()}

                </div>

              )}

              <div className="min-w-0 pb-1">

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

                  <p className="text-sm text-muted-foreground">

                    Привяжи MC: /dslink в игре

                  </p>

                ) : null}

              </div>

            </div>



            <div className="flex flex-wrap items-center gap-2">

              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">

                Достижений: {advancements.total}

              </span>

              {hasWhitelist ? (

                <span className="rounded-full bg-green-500/15 px-3 py-1 text-xs text-green-400">

                  Проходка

                </span>

              ) : null}

            </div>

          </div>



          {bio ? (

            <p className="user-content mt-4 max-w-2xl text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">

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



      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">

        <div className="space-y-4">

          {isOwner ? (

            <ContentCard>

              <h3 className="font-semibold">Оформление профиля</h3>

              <p className="mt-1 text-sm text-muted-foreground">

                Описание и фон видят все на этой странице.

              </p>

              <div className="mt-4">

                <ProfileSettingsForm

                  initialBio={profileSettings.bio}

                  initialPreset={profileSettings.bannerPreset}

                  initialBannerUrl={profileSettings.bannerUrl}

                  presets={Object.keys(BANNER_PRESETS)}

                />

              </div>

            </ContentCard>

          ) : null}



          {isOwner ? (

            <>

              <ContentCard>

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



              <ContentCard>

                <h3 className="font-semibold">Быстрые ссылки</h3>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">

                  {[

                    { href: "/feed", label: "Лента" },

                    { href: "/social", label: "Соцсеть" },

                    { href: "/applications", label: "Заявки" },

                    { href: "/map", label: "Карта" },

                    { href: "/cities", label: "Города" },

                    { href: "/shop", label: "Магазин" },

                    ...(isOwnerAdmin

                      ? [

                          { href: "/admin", label: "Админ-панель" },

                          { href: "/admin/wiki", label: "Редактор вики" },

                        ]

                      : []),

                  ].map((item) => (

                    <Link

                      key={item.href}

                      href={item.href}

                      className="menu-item justify-center"

                    >

                      {item.label}

                    </Link>

                  ))}

                </div>

              </ContentCard>

            </>

          ) : null}

        </div>



        <div className="space-y-4">

          {isOwner ? (

            <ContentCard>

              <h3 className="font-semibold">Ссылка на профиль</h3>

              <div className="mt-3">

                <CopyProfileLink href={shareHref} />

              </div>

            </ContentCard>

          ) : null}



          {isOwner && logoutAction ? (

            <ContentCard>

              <form action={logoutAction}>

                <button type="submit" className="btn-secondary w-full">

                  Выйти

                </button>

              </form>

            </ContentCard>

          ) : null}



          {viewerIsAdmin && targetDiscordId && !isOwner ? (

            <ContentCard>

              <AdminBlockButton

                discordId={targetDiscordId}

                initiallyBlocked={Boolean(isBlocked)}

                initialReason={blockReason}

              />

            </ContentCard>

          ) : null}

        </div>

      </div>

    </div>

  );

}


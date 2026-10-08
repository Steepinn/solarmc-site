import Image from "next/image";
import Link from "next/link";
import { AchievementsShowcase } from "@/components/achievements-showcase";
import { AdminBlockButton } from "@/components/admin-block-button";
import { CopyProfileLink } from "@/components/copy-profile-link";
import { ContentCard, PageShell } from "@/components/page-shell";
import type { AdvancementsSummary } from "@/lib/minecraft-advancements";

type RoleChip = { key: string; label: string; color: string };

export type ProfileViewProps = {
  displayName: string;
  username: string;
  mcNick: string | null;
  avatar: string | null;
  shareHref: string;
  advancements: AdvancementsSummary;
  isOwner: boolean;
  roles?: RoleChip[];
  hasWhitelist?: boolean;
  applicationStatus?: string | null;
  /** владелец видит админ-ссылки */
  isOwnerAdmin?: boolean;
  /** текущий зритель — админ (кнопка блокировки) */
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
  return (
    <PageShell
      title={displayName}
      eyebrow={isOwner ? "Профиль" : "Игрок"}
      description={
        mcNick
          ? `Minecraft: ${mcNick}`
          : isOwner
            ? "Привяжи аккаунт командой /dslink в игре"
            : "Без привязки Minecraft"
      }
    >
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <ContentCard className="text-center lg:sticky lg:top-24 lg:self-start">
          {avatar ? (
            <Image
              src={avatar}
              alt={displayName}
              width={96}
              height={96}
              className="mx-auto rounded-2xl ring-2 ring-solar-gold/30"
            />
          ) : (
            <div className="mx-auto flex size-24 items-center justify-center rounded-2xl bg-muted text-3xl font-bold text-solar-gold">
              {(displayName[0] ?? "?").toUpperCase()}
            </div>
          )}
          <h2 className="mt-4 text-xl font-bold">{displayName}</h2>
          {mcNick && mcNick !== username ? (
            <p className="mt-1 text-sm text-muted-foreground">Discord: {username}</p>
          ) : mcNick ? (
            <p className="mt-1 text-sm text-solar-gold">MC: {mcNick}</p>
          ) : null}

          {isBlocked ? (
            <p className="mt-3 rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-300">
              Заблокирован
              {blockReason ? `: ${blockReason}` : null}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap justify-center gap-1.5">
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
            {hasWhitelist ? (
              <span className="rounded-full bg-green-500/15 px-2.5 py-0.5 text-[11px] text-green-400">
                Проходка
              </span>
            ) : null}
          </div>

          {isOwner && logoutAction ? (
            <form action={logoutAction} className="mt-6">
              <button type="submit" className="btn-secondary w-full">
                Выйти
              </button>
            </form>
          ) : null}

          {viewerIsAdmin && targetDiscordId && !isOwner ? (
            <AdminBlockButton
              discordId={targetDiscordId}
              initiallyBlocked={Boolean(isBlocked)}
              initialReason={blockReason}
            />
          ) : null}
        </ContentCard>

        <div className="space-y-4">
          {isOwner ? (
            <ContentCard>
              <h3 className="font-semibold">Ссылка на профиль</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Эту же страницу видят другие — можно скинуть друзьям.
              </p>
              <div className="mt-3">
                <CopyProfileLink href={shareHref} />
              </div>
            </ContentCard>
          ) : null}

          <AchievementsShowcase
            total={advancements.total}
            byCategory={advancements.byCategory}
            items={advancements.items}
            source={advancements.source}
          />

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
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { href: "/applications", label: "Заявки" },
                    { href: "/feed", label: "Лента" },
                    { href: "/map", label: "Карта" },
                    { href: "/cities", label: "Города" },
                    { href: "/shop", label: "Магазин" },
                    { href: "/status", label: "Статус сервера" },
                    { href: "/docs/informaciya/home", label: "Вики" },
                    { href: "/support", label: "Техподдержка" },
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
      </div>
    </PageShell>
  );
}

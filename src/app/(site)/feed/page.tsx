"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ContentCard, PageShell } from "@/components/page-shell";

type User = {
  id: string;
  username: string;
  avatar: string;
  discordId: string;
  mcNick?: string | null;
};

type Post = {
  id: string;
  author: string;
  authorSlug: string;
  avatar: string;
  content: string;
  time: string;
  likes: number;
};

const demoPosts: Post[] = [
  {
    id: "1",
    author: "SolarBuilder",
    authorSlug: "SolarBuilder",
    avatar: "/logo.png",
    content: "Построил маяк у спавна — заходите оценить! 🌅",
    time: "2 ч. назад",
    likes: 14,
  },
  {
    id: "2",
    author: "AmberFox",
    authorSlug: "AmberFox",
    avatar: "/logo.png",
    content: "Кто на ивент в субботу? Собираемся у золотого квартала.",
    time: "5 ч. назад",
    likes: 8,
  },
  {
    id: "3",
    author: "SunMod",
    authorSlug: "SunMod",
    avatar: "/logo.png",
    content: "Обновили правила в вики — гляньте раздел про гардероб.",
    time: "1 д. назад",
    likes: 22,
  },
];

export default function FeedPage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => setUser(null));
  }, []);

  return (
    <PageShell
      title="Лента"
      description="Посты игроков — как в соцсети, только про SolarMC."
      eyebrow="Соцсеть"
    >
      {!user && (
        <ContentCard className="mb-6 border-solar-gold/20 bg-solar-yellow/5">
          <p className="text-sm">
            <Link href="/auth/discord" className="font-medium text-solar-gold hover:underline">
              Войди
            </Link>
            , чтобы публиковать посты и ставить лайки.
          </p>
        </ContentCard>
      )}

      <div className="mx-auto max-w-2xl space-y-4">
        {demoPosts.map((post) => (
          <ContentCard key={post.id}>
            <div className="flex items-start gap-3">
              <Link href={`/u/${encodeURIComponent(post.authorSlug)}`} className="shrink-0">
                <Image
                  src={post.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full ring-1 ring-border transition hover:ring-solar-gold/50"
                />
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/u/${encodeURIComponent(post.authorSlug)}`}
                    className="font-semibold hover:text-solar-gold"
                  >
                    {post.author}
                  </Link>
                  <span className="text-xs text-muted-foreground">{post.time}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed">{post.content}</p>
                <button
                  type="button"
                  className="mt-3 text-xs text-muted-foreground transition-colors hover:text-solar-gold"
                >
                  ❤ {post.likes}
                </button>
              </div>
            </div>
          </ContentCard>
        ))}
      </div>
    </PageShell>
  );
}

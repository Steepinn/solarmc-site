"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ContentCard } from "@/components/page-shell";
import { cn } from "@/lib/utils";

type FeedItem = {
  id: string;
  author: string;
  authorSlug: string;
  avatar: string;
  content: string;
  createdAt: string;
  likes: number;
  liked: boolean;
};

type User = {
  discordId: string;
  username: string;
  avatar: string;
  mcNick?: string | null;
};

function formatWhen(iso: string) {
  const diff = Date.now() - Date.parse(iso);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин. назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч. назад`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} д. назад`;
  return new Date(iso).toLocaleDateString("ru-RU");
}

export function SocialFeed() {
  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [meRes, feedRes] = await Promise.all([
      fetch("/api/auth/me"),
      fetch("/api/feed"),
    ]);
    if (meRes.ok) {
      const me = await meRes.json();
      if (me.user) setUser(me.user);
    }
    if (feedRes.ok) {
      const data = await feedRes.json();
      setPosts(data.posts ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitPost(e: FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setPosting(true);
    setError("");
    const res = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });
    const data = await res.json();
    setPosting(false);
    if (!res.ok) {
      setError(
        data.error === "invalid_content"
          ? "Пост от 1 до 2000 символов"
          : "Не удалось опубликовать",
      );
      return;
    }
    setText("");
    if (data.post) setPosts((prev) => [data.post as FeedItem, ...prev]);
  }

  async function toggleLike(id: string) {
    if (!user) return;
    const res = await fetch(`/api/feed/${id}/like`, { method: "POST" });
    if (!res.ok) return;
    const data = await res.json();
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, likes: data.likes, liked: data.liked } : p,
      ),
    );
  }

  return (
    <>
      {!user && (
        <ContentCard className="mb-4 border-solar-gold/20 bg-solar-yellow/5 sm:mb-6">
          <p className="text-sm">
            <Link href="/auth/discord" className="font-medium text-solar-gold hover:underline">
              Войди через Discord
            </Link>
            , чтобы публиковать посты и ставить лайки.
          </p>
        </ContentCard>
      )}

      {user ? (
        <ContentCard className="mb-4 sm:mb-6">
          <form onSubmit={submitPost} className="space-y-3">
            <label className="text-sm font-medium">Новый пост</label>
            <textarea
              className="input-field min-h-[88px] w-full resize-y text-sm"
              placeholder="Что нового на Solar?"
              maxLength={2000}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <button
              type="submit"
              disabled={posting || !text.trim()}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50"
            >
              {posting ? <Loader2 className="size-4 animate-spin" /> : null}
              Опубликовать
            </button>
          </form>
        </ContentCard>
      ) : null}

      <div className="mx-auto max-w-2xl min-w-0 space-y-3 sm:space-y-4">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Загрузка ленты…</p>
        ) : posts.length === 0 ? (
          <ContentCard>
            <p className="text-sm text-muted-foreground">
              Пока пусто — будь первым, кто напишет в ленту.
            </p>
          </ContentCard>
        ) : (
          posts.map((post) => (
            <ContentCard key={post.id} className="p-4 sm:p-6">
              <div className="flex min-w-0 items-start gap-3">
                <Link
                  href={`/u/${encodeURIComponent(post.authorSlug)}`}
                  className="shrink-0"
                >
                  <Image
                    src={post.avatar}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full ring-1 ring-border transition hover:ring-solar-gold/50"
                    unoptimized={post.avatar.includes("discordapp.com")}
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <Link
                      href={`/u/${encodeURIComponent(post.authorSlug)}`}
                      className="font-semibold break-words hover:text-solar-gold"
                    >
                      {post.author}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatWhen(post.createdAt)}
                    </span>
                  </div>
                  <p className="user-content mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  <button
                    type="button"
                    disabled={!user}
                    onClick={() => void toggleLike(post.id)}
                    className={cn(
                      "mt-3 text-xs transition-colors disabled:cursor-not-allowed",
                      post.liked ? "text-solar-gold" : "text-muted-foreground hover:text-solar-gold",
                    )}
                  >
                    {post.liked ? "♥" : "♡"} {post.likes}
                  </button>
                </div>
              </div>
            </ContentCard>
          ))
        )}
      </div>
    </>
  );
}

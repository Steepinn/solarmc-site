"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Copy, Heart, MessageCircle, Plus } from "lucide-react";
import { FeedComposerModal } from "@/components/feed-composer-modal";
import { ContentCard } from "@/components/page-shell";
import { cn } from "@/lib/utils";

type FeedComment = {
  id: string;
  author: string;
  authorSlug: string;
  avatar: string;
  content: string;
  createdAt: string;
};

type FeedItem = {
  id: string;
  author: string;
  authorSlug: string;
  avatar: string;
  content: string;
  createdAt: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  commentCount: number;
  comments: FeedComment[];
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
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("p");

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [composerOpen, setComposerOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    () => new Set(),
  );
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );
  const [copyOk, setCopyOk] = useState<string | null>(null);

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

  useEffect(() => {
    if (!highlightId || loading) return;
    const el = document.getElementById(`post-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, loading, posts.length]);

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

  async function submitComment(postId: string) {
    if (!user) return;
    const content = commentDrafts[postId]?.trim();
    if (!content) return;
    const res = await fetch(`/api/feed/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) return;
    const data = await res.json();
    const raw = data.comment as FeedComment & { authorName?: string };
    const comment: FeedComment = {
      id: raw.id,
      author: raw.author ?? raw.authorName ?? "?",
      authorSlug: raw.authorSlug,
      avatar: raw.avatar,
      content: raw.content,
      createdAt: raw.createdAt,
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentCount: p.comments.length + 1,
              comments: [...p.comments, comment],
            }
          : p,
      ),
    );
    setCommentDrafts((d) => ({ ...d, [postId]: "" }));
    setExpandedComments((s) => new Set(s).add(postId));
  }

  async function copyPostLink(id: string) {
    const url = `${window.location.origin}/feed?p=${encodeURIComponent(id)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopyOk(id);
      window.setTimeout(() => setCopyOk(null), 2000);
    } catch {
      /* ignore */
    }
  }

  function toggleComments(id: string) {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <>
      {!user && (
        <ContentCard className="mb-4 border-solar-gold/20 bg-solar-yellow/5 sm:mb-6">
          <p className="text-sm">
            <Link href="/auth/discord" className="font-medium text-solar-gold hover:underline">
              Войди через Discord
            </Link>
            , чтобы публиковать посты и комментировать.
          </p>
        </ContentCard>
      )}

      {user ? (
        <div className="mb-4 flex justify-end sm:mb-6">
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="pressable inline-flex size-14 items-center justify-center rounded-full bg-solar-yellow text-black shadow-lg shadow-solar-yellow/25 transition hover:brightness-105"
            aria-label="Новый пост"
          >
            <Plus className="size-7" strokeWidth={2.5} />
          </button>
        </div>
      ) : null}

      {user ? (
        <FeedComposerModal
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          onCreated={(post) => setPosts((prev) => [post as FeedItem, ...prev])}
        />
      ) : null}

      <div className="mx-auto max-w-2xl min-w-0 space-y-3 sm:space-y-4">
        {loading ? (
          <p className="text-center text-sm text-muted-foreground">Загрузка ленты…</p>
        ) : posts.length === 0 ? (
          <ContentCard>
            <p className="text-sm text-muted-foreground">
              Пока пусто — нажми «+», чтобы написать первым.
            </p>
          </ContentCard>
        ) : (
          posts.map((post) => {
            const commentsOpen = expandedComments.has(post.id);
            return (
              <div
                key={post.id}
                id={`post-${post.id}`}
                className="scroll-mt-24"
              >
              <ContentCard
                className={cn(
                  "p-4 sm:p-6",
                  highlightId === post.id && "ring-2 ring-solar-gold/50",
                )}
              >
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
                    {post.content ? (
                      <p className="user-content mt-2 text-sm leading-relaxed whitespace-pre-wrap">
                        {post.content}
                      </p>
                    ) : null}
                    {post.mediaUrl ? (
                      <div className="mt-3 overflow-hidden rounded-xl border border-border">
                        {post.mediaType === "video" ? (
                          <video
                            src={post.mediaUrl}
                            controls
                            className="max-h-80 w-full bg-black"
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={post.mediaUrl}
                            alt=""
                            className="max-h-80 w-full object-contain bg-black/20"
                          />
                        )}
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                      <button
                        type="button"
                        disabled={!user}
                        onClick={() => void toggleLike(post.id)}
                        className={cn(
                          "inline-flex min-h-8 items-center gap-1.5 transition-colors disabled:cursor-not-allowed",
                          post.liked
                            ? "text-solar-gold"
                            : "text-muted-foreground hover:text-solar-gold",
                        )}
                      >
                        <Heart
                          className="size-4 shrink-0"
                          fill={post.liked ? "currentColor" : "none"}
                          strokeWidth={2}
                        />
                        <span>{post.likes}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleComments(post.id)}
                        className="inline-flex min-h-8 items-center gap-1.5 text-muted-foreground transition hover:text-solar-gold"
                      >
                        <MessageCircle className="size-4 shrink-0" strokeWidth={2} />
                        <span>{post.commentCount || post.comments.length}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void copyPostLink(post.id)}
                        className="inline-flex min-h-8 items-center gap-1.5 text-muted-foreground transition hover:text-solar-gold"
                      >
                        <Copy className="size-4 shrink-0" strokeWidth={2} />
                        <span>{copyOk === post.id ? "Скопировано" : "Ссылка"}</span>
                      </button>
                    </div>
                    {commentsOpen ? (
                      <div className="mt-4 space-y-3 border-t border-border pt-3">
                        {post.comments.map((c) => (
                          <div key={c.id} className="flex gap-2 text-sm">
                            <Link
                              href={`/u/${encodeURIComponent(c.authorSlug)}`}
                              className="shrink-0"
                            >
                              <Image
                                src={c.avatar}
                                alt=""
                                width={28}
                                height={28}
                                className="size-7 rounded-full"
                                unoptimized={c.avatar.includes("discordapp.com")}
                              />
                            </Link>
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <Link
                                  href={`/u/${encodeURIComponent(c.authorSlug)}`}
                                  className="font-medium hover:text-solar-gold"
                                >
                                  {c.author ||
                                    (c as FeedComment & { authorName?: string })
                                      .authorName ||
                                    "Игрок"}
                                </Link>
                                <span className="text-xs text-muted-foreground">
                                  {formatWhen(c.createdAt)}
                                </span>
                              </div>
                              <p className="user-content mt-0.5 whitespace-pre-wrap">
                                {c.content}
                              </p>
                            </div>
                          </div>
                        ))}
                        {user ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              maxLength={1000}
                              placeholder="Комментарий…"
                              className="input-field flex-1 text-sm"
                              value={commentDrafts[post.id] ?? ""}
                              onChange={(e) =>
                                setCommentDrafts((d) => ({
                                  ...d,
                                  [post.id]: e.target.value,
                                }))
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  void submitComment(post.id);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="btn-secondary shrink-0 text-sm"
                              onClick={() => void submitComment(post.id)}
                            >
                              Отправить
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">
                            <Link href="/auth/discord" className="text-solar-gold hover:underline">
                              Войди
                            </Link>
                            , чтобы комментировать.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </ContentCard>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

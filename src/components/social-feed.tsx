"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Copy,
  ImagePlus,
  Loader2,
  MessageCircle,
  Plus,
  X,
} from "lucide-react";
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

type PendingMedia = {
  url: string;
  type: "image" | "video";
  preview: string;
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
  const [text, setText] = useState("");
  const [media, setMedia] = useState<PendingMedia | null>(null);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    () => new Set(),
  );
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>(
    {},
  );
  const [copyOk, setCopyOk] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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

  function closeComposer() {
    setComposerOpen(false);
    setText("");
    setMedia(null);
    setError("");
  }

  async function onPickMedia(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setError("Файл больше 10 МБ");
      return;
    }
    setUploading(true);
    setError("");
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/feed/upload", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      setError(
        res.status === 413
          ? "Максимум 10 МБ"
          : "Не удалось загрузить файл (jpg, png, gif, webp, mp4, webm)",
      );
      return;
    }
    const data = await res.json();
    setMedia({
      url: data.url,
      type: data.type,
      preview: URL.createObjectURL(file),
    });
  }

  async function submitPost(e: FormEvent) {
    e.preventDefault();
    if (!user || (!text.trim() && !media)) return;
    setPosting(true);
    setError("");
    const res = await fetch("/api/feed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: text.trim(),
        mediaUrl: media?.url ?? null,
        mediaType: media?.type ?? null,
      }),
    });
    const data = await res.json();
    setPosting(false);
    if (!res.ok) {
      setError(
        data.error === "invalid_content"
          ? "Нужен текст или вложение (до 2000 символов)"
          : "Не удалось опубликовать",
      );
      return;
    }
    closeComposer();
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
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              commentCount: p.comments.length + 1,
              comments: [...p.comments, data.comment],
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

      {composerOpen && user ? (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="composer-title"
        >
          <ContentCard className="relative w-full max-w-lg p-4 sm:p-6">
            <button
              type="button"
              className="absolute end-3 top-3 rounded-lg p-2 text-muted-foreground hover:bg-accent"
              aria-label="Закрыть"
              onClick={closeComposer}
            >
              <X className="size-5" />
            </button>
            <h2 id="composer-title" className="text-lg font-semibold">
              Новый пост
            </h2>
            <form onSubmit={submitPost} className="mt-4 space-y-3">
              <textarea
                className="input-field min-h-[100px] w-full resize-y text-sm"
                placeholder="Что нового на Solar?"
                maxLength={2000}
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
              />
              {media ? (
                <div className="relative overflow-hidden rounded-xl border border-border">
                  {media.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.preview}
                      alt=""
                      className="max-h-48 w-full object-cover"
                    />
                  ) : (
                    <video
                      src={media.preview}
                      className="max-h-48 w-full"
                      controls
                    />
                  )}
                  <button
                    type="button"
                    className="absolute end-2 top-2 rounded-lg bg-black/60 p-1.5 text-white"
                    onClick={() => setMedia(null)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : null}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onPickMedia(f);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  {uploading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                  Фото / видео (до 10 МБ)
                </button>
                <button
                  type="submit"
                  disabled={posting || uploading || (!text.trim() && !media)}
                  className="btn-primary ms-auto inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {posting ? <Loader2 className="size-4 animate-spin" /> : null}
                  Опубликовать
                </button>
              </div>
              {error ? <p className="text-sm text-red-400">{error}</p> : null}
            </form>
          </ContentCard>
        </div>
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
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      <button
                        type="button"
                        disabled={!user}
                        onClick={() => void toggleLike(post.id)}
                        className={cn(
                          "transition-colors disabled:cursor-not-allowed",
                          post.liked
                            ? "text-solar-gold"
                            : "text-muted-foreground hover:text-solar-gold",
                        )}
                      >
                        {post.liked ? "♥" : "♡"} {post.likes}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleComments(post.id)}
                        className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-solar-gold"
                      >
                        <MessageCircle className="size-3.5" />
                        {post.commentCount || post.comments.length}
                      </button>
                      <button
                        type="button"
                        onClick={() => void copyPostLink(post.id)}
                        className="inline-flex items-center gap-1 text-muted-foreground transition hover:text-solar-gold"
                      >
                        <Copy className="size-3.5" />
                        {copyOk === post.id ? "Скопировано" : "Ссылка"}
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
                              <Link
                                href={`/u/${encodeURIComponent(c.authorSlug)}`}
                                className="font-medium hover:text-solar-gold"
                              >
                                {c.author}
                              </Link>
                              <span className="ms-2 text-xs text-muted-foreground">
                                {formatWhen(c.createdAt)}
                              </span>
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

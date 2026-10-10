"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";
import { ContentCard } from "@/components/page-shell";
import {
  FeedComposerModal,
  type ComposerPost,
} from "@/components/feed-composer-modal";

export type ProfilePostItem = {
  id: string;
  content: string;
  createdAt: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  likes: number;
};

function formatWhen(iso: string) {
  const diff = Date.now() - Date.parse(iso);
  const min = Math.floor(diff / 60_000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин. назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч. назад`;
  return new Date(iso).toLocaleDateString("ru-RU");
}

type Props = {
  initialPosts: ProfilePostItem[];
  isOwner: boolean;
  displayName: string;
};

export function ProfilePostsSection({
  initialPosts,
  isOwner,
  displayName,
}: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [composerOpen, setComposerOpen] = useState(false);

  return (
    <section className="mt-6 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-xl font-bold">Посты</h2>
        {isOwner ? (
          <button
            type="button"
            onClick={() => setComposerOpen(true)}
            className="pressable inline-flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-accent"
          >
            <Plus className="size-4 text-solar-gold" />
            Новый пост
          </button>
        ) : null}
      </div>

      {posts.length === 0 ? (
        <ContentCard>
          <p className="text-sm text-muted-foreground">
            {isOwner
              ? "Пока нет постов — нажми «Новый пост» или зайди в общую ленту."
              : `${displayName} ещё ничего не публиковал.`}
          </p>
          {isOwner ? (
            <Link href="/feed" className="mt-3 inline-block text-sm text-solar-gold hover:underline">
              Открыть ленту
            </Link>
          ) : null}
        </ContentCard>
      ) : (
        posts.map((post) => (
          <ContentCard key={post.id} className="p-4 sm:p-5">
            <p className="text-xs text-muted-foreground">{formatWhen(post.createdAt)}</p>
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
                    className="max-h-72 w-full bg-black"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.mediaUrl}
                    alt=""
                    className="max-h-72 w-full object-contain bg-black/20"
                  />
                )}
              </div>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">♥ {post.likes}</p>
          </ContentCard>
        ))
      )}

      {posts.length > 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/feed" className="text-solar-gold hover:underline">
            Вся лента Solar
          </Link>
        </p>
      ) : null}

      {isOwner ? (
        <FeedComposerModal
          open={composerOpen}
          onClose={() => setComposerOpen(false)}
          onCreated={(post: ComposerPost) => {
            setPosts((prev) => [
              {
                id: post.id,
                content: post.content,
                createdAt: post.createdAt,
                mediaUrl: post.mediaUrl,
                mediaType: post.mediaType,
                likes: post.likes,
              },
              ...prev,
            ]);
          }}
        />
      ) : null}
    </section>
  );
}

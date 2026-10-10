"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Loader2, X } from "lucide-react";
import { ContentCard } from "@/components/page-shell";

export type ComposerPost = {
  id: string;
  author: string;
  authorSlug: string;
  avatar: string;
  content: string;
  createdAt: string;
  mediaUrl: string | null;
  mediaType: "image" | "video" | null;
  commentCount: number;
  comments: [];
  likes: number;
  liked: boolean;
};

type PendingMedia = {
  url: string;
  type: "image" | "video";
  preview: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: (post: ComposerPost) => void;
};

export function FeedComposerModal({ open, onClose, onCreated }: Props) {
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState("");
  const [media, setMedia] = useState<PendingMedia | null>(null);
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function reset() {
    setText("");
    setMedia(null);
    setError("");
  }

  function handleClose() {
    reset();
    onClose();
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
          : "Не удалось загрузить (jpg, png, gif, webp, mp4, webm)",
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
    if (!text.trim() && !media) return;
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
          ? "Нужен текст или вложение"
          : "Не удалось опубликовать",
      );
      return;
    }
    if (data.post) onCreated(data.post as ComposerPost);
    handleClose();
  }

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="support-compose"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feed-composer-title"
    >
      <button
        type="button"
        className="support-compose__backdrop"
        aria-label="Закрыть"
        onClick={handleClose}
      />
      <ContentCard className="support-compose__card relative z-[1] w-full max-w-lg p-4 sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3 pe-8">
          <h2 id="feed-composer-title" className="text-lg font-semibold">
            Новый пост
          </h2>
          <button
            type="button"
            className="absolute end-3 top-3 inline-flex size-10 items-center justify-center rounded-xl hover:bg-accent"
            aria-label="Закрыть"
            onClick={handleClose}
          >
            <X className="size-5" />
          </button>
        </div>
        <form onSubmit={submitPost} className="space-y-3">
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
                <video src={media.preview} className="max-h-48 w-full" controls />
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
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-stretch">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-card px-3 py-2.5 text-sm font-semibold leading-tight hover:bg-accent disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : (
                <ImagePlus className="size-4 shrink-0" />
              )}
              <span className="text-center">
                Фото / видео
                <span className="block text-xs font-normal text-muted-foreground">
                  до 10 МБ
                </span>
              </span>
            </button>
            <button
              type="submit"
              disabled={posting || uploading || (!text.trim() && !media)}
              className="btn-primary inline-flex min-h-11 w-full items-center justify-center gap-2 px-5 py-2.5 text-sm disabled:opacity-50 sm:w-auto sm:min-w-[10.5rem]"
            >
              {posting ? <Loader2 className="size-4 animate-spin" /> : null}
              Опубликовать
            </button>
          </div>
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
        </form>
      </ContentCard>
    </div>,
    document.body,
  );
}

"use client";

import { FormEvent, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { BannerPreset } from "@/lib/profile-settings";
import { cn } from "@/lib/utils";

const PRESET_LABELS: Record<BannerPreset, string> = {
  default: "По умолчанию",
  solar: "Solar",
  dusk: "Закат",
  ocean: "Океан",
  forest: "Лес",
};

type Props = {
  initialBio: string;
  initialPreset: BannerPreset;
  initialBannerUrl: string | null;
  presets: string[];
};

export function ProfileSettingsForm({
  initialBio,
  initialPreset,
  initialBannerUrl,
  presets,
}: Props) {
  const [bio, setBio] = useState(initialBio);
  const [bannerPreset, setBannerPreset] = useState<BannerPreset>(initialPreset);
  const [bannerUrl, setBannerUrl] = useState(initialBannerUrl);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, bannerPreset, bannerUrl }),
    });
    setSaving(false);
    setMessage(res.ok ? "Сохранено" : "Не удалось сохранить");
  }

  async function onBannerFile(file: File) {
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Файл больше 10 МБ");
      return;
    }
    setUploading(true);
    setMessage("");
    const fd = new FormData();
    fd.set("file", file);
    const res = await fetch("/api/profile/upload-banner", { method: "POST", body: fd });
    setUploading(false);
    if (!res.ok) {
      setMessage("Не удалось загрузить фон");
      return;
    }
    const data = await res.json();
    setBannerUrl(data.url);
    setMessage("Фон загружен — нажми «Сохранить»");
  }

  return (
    <form onSubmit={save} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Описание профиля</label>
        <textarea
          className="input-field mt-2 min-h-[88px] w-full resize-y text-sm"
          maxLength={500}
          placeholder="Коротко о себе на Solar…"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">{bio.length}/500</p>
      </div>

      <div>
        <p className="text-sm font-medium">Фон профиля</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {(presets as BannerPreset[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setBannerPreset(key);
                setBannerUrl(null);
              }}
              className={cn(
                "rounded-xl border px-3 py-1.5 text-xs font-medium transition-colors",
                bannerPreset === key && !bannerUrl
                  ? "border-solar-gold bg-solar-yellow/10 text-solar-gold"
                  : "border-border hover:bg-accent",
              )}
            >
              {PRESET_LABELS[key] ?? key}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void onBannerFile(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="btn-secondary text-sm"
          >
            {uploading ? <Loader2 className="inline size-4 animate-spin" /> : null}
            Своя картинка (до 10 МБ)
          </button>
          {bannerUrl ? (
            <button
              type="button"
              className="text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setBannerUrl(null)}
            >
              Убрать картинку
            </button>
          ) : null}
        </div>
      </div>

      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}

      <button type="submit" disabled={saving} className="btn-primary inline-flex gap-2">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        Сохранить
      </button>
    </form>
  );
}

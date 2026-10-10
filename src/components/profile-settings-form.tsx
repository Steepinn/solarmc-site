"use client";

import { FormEvent, useState } from "react";
import { Loader2 } from "lucide-react";

type Props = {
  initialBio: string;
};

export function ProfileSettingsForm({ initialBio }: Props) {
  const [bio, setBio] = useState(initialBio);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    const res = await fetch("/api/profile/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio }),
    });
    setSaving(false);
    setMessage(res.ok ? "Сохранено" : "Не удалось сохранить");
  }

  return (
    <form onSubmit={save} className="space-y-3">
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
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <button type="submit" disabled={saving} className="btn-primary inline-flex gap-2">
        {saving ? <Loader2 className="size-4 animate-spin" /> : null}
        Сохранить
      </button>
    </form>
  );
}

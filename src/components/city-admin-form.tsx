"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CityAdminForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    law: "",
    founderMcNick: "",
    founderName: "",
    image: "",
  });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (res.ok) {
      const data = await res.json();
      const slug = data.city?.slug as string | undefined;
      if (slug) {
        router.push(`/cities/${slug}`);
        return;
      }
      router.refresh();
      setForm({ name: "", description: "", law: "", founderMcNick: "", founderName: "", image: "" });
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      {[
        { k: "name", l: "Название", ph: "Солнечный Берег" },
        { k: "founderMcNick", l: "Ник основателя", ph: "Steve" },
        { k: "founderName", l: "Имя основателя", ph: "Discord / имя" },
        { k: "image", l: "URL фото", ph: "https://..." },
      ].map((f) => (
        <label key={f.k} className="block">
          <span className="text-sm">{f.l}</span>
          <input
            className="input-field mt-1 w-full"
            required={f.k === "name"}
            value={form[f.k as keyof typeof form]}
            onChange={(e) => setForm((s) => ({ ...s, [f.k]: e.target.value }))}
            placeholder={f.ph}
          />
        </label>
      ))}
      <label className="block sm:col-span-2">
        <span className="text-sm">Описание</span>
        <textarea
          className="input-field mt-1 w-full"
          rows={3}
          required
          value={form.description}
          onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
        />
      </label>
      <label className="block sm:col-span-2">
        <span className="text-sm">Законы города</span>
        <textarea
          className="input-field mt-1 w-full"
          rows={4}
          value={form.law}
          onChange={(e) => setForm((s) => ({ ...s, law: e.target.value }))}
        />
      </label>
      <button type="submit" disabled={loading} className="btn-primary sm:col-span-2">
        {loading ? "Сохранение..." : "Создать город"}
      </button>
    </form>
  );
}

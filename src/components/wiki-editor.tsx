"use client";

import { useState } from "react";

export function WikiEditor() {
  const [slug, setSlug] = useState("informaciya/home");
  const [content, setContent] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("Загрузка...");
    const res = await fetch(`/api/admin/wiki?slug=${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok) {
      setMsg("Страница не найдена");
      return;
    }
    setContent(data.content);
    setMsg("");
  }

  async function save() {
    setMsg("Сохранение...");
    const res = await fetch("/api/admin/wiki", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, content }),
    });
    setMsg(res.ok ? "Сохранено" : "Ошибка");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <input
          className="input-field min-w-[240px] flex-1"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="informaciya/rules"
        />
        <button type="button" className="btn-secondary" onClick={load}>
          Загрузить
        </button>
        <button type="button" className="btn-primary" onClick={save}>
          Сохранить
        </button>
      </div>
      <textarea
        className="input-field min-h-[360px] w-full font-mono text-sm"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      {msg ? <p className="text-sm text-muted-foreground">{msg}</p> : null}
    </div>
  );
}

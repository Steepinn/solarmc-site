"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getMapEmbedUrl, getMapExternalUrl } from "@/lib/map-config";

type Health = { ok: boolean; upstream?: string };

export function MapViewer() {
  const [embedUrl, setEmbedUrl] = useState("/bluemap");
  const [externalUrl, setExternalUrl] = useState("http://localhost:8100/");
  const [health, setHealth] = useState<Health | null>(null);

  const check = () => {
    setHealth(null);
    fetch("/api/map/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setHealth({ ok: Boolean(d.ok), upstream: d.upstream }))
      .catch(() => setHealth({ ok: false }));
  };

  useEffect(() => {
    setEmbedUrl(`${getMapEmbedUrl()}?v=${Date.now()}`);
    setExternalUrl(getMapExternalUrl());
    check();
  }, []);

  const offline = health !== null && !health.ok;
  const ready = health?.ok === true;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          BlueMap — 3D-карта мира
          {offline ? (
            <span className="ms-2 text-amber-300">· сейчас недоступна</span>
          ) : null}
        </p>
        <Link
          href={externalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-solar-gold hover:underline"
        >
          Открыть в новой вкладке
        </Link>
      </div>

      {health === null ? (
        <div className="flex h-[min(75vh,720px)] items-center justify-center text-sm text-muted-foreground">
          Проверяем карту…
        </div>
      ) : offline ? (
        <div className="flex min-h-[min(75vh,720px)] flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="font-display text-xl font-semibold">Карта не отвечает</p>
          <p className="max-w-md text-sm text-muted-foreground">
            Запусти BlueMap (порт{" "}
            <code className="text-foreground">8100</code>) и нажми «Проверить
            снова».
          </p>
          {health.upstream ? (
            <p className="font-mono text-xs text-muted-foreground">
              {health.upstream}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              Открыть напрямую
            </Link>
            <button type="button" className="btn-secondary" onClick={check}>
              Проверить снова
            </button>
          </div>
        </div>
      ) : ready ? (
        <div
          data-solar-map-frame
          className="relative"
          onMouseEnter={() =>
            window.dispatchEvent(new Event("solar-map-cursor-enter"))
          }
          onMouseLeave={() =>
            window.dispatchEvent(new Event("solar-map-cursor-leave"))
          }
        >
          <iframe
            key={embedUrl}
            src={embedUrl}
            title="SolarMC BlueMap"
            className="h-[min(75vh,720px)] w-full bg-[#0b1220]"
            allow="fullscreen"
            allowFullScreen
          />
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

type Mode = "boot" | "login-ok" | "login-fail" | "hidden";

const BOOT_MS = 1400;
const AUTH_MS = 1200;
const FADE_MS = 400;

function readMode(): Mode {
  if (typeof window === "undefined") return "hidden";
  const params = new URLSearchParams(window.location.search);
  const login = params.get("login");
  if (login === "ok") return "login-ok";
  if (login === "fail") return "login-fail";
  if (sessionStorage.getItem("solar-splash-seen") === "1") return "hidden";
  return "boot";
}

function clearLoginParam() {
  const url = new URL(window.location.href);
  if (!url.searchParams.has("login")) return;
  url.searchParams.delete("login");
  window.history.replaceState({}, "", url.pathname + url.search + url.hash);
}

export function SiteSplash() {
  // Сразу показываем boot на клиенте — без кадра «пустого» экрана
  const [mode, setMode] = useState<Mode>(() =>
    typeof window === "undefined" ? "hidden" : readMode(),
  );
  const [phase, setPhase] = useState<"show" | "leave" | "done">(() =>
    typeof window === "undefined"
      ? "done"
      : readMode() === "hidden"
        ? "done"
        : "show",
  );
  const [progress, setProgress] = useState(0);
  const doneRef = useRef(false);

  useLayoutEffect(() => {
    const m = readMode();
    setMode(m);
    if (m === "hidden") {
      setPhase("done");
      return;
    }

    setPhase("show");
    if (m === "boot") {
      sessionStorage.setItem("solar-splash-seen", "1");
    }

    const duration = m === "boot" ? BOOT_MS : AUTH_MS;
    const started = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / duration);
      const eased = 1 - (1 - t) ** 2.2;
      setProgress(Math.round(eased * 100));

      if (t < 1) {
        frame = requestAnimationFrame(tick);
        return;
      }

      if (doneRef.current) return;
      doneRef.current = true;
      setProgress(100);

      window.setTimeout(() => {
        setPhase("leave");
        clearLoginParam();
        window.setTimeout(() => setPhase("done"), FADE_MS);
      }, 80);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  if (phase === "done" || mode === "hidden") return null;

  const title =
    mode === "login-ok"
      ? "Вход выполнен"
      : mode === "login-fail"
        ? "Вход не удался"
        : "SOLAR";

  const subtitle =
    mode === "login-ok"
      ? "Добро пожаловать"
      : mode === "login-fail"
        ? "Попробуй войти ещё раз через Discord"
        : "зажигаем Season 3";

  return (
    <div
      className={[
        "site-splash",
        mode === "login-ok" && "site-splash--ok",
        mode === "login-fail" && "site-splash--fail",
        phase === "leave" && "site-splash--out",
      ]
        .filter(Boolean)
        .join(" ")}
      aria-busy={phase !== "leave"}
      aria-label={title}
    >
      <div className="site-splash__bg" aria-hidden>
        <span className="site-splash__orb site-splash__orb--a" />
        <span className="site-splash__orb site-splash__orb--b" />
        <span className="site-splash__orb site-splash__orb--c" />
        <div className="splash-sun" />
        <div className="splash-rays" />
      </div>

      <div className="site-splash__card site-splash__card--alive">
        <div className="splash-ring" style={{ ["--p" as string]: `${progress}` }}>
          <Image
            src="/brand-face.png"
            alt=""
            width={132}
            height={132}
            className="site-splash__logo brand-face"
            priority
          />
        </div>
        <p
          className={[
            "font-display site-splash__brand",
            mode === "login-ok" && "text-emerald-400",
            mode === "login-fail" && "text-red-400",
            mode === "boot" && "neon-text",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {title}
        </p>
        <p className="site-splash__sub">{subtitle}</p>
        <div
          className="site-splash__bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="site-splash__pct">{progress}%</p>
      </div>
    </div>
  );
}

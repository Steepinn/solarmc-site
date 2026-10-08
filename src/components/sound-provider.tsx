"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  isSoundEnabled,
  playUiSound,
  setSoundEnabled,
  unlockAudio,
} from "@/lib/ui-sounds";

type SoundApi = {
  enabled: boolean;
  toggle: () => void;
  click: () => void;
  hover: () => void;
  success: () => void;
};

const SoundCtx = createContext<SoundApi | null>(null);

export function useUiSound() {
  const ctx = useContext(SoundCtx);
  if (!ctx) {
    return {
      enabled: true,
      toggle: () => undefined,
      click: () => undefined,
      hover: () => undefined,
      success: () => undefined,
    } satisfies SoundApi;
  }
  return ctx;
}

function isInteractive(el: Element | null) {
  if (!el) return false;
  return Boolean(
    el.closest(
      "a[href], button, [role='button'], .pressable, input[type='submit'], summary, .btn-primary, .btn-secondary, .btn-discord",
    ),
  );
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    setEnabled(isSoundEnabled());
  }, []);

  useEffect(() => {
    const unlock = () => {
      void unlockAudio();
    };
    window.addEventListener("pointerdown", unlock, { once: true, passive: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      if (!isInteractive(e.target as Element)) return;
      // звук отложен внутри playUiSound — клик не блокируется
      playUiSound("click");
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      if (!isInteractive(e.target as Element)) return;
      playUiSound("click");
    };

    document.addEventListener("pointerdown", onDown, {
      capture: true,
      passive: true,
    });
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("pointerdown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, []);

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev;
      setSoundEnabled(next);
      if (next) playUiSound("success");
      return next;
    });
  }, []);

  const api = useMemo<SoundApi>(
    () => ({
      enabled,
      toggle,
      click: () => playUiSound("click"),
      hover: () => playUiSound("hover"),
      success: () => playUiSound("success"),
    }),
    [enabled, toggle],
  );

  return <SoundCtx.Provider value={api}>{children}</SoundCtx.Provider>;
}

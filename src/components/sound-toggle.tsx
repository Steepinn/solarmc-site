"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useUiSound } from "@/components/sound-provider";

export function SoundToggle() {
  const { enabled, toggle } = useUiSound();

  return (
    <button
      type="button"
      onClick={toggle}
      className="pressable inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      aria-label={enabled ? "Выключить звуки" : "Включить звуки"}
      title={enabled ? "Звук UI: вкл" : "Звук UI: выкл"}
    >
      {enabled ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
    </button>
  );
}

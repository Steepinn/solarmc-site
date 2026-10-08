"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { playUiSound } from "@/lib/ui-sounds";

export function CopyIpButton({ ip }: { ip: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(ip);
      setCopied(true);
      playUiSound("success");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="pressable inline-flex min-h-12 items-center gap-2.5 rounded-2xl border border-border bg-card px-5 py-3 text-base font-bold transition-colors hover:bg-accent"
      aria-label="Скопировать IP сервера"
    >
      {copied ? <Check className="size-5 text-emerald-400" /> : <Copy className="size-5 text-solar-yellow" />}
      <span className="font-mono text-base tracking-tight">{ip}</span>
    </button>
  );
}

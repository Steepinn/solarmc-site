"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyProfileLink({ href }: { href: string }) {
  const [copied, setCopied] = useState(false);
  const [fullUrl, setFullUrl] = useState(href);

  useEffect(() => {
    setFullUrl(`${window.location.origin}${href}`);
  }, [href]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="flex-1 truncate rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        {fullUrl}
      </code>
      <button
        type="button"
        onClick={copy}
        className="btn-secondary inline-flex shrink-0 items-center justify-center gap-2"
      >
        {copied ? <Check className="size-4 text-green-400" /> : <Copy className="size-4" />}
        {copied ? "Скопировано" : "Скопировать"}
      </button>
    </div>
  );
}

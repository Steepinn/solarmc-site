"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { mainNav } from "@/config/site";

/** Прогрев маршрутов меню в idle — меньше холодной загрузки. */
export function NavPrefetch() {
  const router = useRouter();

  useEffect(() => {
    const hrefs = mainNav.map((i) => i.href);
    let cancelled = false;
    let timer = 0;

    const run = () => {
      if (cancelled) return;
      for (const href of hrefs) {
        router.prefetch(href);
      }
    };

    if (typeof window.requestIdleCallback === "function") {
      timer = window.requestIdleCallback(run, { timeout: 1200 });
    } else {
      timer = window.setTimeout(run, 350);
    }

    return () => {
      cancelled = true;
      if (typeof window.cancelIdleCallback === "function") {
        window.cancelIdleCallback(timer);
      } else {
        window.clearTimeout(timer);
      }
    };
  }, [router]);

  return null;
}

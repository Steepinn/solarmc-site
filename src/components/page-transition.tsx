"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { playUiSound } from "@/lib/ui-sounds";

/** Whoosh при смене страницы — без жёлтой шторки. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    playUiSound("whoosh");
    window.scrollTo(0, 0);
  }, [pathname]);

  return <div className="page-flip-root">{children}</div>;
}

"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageTransition } from "@/components/page-transition";
import { PageScrollRail } from "@/components/page-scroll-rail";
import { SolnyshkoChat } from "@/components/solnyshko-chat";

function isLauncherOAuthFlow(pathname: string) {
  return (
    pathname.startsWith("/launcher/done") ||
    pathname.startsWith("/launcher/connect")
  );
}

export function LauncherSiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  const minimal = isLauncherOAuthFlow(pathname);

  if (minimal) {
    return (
      <div className="site-shell relative flex min-h-screen flex-col">
        <div className="site-ambient" aria-hidden />
        <main className="site-shell__main relative z-[1] flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    );
  }

  return (
    <div className="site-shell relative flex min-h-screen flex-col">
      <div className="site-ambient" aria-hidden />
      <SiteHeader />
      <main className="site-shell__main relative z-[1] flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <SiteFooter />
      <PageScrollRail />
      <SolnyshkoChat />
    </div>
  );
}

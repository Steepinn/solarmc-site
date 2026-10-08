import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SoundProvider } from "@/components/sound-provider";
import { PageTransition } from "@/components/page-transition";
import { NavPrefetch } from "@/components/nav-prefetch";
import { SolnyshkoChat } from "@/components/solnyshko-chat";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SoundProvider>
      <NavPrefetch />
      <div className="site-shell relative flex min-h-screen flex-col">
        <div className="site-ambient" aria-hidden />
        <SiteHeader />
        <main className="site-shell__main relative z-[1] flex-1">
          <PageTransition>{children}</PageTransition>
        </main>
        <SiteFooter />
        <SolnyshkoChat />
      </div>
    </SoundProvider>
  );
}

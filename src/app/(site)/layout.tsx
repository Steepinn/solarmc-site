import { SoundProvider } from "@/components/sound-provider";
import { NavPrefetch } from "@/components/nav-prefetch";
import { LauncherSiteChrome } from "@/components/launcher-site-chrome";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SoundProvider>
      <NavPrefetch />
      <LauncherSiteChrome>{children}</LauncherSiteChrome>
    </SoundProvider>
  );
}

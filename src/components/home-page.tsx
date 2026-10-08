import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { homeLinks, siteConfig } from "@/config/site";
import { GalleryMarquee } from "@/components/gallery-marquee";
import { LinkCard } from "@/components/link-card";
import { CopyIpButton } from "@/components/copy-ip-button";

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-6 fill-current" aria-hidden>
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
    </svg>
  );
}

export function HeroSection() {
  return (
    <section className="hero-stage">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-4 py-16 text-center lg:py-20">
        <div className="hero-copy relative z-[1] flex w-full max-w-4xl flex-col items-center">
          <Image
            src="/logo.png"
            alt="SolarMC"
            width={720}
            height={280}
            className="hero-logo-mark h-auto w-[min(94vw,640px)] select-none drop-shadow-[0_0_36px_rgba(255,242,0,0.5)]"
            priority
          />
          <p className="mt-6 font-display text-2xl font-semibold text-solar-gold sm:text-3xl">
            Season 3 · Minecraft 1.21.1
          </p>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Мир под солнцем Solar: сезоны меняют правила, боссы ждут в тени, а твоя сущность решает, кем ты станешь.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/applications" className="btn-primary pressable text-lg">
              Заявка на проходку
            </Link>
            <Link
              href="/docs/mods/obzor"
              className="pressable inline-flex min-h-14 items-center gap-2 rounded-2xl px-3 text-lg font-bold text-foreground/80 transition hover:text-foreground"
            >
              Моды сезона
              <ArrowRight className="size-5" />
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <CopyIpButton ip={siteConfig.serverIp} />
            <Link
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-discord pressable"
            >
              <DiscordIcon />
              Discord
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function LinksSection() {
  return (
    <section className="relative z-[1] py-20">
      <div className="mx-auto max-w-[1400px] px-4">
        <div className="panel-surface mb-12 rounded-3xl px-6 py-7 text-center sm:px-10 sm:py-9">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Куда дальше
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
            Быстрые ссылки на вики, карту и соцсети сервера.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {homeLinks.map((item) => (
            <LinkCard key={item.href} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomePage() {
  return (
    <>
      <HeroSection />
      <GalleryMarquee />
      <LinksSection />
    </>
  );
}

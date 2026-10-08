import Image from "next/image";
import Link from "next/link";
import { footerNav, siteConfig } from "@/config/site";

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-foreground/80">
        {title}
      </h3>
      <ul className="space-y-1.5">
        {links.map((link) => {
          const external = link.href.startsWith("http");
          return (
            <li key={`${link.href}-${link.label}`}>
              <Link
                href={link.href}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer relative z-[1] mt-auto border-t border-border/70 bg-card">
      <div className="mx-auto max-w-[1400px] px-4 py-7 sm:py-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image src="/logo.png" alt="SolarMC" width={36} height={36} />
              <span className="font-display font-bold tracking-tight">SOLAR</span>
            </Link>
            <p className="mt-2 max-w-xs text-sm leading-snug text-muted-foreground">
              Season 3 · Minecraft 1.21.1 — выживание, города, данжи.
            </p>
          </div>
          <FooterColumn title="Навигация" links={footerNav.navigation} />
          <FooterColumn title="Разделы" links={footerNav.sections} />
          <FooterColumn title="Сервер" links={footerNav.server} />
          <FooterColumn title="Сообщество" links={footerNav.community} />
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border/80 pt-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Не связано с Mojang
            Studios или Microsoft.
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/terms" className="hover:text-foreground">
              Пользовательское соглашение
            </Link>
            <Link href="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
            <Link
              href={siteConfig.links.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground"
            >
              Discord
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { canAccessStaffWiki, getEnrichedSession } from "@/lib/auth";
import { WikiArticleMotion } from "@/components/wiki/wiki-article-motion";
import { WikiContent } from "@/components/wiki/wiki-content";
import { WikiMobileNav, WikiSidebar } from "@/components/wiki/wiki-sidebar";
import { WikiTableOfContents } from "@/components/wiki/wiki-toc";
import {
  defaultWikiPath,
  extractHeadings,
  filterWikiNavigation,
  getAllWikiSlugs,
  getBreadcrumbs,
  getWikiNavigation,
  getWikiPage,
  isStaffWikiPath,
} from "@/lib/wiki";

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAllWikiSlugs()
    .filter((slug) => slug[0] !== "admin")
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug = [] } = await params;
  if (slug[0] === "admin") {
    return { title: "Staff Wiki", robots: { index: false, follow: false } };
  }
  const page = getWikiPage(slug);
  if (!page) return { title: "Вики" };
  return { title: page.title, description: `SolarMC Wiki — ${page.title}` };
}

export default async function WikiPage({ params }: Props) {
  const { slug = [] } = await params;

  if (slug.length === 0) {
    redirect(defaultWikiPath);
  }

  const pathname = `/docs/${slug.join("/")}`;
  const session = await getEnrichedSession();
  const staffOk = canAccessStaffWiki(session);

  if (isStaffWikiPath(pathname) && !staffOk) {
    if (!session) {
      redirect("/auth/discord");
    }
    notFound();
  }

  const page = getWikiPage(slug);
  if (!page) notFound();

  const navigation = filterWikiNavigation(getWikiNavigation(), staffOk);
  const breadcrumbs = getBreadcrumbs(slug);
  const headings = extractHeadings(page.content);
  const pages = navigation.flatMap(section => section.items);
  const position = pages.findIndex(item => item.href === pathname);
  const previous = position > 0 ? pages[position - 1] : null;
  const next = position >= 0 ? pages[position + 1] : null;
  const readingMinutes = Math.max(1, Math.ceil(page.content.split(/\s+/).length / 200));

  return (
    <div className="wiki-shell relative z-[1] flex min-h-[calc(100vh-var(--site-shell-offset))] flex-col">
      <WikiMobileNav navigation={navigation} pathname={pathname} />
      <div className="wiki-body mx-auto flex w-full max-w-[1400px] flex-1">
        <WikiSidebar navigation={navigation} pathname={pathname} />
        <section aria-label="Статья вики" className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <WikiArticleMotion pathname={pathname}>
            <article className="rounded-[1.25rem] border border-border bg-card px-5 py-6 shadow-[var(--neon-glow)] sm:rounded-[1.5rem] sm:px-8 sm:py-8">
              <p className="text-xs font-medium uppercase tracking-wide text-solar-gold/90">
                {breadcrumbs.page}
              </p>
              <h1 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {page.title}
              </h1>
              <div className="wiki-page-meta"><span>База знаний Solar</span><span>·</span><span>{readingMinutes} мин. чтения</span><span>·</span><Link href="/docs/mods/server-build">Состав сборки</Link></div>
              <div className="neon-line mt-4 opacity-70" aria-hidden />
              <div className="mt-6 max-w-none">
                <WikiContent content={page.content} />
              </div>
              <nav className="wiki-pagination" aria-label="Соседние статьи">
                {previous && <Link href={previous.href}><small>← Предыдущая статья</small>{previous.title}</Link>}
                {next && <Link href={next.href}><small>Следующая статья →</small>{next.title}</Link>}
              </nav>
            </article>
          </WikiArticleMotion>
        </section>
        <WikiTableOfContents headings={headings} />
      </div>
    </div>
  );
}

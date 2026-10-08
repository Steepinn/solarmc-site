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

  return (
    <div className="wiki-shell relative z-[1] flex min-h-[calc(100vh-var(--site-shell-offset))] flex-col">
      <WikiMobileNav navigation={navigation} pathname={pathname} />
      <div className="wiki-body mx-auto flex w-full max-w-[1400px] flex-1">
        <WikiSidebar navigation={navigation} pathname={pathname} />
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          <WikiArticleMotion pathname={pathname}>
            <article className="rounded-[1.25rem] border border-border bg-card px-5 py-6 shadow-[var(--neon-glow)] sm:rounded-[1.5rem] sm:px-8 sm:py-8">
              <p className="text-xs font-medium uppercase tracking-wide text-solar-gold/90">
                {breadcrumbs.page}
              </p>
              <h1 className="font-display mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                {page.title}
              </h1>
              <div className="neon-line mt-4 opacity-70" aria-hidden />
              <div className="mt-6 max-w-none">
                <WikiContent content={page.content} />
              </div>
            </article>
          </WikiArticleMotion>
        </main>
        <WikiTableOfContents headings={headings} />
      </div>
    </div>
  );
}

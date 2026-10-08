import fs from "fs";
import path from "path";

export type WikiNavSection = {
  title: string;
  /** Только helper / moderator / administrator */
  staffOnly?: boolean;
  items: { title: string; href: string }[];
};

export function isStaffWikiPath(pathname: string) {
  return pathname === "/docs/admin" || pathname.startsWith("/docs/admin/");
}

export function filterWikiNavigation(
  navigation: WikiNavSection[],
  canViewStaff: boolean,
): WikiNavSection[] {
  if (canViewStaff) return navigation;
  return navigation.filter((s) => !s.staffOnly);
}

export type WikiPage = {
  slug: string[];
  title: string;
  content: string;
};

export type WikiHeading = {
  id: string;
  text: string;
  level: number;
};

const WIKI_ROOT = path.join(process.cwd(), "content", "wiki");

const PATH_ALIASES: Record<string, string> = {
  "informaciya/pravila-proekta": "informaciya/rules",
};

function gitbookPathToLocal(url: string): string | null {
  const match = url.match(
    /mcsolar\.gitbook\.io\/solar(?:\/~\/revisions\/[^/]+)?\/([^)\s?#]+)/,
  );
  if (!match) return null;
  let segment = match[1].replace(/\/$/, "");
  segment = PATH_ALIASES[segment] ?? segment;
  return `/docs/${segment}`;
}

export function getWikiNavigation(): WikiNavSection[] {
  const file = path.join(WIKI_ROOT, "navigation.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as WikiNavSection[];
}

export const wikiNavigation = getWikiNavigation();

export function preprocessWikiMarkdown(raw: string): string {
  let md = raw;

  md = md.replace(
    /\{%\s*hint\s+style="(\w+)"[^%]*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g,
    (_, style, body) => {
      const cleaned = body.replace(/\\(?=\n)/g, "\n").replace(/\&#xNAN;/g, "").trim();
      const variant = ["info", "warning", "danger", "success"].includes(style)
        ? style
        : "info";
      return `\n<div class="wiki-callout wiki-callout--${variant}">\n\n${cleaned}\n\n</div>\n`;
    },
  );

  md = md.replace(/<mark style="color:\$danger;">/g, '<mark class="wiki-mark wiki-mark--danger">');
  md = md.replace(/<mark style="color:\$success;">/g, '<mark class="wiki-mark wiki-mark--success">');
  md = md.replace(/<mark style="color:\$warning;">/g, '<mark class="wiki-mark wiki-mark--warning">');
  md = md.replace(/<mark style="color:\$primary;">/g, '<mark class="wiki-mark wiki-mark--primary">');
  md = md.replace(/<mark style="color:\$info;">/g, '<mark class="wiki-mark wiki-mark--info">');
  md = md.replace(/<mark style="color:yellow;">/g, '<mark class="wiki-mark wiki-mark--note">');

  md = md.replace(
    /<mark style="color:\$success;">([^<]*)<mark style="color:\$success;">/g,
    '<mark class="wiki-mark wiki-mark--success">$1</mark>',
  );

  md = md.replace(
    /<figure><img src="([^"]+)" alt="([^"]*)"><figcaption><\/figcaption><\/figure>/g,
    (_, src, alt) => `\n\n![${alt}](${src})\n\n`,
  );

  md = md.replace(
    /\[([^\]]+)\]\((https:\/\/mcsolar\.gitbook\.io\/solar[^)]+)\)/g,
    (full, label, url) => {
      const local = gitbookPathToLocal(url);
      return local ? `[${label}](${local})` : full;
    },
  );

  md = md.replace(/\&#xNAN;/g, "");
  md = md.replace(/\\(?=\n)/g, "\n");
  md = md.replace(/\*\*\*/g, "\n\n---\n\n");

  return md;
}

/** Общий slug для TOC и id у заголовков в WikiContent */
export function slugifyHeading(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
}

/** Уникальный id в пределах страницы (край → край, край-2, …) */
export function uniqueHeadingId(
  base: string,
  seen: Map<string, number>,
): string {
  const n = (seen.get(base) ?? 0) + 1;
  seen.set(base, n);
  return n === 1 ? base : `${base}-${n}`;
}

export function extractHeadings(content: string): WikiHeading[] {
  const headings: WikiHeading[] = [];
  const seen = new Map<string, number>();
  // Считаем h2–h4 в том же порядке, что WikiContent, в TOC только h2–h3
  for (const line of content.split("\n")) {
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (!match) continue;
    const level = match[1].length;
    const text = match[2].replace(/\*\*/g, "").replace(/<[^>]+>/g, "").trim();
    const id = uniqueHeadingId(slugifyHeading(text), seen);
    if (level <= 3) {
      headings.push({ id, text, level });
    }
  }
  return headings;
}

export function getWikiPage(slug: string[]): WikiPage | null {
  const filePath = path.join(WIKI_ROOT, ...slug) + ".md";
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const titleMatch = raw.match(/^#\s+(.+)$/m);
  const title = titleMatch?.[1]?.replace(/\*\*/g, "").trim() ?? slug.at(-1) ?? "Вики";

  return {
    slug,
    title,
    content: preprocessWikiMarkdown(raw),
  };
}

export function getAllWikiSlugs(): string[][] {
  const slugs: string[][] = [];

  function walk(dir: string, parts: string[]) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (
        entry.name === "manifest.json" ||
        entry.name === "navigation.json" ||
        entry.name === "images.json" ||
        entry.name.includes("--")
      ) {
        continue;
      }

      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, [...parts, entry.name]);
      } else if (entry.name.endsWith(".md")) {
        const name = entry.name.replace(/\.md$/, "");
        if (parts.length === 0 && name === "informaciya") continue;
        slugs.push([...parts, name]);
      }
    }
  }

  walk(WIKI_ROOT, []);
  return slugs;
}

export function getBreadcrumbs(slug: string[]) {
  const nav = getWikiNavigation();
  const path = `/docs/${slug.join("/")}`;
  for (const section of nav) {
    const item = section.items.find((i) => i.href === path);
    if (item) {
      return { section: section.title, page: item.title };
    }
  }
  return { section: "Вики", page: slug.at(-1) ?? "Страница" };
}

export const defaultWikiPath = "/docs/informaciya/home";

import fs from "fs";
import path from "path";

const BASE = "https://mcsolar.gitbook.io";
const OUT = path.join(process.cwd(), "content", "wiki");

const extraPaths = [
  "/solar/informaciya/home",
  "/solar/informaciya/rules/allowed-mods",
  "/solar/informaciya/rules/zapreshennye-slova",
  "/solar/guides/recepty-napitkov",
  "/solar/guides/gaid-po-napitkam/recepty-napitkov",
];

function clean(md) {
  return md
    .replace(/^> For the complete documentation index.*\n\n/m, "")
    .replace(/---\n\n# Agent Instructions[\s\S]*$/m, "")
    .trim();
}

async function fetchPage(pagePath) {
  const mdUrl = `${BASE}${pagePath}.md`;
  const res = await fetch(mdUrl);
  if (!res.ok) return null;
  const md = await res.text();
  if (md.includes("# Page Not Found")) return null;
  return clean(md);
}

async function main() {
  const html = await fetch(`${BASE}/solar`).then((r) => r.text());
  const fromHtml = [...html.matchAll(/href="(\/solar\/[^"#?]+)"/g)].map((m) => m[1]);
  const queue = [...new Set([...fromHtml, ...extraPaths])];
  const seen = new Set();
  const pages = [];

  fs.mkdirSync(OUT, { recursive: true });

  while (queue.length) {
    const pagePath = queue.shift();
    if (!pagePath || seen.has(pagePath) || pagePath.includes("~gitbook")) continue;
    seen.add(pagePath);

    const md = await fetchPage(pagePath);
    if (!md) continue;

    const slug = pagePath.replace(/^\/solar\//, "").replace(/\//g, "--");
    fs.writeFileSync(path.join(OUT, `${slug}.md`), md, "utf8");

    const titleMatch = md.match(/^#\s+(.+)$/m);
    pages.push({
      slug,
      path: pagePath,
      title: titleMatch?.[1]?.trim() ?? slug,
    });

    const links = [...md.matchAll(/\]\((\/solar\/[^)]+)\)/g)].map((m) => m[1]);
    for (const link of links) queue.push(link);

    console.log("saved", slug);
  }

  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(pages, null, 2), "utf8");
  console.log("total", pages.length);
}

main();

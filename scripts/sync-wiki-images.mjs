import fs from "fs";
import path from "path";

const BASE = "https://mcsolar.gitbook.io";
const WIKI_ROOT = path.join(process.cwd(), "content", "wiki");
const ASSETS = path.join(process.cwd(), "public", "wiki", "assets");
const MANIFEST = JSON.parse(
  fs.readFileSync(path.join(WIKI_ROOT, "manifest.json"), "utf8"),
);

function decodeGitbookProxy(src) {
  const clean = src.replace(/&amp;/g, "&");
  if (!clean.includes("~gitbook/image?url=")) return clean;
  const encoded = new URL(clean, BASE).searchParams.get("url");
  return encoded ? decodeURIComponent(encoded) : clean;
}

function contentImages(html) {
  return [...html.matchAll(/<img[^>]+src="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((src) => src.includes("184617085-files.gitbook.io") || src.includes("/uploads/"))
    .map(decodeGitbookProxy);
}

async function download(url, outPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status}`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  fs.mkdirSync(ASSETS, { recursive: true });
  const localMap = {};

  for (const page of MANIFEST) {
    const rel = page.path.replace(/^\/solar\//, "");
    const mdPath = path.join(WIKI_ROOT, ...rel.split("/")) + ".md";
    if (!fs.existsSync(mdPath)) continue;

    let md = fs.readFileSync(mdPath, "utf8");
    const ids = [...md.matchAll(/\/files\/([A-Za-z0-9]+)/g)].map((m) => m[1]);
    if (!ids.length) continue;

    const html = await fetch(`${BASE}${page.path}`).then((r) => r.text());
    const imgs = contentImages(html);

    for (let i = 0; i < ids.length; i++) {
      const id = ids[i];
      if (localMap[id]) continue;

      const candidates = [
        imgs[i],
        `https://mcsolar.gitbook.io/solar/files/${id}`,
        `https://mcsolar.gitbook.io/files/${id}`,
      ].filter(Boolean);

      for (const url of candidates) {
        const ext = url.includes(".png") ? "png" : url.includes(".jpg") ? "jpg" : "webp";
        const local = `/wiki/assets/${id}.${ext}`;
        const out = path.join(process.cwd(), "public", local);
        try {
          await download(url, out);
          localMap[id] = local;
          console.log("ok", id);
          break;
        } catch {
          /* try next */
        }
      }
    }
  }

  fs.writeFileSync(path.join(WIKI_ROOT, "images.json"), JSON.stringify(localMap, null, 2));

  for (const page of MANIFEST) {
    const rel = page.path.replace(/^\/solar\//, "");
    const mdPath = path.join(WIKI_ROOT, ...rel.split("/")) + ".md";
    if (!fs.existsSync(mdPath)) continue;

    let md = fs.readFileSync(mdPath, "utf8");
    md = md.replace(/\/files\/([A-Za-z0-9]+)/g, (_, id) => {
      if (localMap[id]) return localMap[id];
      return `https://mcsolar.gitbook.io/solar/files/${id}`;
    });
    fs.writeFileSync(mdPath, md);
  }

  console.log("saved", Object.keys(localMap).length);
}

main();

import fs from "fs";
import path from "path";

const WIKI_ROOT = path.join(process.cwd(), "content", "wiki");
const ASSETS = path.join(process.cwd(), "public", "wiki", "assets");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (entry.name.endsWith(".md")) files.push(full);
  }
  return files;
}

async function download(fileId) {
  const url = `https://mcsolar.gitbook.io/solar/files/${fileId}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = res.headers.get("content-type")?.includes("png") ? "png" : "webp";
  const out = path.join(ASSETS, `${fileId}.${ext}`);
  fs.writeFileSync(out, buf);
  return `/wiki/assets/${fileId}.${ext}`;
}

async function main() {
  fs.mkdirSync(ASSETS, { recursive: true });
  const ids = new Set();

  for (const file of walk(WIKI_ROOT)) {
    const md = fs.readFileSync(file, "utf8");
    for (const m of md.matchAll(/\/files\/([A-Za-z0-9]+)/g)) ids.add(m[1]);
  }

  const map = {};
  for (const id of ids) {
    try {
      map[id] = await download(id);
      console.log("ok", id, "->", map[id]);
    } catch (e) {
      console.error("fail", id, e.message);
    }
  }

  fs.writeFileSync(
    path.join(WIKI_ROOT, "images.json"),
    JSON.stringify(map, null, 2),
  );

  for (const file of walk(WIKI_ROOT)) {
    let md = fs.readFileSync(file, "utf8");
    md = md.replace(/\/files\/([A-Za-z0-9]+)/g, (_, id) => map[id] ?? `/wiki/assets/${id}.webp`);
    fs.writeFileSync(file, md);
  }

  console.log("done", Object.keys(map).length);
}

main();

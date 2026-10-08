import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "content", "wiki");
const manifest = JSON.parse(
  fs.readFileSync(path.join(SRC, "manifest.json"), "utf8"),
);

for (const page of manifest) {
  const rel = page.path.replace(/^\/solar\//, "");
  const dest = path.join(SRC, ...rel.split("/")) + ".md";
  const src = path.join(SRC, `${page.slug}.md`);

  if (!fs.existsSync(src)) continue;

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, fs.readFileSync(src, "utf8"));
  console.log(page.slug, "->", rel + ".md");
}

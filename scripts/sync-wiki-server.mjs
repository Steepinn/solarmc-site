import fs from "node:fs";
import path from "node:path";
import { inflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root, process.env.NODE_ENV === "development", { info() {}, error: console.error });
// Only public package metadata is exported. Config files, user data and tokens are never read.
const fallback = "C:\\Users\\Steep\\OneDrive\\Рабочий стол\\Солярка закрытая";
const server = process.env.MINECRAFT_SERVER_PATH || process.env.SOLAR_MC_SERVER_PATH || fallback;
const output = path.join(root, "content/wiki/mods/server-build.md");
const snapshotPath = path.join(root, "content/solnyshko/wiki-server-snapshot.json");
function archiveText(buffer, name) {
  let end = buffer.length - 22;
  while (end >= Math.max(0, buffer.length - 65557) && buffer.readUInt32LE(end) !== 0x06054b50) end--;
  if (end < 0 || buffer.readUInt32LE(end) !== 0x06054b50) return null;
  let offset = buffer.readUInt32LE(end + 16);
  const count = buffer.readUInt16LE(end + 10);
  for (let i = 0; i < count; i++) {
    if (offset + 46 > buffer.length || buffer.readUInt32LE(offset) !== 0x02014b50) return null;
    const size = buffer.readUInt32LE(offset + 20), unpacked = buffer.readUInt32LE(offset + 24);
    const nameSize = buffer.readUInt16LE(offset + 28), extra = buffer.readUInt16LE(offset + 30), comment = buffer.readUInt16LE(offset + 32);
    const filename = buffer.toString("utf8", offset + 46, offset + 46 + nameSize);
    if (filename === name) {
      if (unpacked > 2_000_000) throw new Error("Package metadata exceeds limit");
      const local = buffer.readUInt32LE(offset + 42);
      if (buffer.readUInt32LE(local) !== 0x04034b50) throw new Error("Invalid archive header");
      const start = local + 30 + buffer.readUInt16LE(local + 26) + buffer.readUInt16LE(local + 28);
      const bytes = buffer.subarray(start, start + size), method = buffer.readUInt16LE(offset + 10);
      if (method === 0) return bytes.toString("utf8");
      if (method === 8) return inflateRawSync(bytes, { maxOutputLength: 2_000_000 }).toString("utf8");
      return null;
    }
    offset += 46 + nameSize + extra + comment;
  }
  return null;
}
const yamlValue = (text, key) => text?.match(new RegExp(`^${key}:\\s*['\"]?([^\\r\\n]+)`, "m"))?.[1]?.replace(/['\"]$/, "").trim();
function scan(dir, kind) {
  return fs.readdirSync(dir).filter(name => /\.jar$/i.test(name)).sort().map(file => {
    const buffer = fs.readFileSync(path.join(dir, file));
    let meta = {}, warning;
    try {
      if (kind === "mod") meta = JSON.parse(archiveText(buffer, "fabric.mod.json") || "{}");
      else { const yaml = archiveText(buffer, "plugin.yml") || archiveText(buffer, "paper-plugin.yml"); meta = { id: yamlValue(yaml, "name"), name: yamlValue(yaml, "name"), version: yamlValue(yaml, "version"), description: yamlValue(yaml, "description") }; }
    } catch { warning = "Метаданные не удалось прочитать"; }
    return { file, kind, id: meta.id || file.replace(/\.jar$/i,""), name: meta.name || meta.id || file, version: String(meta.version || "—"), description: typeof meta.description === "string" ? meta.description : "", sha256: createHash("sha256").update(buffer).digest("hex"), ...(warning ? { warning } : {}) };
  });
}
const escape = value => String(value).replace(/[<>]/g, "").replace(/\|/g, "\\|").replace(/[\r\n]+/g, " ").replace(/`/g, "'");
function sync() {
  const modsDir = process.env.SOLAR_SERVER_MODS || path.join(server,"mods");
  const pluginsDir = process.env.SOLAR_SERVER_PLUGINS || path.join(server,"plugins");
  if (!fs.existsSync(modsDir) || !fs.existsSync(pluginsDir)) { console.warn("Wiki sync: server unavailable; keeping last verified snapshot."); return; }
  const packages = [...scan(modsDir,"mod"), ...scan(pluginsDir,"plugin")];
  if (!packages.length) { console.warn("Wiki sync: no packages; keeping previous snapshot."); return; }
  const digest = createHash("sha256").update(JSON.stringify(packages)).digest("hex");
  let previous;
  if (fs.existsSync(snapshotPath)) previous = JSON.parse(fs.readFileSync(snapshotPath,"utf8"));
  if (previous?.digest === digest && fs.existsSync(output)) { console.log(`Wiki sync: unchanged (${packages.length} packages).`); return; }
  const updated = new Date().toISOString();
  const seen = new Map();
  for (const p of packages) { const key = `${p.kind}:${p.id}`; seen.set(key,[...(seen.get(key)||[]),p]); }
  const duplicates = [...seen.values()].filter(list=>list.length>1);
  const before = new Map((previous?.packages || []).map(p => [`${p.kind}:${p.id}:${p.file}`,p]));
  const after = new Set(packages.map(p=>`${p.kind}:${p.id}:${p.file}`));
  const added = packages.filter(p=>!before.has(`${p.kind}:${p.id}:${p.file}`));
  const removed = (previous?.packages||[]).filter(p=>!after.has(`${p.kind}:${p.id}:${p.file}`));
  let md = `# Актуальная сборка сервера\n\nСнимок обновлён: **${updated.slice(0,10)}** (UTC).\n\nКаталог автоматически формируется из JAR в папках сервера. Он подтверждает наличие файлов, а не успешную загрузку модов или доступность каждой команды. Отложенные обновления и архивы не входят в снимок.\n\n## Что нового\n\n`;
  md += previous ? `${added.length ? "Добавлены или обновлены файлы: " + added.map(p=>`**${escape(p.name)} ${escape(p.version)}**`).join(", ") + "." : "Новых файлов нет."}\n\n${removed.length ? "Удалены из папок: " + removed.map(p=>escape(p.name)).join(", ") + ".\n\n" : ""}` : "Первый снимок текущего состава. Последующие синхронизации показывают изменения относительно предыдущего снимка.\n\n";
  md += "## Новые возможности Solar\n\n- [Меню Solar, игроки и репутация](/docs/mods/solar-hub)\n- [Украшения, плащи и Solar Points](/docs/mods/solar-cosmetics)\n- [Отдых и восстановление здоровья](/docs/mods/solar-rest)\n- [Зачарования Incantationem](/docs/mods/incantationem)\n\n";
  if (duplicates.length) md += "## Повторяющиеся пакеты\n\nВ папках найдены несколько файлов с одним идентификатором. Какой из них загружен, нужно сверять с журналом сервера.\n\n" + duplicates.map(list=>`- **${escape(list[0].name)}**: ${list.map(p=>`\`${escape(p.file)}\``).join(", ")}`).join("\n") + "\n\n";
  for (const [kind,title] of [["mod","Моды"],["plugin","Плагины"]]) {
    const list=packages.filter(p=>p.kind===kind);
    md += `## ${title} · ${list.length}\n\n| Название | Версия | Файл |\n| --- | --- | --- |\n` + list.map(p=>`| ${escape(p.name)} | ${escape(p.version)} | ${escape(p.file)} |`).join("\n") + "\n\n";
  }
  md += "## Как обновляется вики\n\nСостав сверяется при запуске разработки и сборке сайта. Для постоянного наблюдения за папками используйте `npm run sync:wiki:watch`; разовая синхронизация — `npm run sync:wiki`. Если сервер недоступен, сохраняется предыдущий снимок. На удалённом хостинге нужен доступ к папкам сервера либо перенос нового снимка вместе с сайтом.\n\nАвтоматический каталог не заменяет проверку игровых механик: описания и инструкции поддерживаются отдельными статьями.\n";
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output+".tmp",md);fs.renameSync(output+".tmp",output);
  fs.writeFileSync(snapshotPath+".tmp",JSON.stringify({updated,digest,packages},null,2)+"\n");fs.renameSync(snapshotPath+".tmp",snapshotPath);
  console.log(`Wiki sync: ${packages.length} packages, ${duplicates.length} duplicate IDs.`);
}
try { sync(); } catch (error) { console.error("Wiki sync failed:",error.message); process.exitCode=1; }
if (process.argv.includes("--watch")) setInterval(()=>{try { sync(); } catch(error) { console.error("Wiki sync failed:",error.message); }},60_000);

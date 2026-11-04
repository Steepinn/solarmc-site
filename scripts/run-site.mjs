import { spawn } from "node:child_process";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const mode = process.argv[2];
if (!["dev", "start"].includes(mode)) throw new Error("Expected dev or start");
process.env.NODE_ENV ||= mode === "dev" ? "development" : "production";
const watcher = spawn(process.execPath, ["scripts/sync-wiki-server.mjs", "--watch"], { stdio: "inherit", windowsHide: true });
const next = spawn(process.execPath, [require.resolve("next/dist/bin/next"), mode, ...process.argv.slice(3)], { stdio: "inherit", windowsHide: true });
let closing = false;
function close(code) { if (closing) return; closing = true; watcher.kill(); next.kill(); process.exitCode = code; }
next.on("exit", code => close(code ?? 0));
next.on("error", error => { console.error(error); close(1); });
watcher.on("error", error => console.error("Wiki watcher:", error.message));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => close(0));

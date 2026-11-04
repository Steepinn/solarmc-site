import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const base = process.env.CHECK_SITE_URL || "http://127.0.0.1:3000";
const out = path.resolve("artifacts/redesign");
fs.mkdirSync(out,{recursive:true});
const report = { at:new Date().toISOString(), checks:[], failures:[], limitations:["Discord OAuth with a real account, staff mutations and purchases require an authenticated test session; they were not performed.","A package inventory confirms files, not successful Minecraft runtime loading.","Website bank endpoints are intentionally disabled (410)."] };
async function check(name, action) { try { await action(); report.checks.push(name); console.log("PASS",name); } catch(error) { report.failures.push({name,error:error.message}); console.error("FAIL",name,error.message); } }
const browser = await chromium.launch({channel:"msedge",headless:true});
const context = await browser.newContext({ viewport:{width:1440,height:1000},reducedMotion:"reduce" });
await context.addInitScript(()=>{localStorage.setItem("solar-cookie-consent","accepted");sessionStorage.setItem("solar-splash-seen","1");if(!localStorage.getItem("theme"))localStorage.setItem("theme","dark");});
const page=await context.newPage();
const runtimeErrors=[];page.on("pageerror",error=>runtimeErrors.push(error.message));
await check("Homepage renders and images load",async()=>{
 const response=await page.goto(base,{waitUntil:"networkidle",timeout:90000});assert.equal(response.status(),200);
 await page.getByRole("heading",{level:1}).filter({hasText:"Твоя история"}).waitFor();
 await page.locator(".solar-hero-image").evaluate(image=>image.decode());
 assert.equal(await page.locator(".solar-feature-card").count(),3);
 await page.screenshot({path:path.join(out,"home-desktop.png"),fullPage:true});
});
await check("Theme switches to light and persists after reload",async()=>{
 await page.getByRole("button",{name:"Включить светлую тему"}).click();
 await page.waitForFunction(()=>document.documentElement.classList.contains("light"));
 await page.reload({waitUntil:"networkidle"});assert(await page.locator("html").evaluate(el=>el.classList.contains("light")));
 await page.screenshot({path:path.join(out,"home-light.png"),fullPage:true});
 await page.getByRole("button",{name:"Включить тёмную тему"}).click();
});
await check("Main menu opens and closes with Escape",async()=>{
 await page.getByRole("button",{name:"Открыть меню",exact:true}).click();await page.getByRole("navigation",{name:"Навигация",exact:true}).waitFor();
 await page.keyboard.press("Escape");await page.getByRole("navigation",{name:"Навигация",exact:true}).waitFor({state:"hidden"});
});
await check("Wiki search, empty state, table of contents and article navigation",async()=>{
 const response=await page.goto(base+"/docs/mods/solar-hub",{waitUntil:"networkidle",timeout:90000});assert.equal(response.status(),200);
 const search=page.getByRole("searchbox",{name:"Поиск разделов вики"}).first();await search.fill("плащи");
 const result=page.locator(".wiki-sidebar").getByRole("link",{name:"Украшения и плащи",exact:true});await result.waitFor();
 await search.fill("zzzz-no-result");await page.locator(".wiki-sidebar").getByRole("status").waitFor();await search.fill("");
 await page.screenshot({path:path.join(out,"wiki-debug.png"),fullPage:true});

 const toc=page.locator(".wiki-toc-link").first();const href=await toc.getAttribute("href");assert(await page.locator(`[id="${href.slice(1)}"]`).count());await toc.click();
 assert.equal(decodeURIComponent(new URL(page.url()).hash),href);
 await page.getByRole("searchbox",{name:"Поиск разделов вики"}).first().blur();
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:path.join(out,"wiki-desktop.png"),fullPage:true});
 assert(await page.getByRole("navigation",{name:"Соседние статьи"}).getByRole("link").count()>0);
});
await check("All public wiki navigation links resolve",async()=>{
 const nav=JSON.parse(fs.readFileSync("content/wiki/navigation.json","utf8"));
 for(const section of nav.filter(s=>!s.staffOnly)) for(const item of section.items){
  const file=path.join("content/wiki",item.href.replace(/^\/docs\//,""))+".md";assert(fs.existsSync(file),`Missing wiki file: ${item.href}`);
  const response=await context.request.get(base+item.href,{timeout:60000});assert.equal(response.status(),200,item.href);
 }
});
await check("Public pages return 200",async()=>{
 for(const route of ["/launcher","/map","/status","/shop","/cities","/events","/courts","/bans","/team","/support","/applications","/terms","/cookies"]){
  const response=await context.request.get(base+route,{timeout:90000});assert.equal(response.status(),200,route);
 }
});
await check("Private APIs reject unauthenticated access",async()=>{
 for(const route of ["/api/support","/api/notifications","/api/admin/stats","/api/admin/roles"]){
  const response=await context.request.get(base+route,{timeout:60000});assert([401,403].includes(response.status()),`${route}: ${response.status()}`);
 }
 for(const route of ["/api/support","/api/applications"]){const response=await context.request.post(base+route,{data:{},timeout:60000});assert.equal(response.status(),401,route);}
});
await check("Launcher input validation and disabled bank responses",async()=>{
 assert.equal((await context.request.get(base+"/api/launcher/poll")).status(),400);
 for(const route of ["/api/bank/transfer","/api/bank/pay-fine"]){assert.equal((await context.request.post(base+route)).status(),410);}
});
await check("Anonymous user cannot open staff wiki or admin",async()=>{
 for(const route of ["/docs/admin/home","/admin"]){const response=await context.request.get(base+route,{maxRedirects:0});assert([302,303,307,308].includes(response.status()),route);assert(response.headers().location.includes("/auth/discord"));}
});
await check("Server status API returns structured data",async()=>{const response=await context.request.get(base+"/api/status",{timeout:60000});assert.equal(response.status(),200);assert.equal(typeof await response.json(),"object");});
await check("Mobile homepage has no horizontal overflow",async()=>{
 await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:"networkidle"});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.screenshot({path:path.join(out,"home-mobile.png"),fullPage:true});
 await page.getByRole("button",{name:"Открыть меню",exact:true}).click();await page.getByRole("navigation",{name:"Навигация",exact:true}).waitFor();await page.keyboard.press("Escape");
});
await check("Mobile wiki navigation and search",async()=>{
 await page.goto(base+"/docs/mods/solar-hub",{waitUntil:"networkidle"});
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 await page.getByRole("button",{name:/Содержание/}).click();
 const search=page.getByRole("searchbox",{name:"Поиск разделов вики"}).filter({visible:true});
 await search.fill("плащи");await page.getByRole("link",{name:"Украшения и плащи",exact:true}).filter({visible:true}).click();
 await page.waitForURL("**/docs/mods/solar-cosmetics");
 await page.screenshot({path:path.join(out,"wiki-mobile.png"),fullPage:true});
});
await check("No browser runtime exceptions",async()=>assert.deepEqual(runtimeErrors,[]));
await browser.close();
fs.writeFileSync(path.join(out,"checks.json"),JSON.stringify(report,null,2)+"\n");
console.log(`Checks: ${report.checks.length} passed, ${report.failures.length} failed. Artifacts: ${out}`);
if(report.failures.length)process.exitCode=1;

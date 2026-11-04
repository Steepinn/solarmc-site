import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const base = process.env.CHECK_SITE_URL || "http://127.0.0.1:3001";
const out = path.resolve("artifacts/mobile"); fs.mkdirSync(out, {recursive:true});
const browser = await chromium.launch({ channel:"msedge",headless:true });
const checks = [], failures = [];
async function check(name,fn){try {await fn();checks.push(name);console.log("PASS",name);} catch(error){failures.push({name,error:error.message});console.error("FAIL",name,error.message);}}
for(const viewport of [{width:320,height:568},{width:360,height:640},{width:390,height:844},{width:430,height:932},{width:768,height:1024},{width:844,height:390}]) {
 const mobile=viewport.width<768;
 const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,reducedMotion:"reduce"});
 await context.addInitScript(()=>{sessionStorage.setItem("solar-splash-seen","1");localStorage.setItem("solar-cookie-consent","accepted");localStorage.setItem("theme","dark");});
 const page=await context.newPage();const errors=[];page.on("pageerror",e=>errors.push(e.message));
 const label=`${viewport.width}x${viewport.height}`;
 await check(label+" homepage, images, and header",async()=>{
  const resp=await page.goto(base,{waitUntil:"networkidle",timeout:90000});assert.equal(resp.status(),200);
  await page.getByRole("link",{name:"Войти через Discord"}).waitFor();
  await page.locator(".solar-feature-image img").evaluateAll(imgs=>Promise.all(imgs.map(i=>i.decode())));
  const geometry=await page.evaluate(()=>{const h=document.querySelector('#nd-nav>div');const items=[...h.children].filter(e=>getComputedStyle(e).display!=='none');return {scroll:document.documentElement.scrollWidth,viewport:innerWidth,items:items.map(e=>{const b=e.getBoundingClientRect();return {left:b.left,right:b.right,width:b.width}})};});
  assert(geometry.scroll<=geometry.viewport+1,JSON.stringify(geometry));
  for(const b of geometry.items)assert(b.left>=-1&&b.right<=geometry.viewport+1,JSON.stringify(geometry));
  if(viewport.width===390){await page.screenshot({path:path.join(out,"home-390.png"),fullPage:true});await page.locator(".solar-feature-grid").screenshot({path:path.join(out,"images-390.png")});}
 });
 await check(label+" all menu links reachable",async()=>{
  await page.getByRole("button",{name:"Открыть меню",exact:true}).click();
  const nav=page.getByRole("navigation",{name:"Навигация",exact:true});await nav.waitFor();
  const link=nav.getByRole("link",{name:"Команда",exact:true});await link.scrollIntoViewIfNeeded();
  const geom=await link.evaluate(el=>{const b=el.getBoundingClientRect();return {top:b.top,bottom:b.bottom,height:innerHeight};});
  assert(geom.top>=0&&geom.bottom<=geom.height+1,JSON.stringify(geom));
  await link.click();await page.waitForURL("**/team");
 });
 await check(label+" wiki nav and search",async()=>{
  await page.goto(base+"/docs/mods/solar-hub",{waitUntil:"networkidle"});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  const toggle=page.getByRole("button",{name:/Содержание/});
  if(await toggle.isVisible()){
   await toggle.click();const input=page.getByRole("searchbox",{name:"Поиск разделов вики"}).filter({visible:true});await input.fill("плащи");
   await page.getByRole("link",{name:"Украшения и плащи",exact:true}).filter({visible:true}).click();await page.waitForURL("**/docs/mods/solar-cosmetics");
  }
  if(viewport.width===390)await page.screenshot({path:path.join(out,"wiki-390.png"),fullPage:true});
 });
 await check(label+" other public pages",async()=>{
  for(const route of ["/shop","/map","/status","/cities","/applications","/support","/launcher"]){
   const response=await page.goto(base+route,{waitUntil:"domcontentloaded",timeout:60000});assert.equal(response.status(),200,route);
   const dims=await page.evaluate(()=>({width:innerWidth,doc:document.documentElement.scrollWidth,body:document.body.scrollWidth}));assert(dims.doc<=dims.width+1&&dims.body<=dims.width+1,route+" "+JSON.stringify(dims));
  }
 });
 await check(label+" mobile assistant stays on screen",async()=>{
  await page.goto(base,{waitUntil:"networkidle"});await page.getByRole("button",{name:"Открыть Солнышко"}).click();
  const dialog=page.getByRole("dialog",{name:"Солнышко — помощник Solar"});await dialog.waitFor();
  const b=await dialog.boundingBox();assert(b.x>=-1&&b.y>=-1&&b.x+b.width<=viewport.width+1&&b.y+b.height<=viewport.height+1,JSON.stringify(b));
  await dialog.getByRole("button",{name:"Закрыть",exact:true}).click();assert.equal(errors.length,0,errors.join("; "));
 });
 await context.close();
}
await check("320px logged-in header and notification panel",async()=>{
 const c=await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true,reducedMotion:"reduce"});
 await c.addInitScript(()=>{sessionStorage.setItem("solar-splash-seen","1");localStorage.setItem("solar-cookie-consent","accepted");});
 await c.route("**/api/auth/me",route=>route.fulfill({json:{user:{id:"test",discordId:"test",username:"Player",avatar:"/brand-face.png",isAdmin:false}}}));
 await c.route("**/api/notifications",route=>route.fulfill({json:{notifications:[],unread:0}}));
 const p=await c.newPage();await p.goto(base,{waitUntil:"networkidle"});
 const button=p.getByRole("button",{name:"Уведомления"});await button.waitFor();const profile=p.getByRole("button",{name:"Меню профиля"});await profile.waitFor();
 for(const el of [button,profile]){const b=await el.boundingBox();assert(b.x>=0&&b.x+b.width<=320,JSON.stringify(b));}
 await button.click();const panel=p.locator(".solar-notifications-panel");await panel.waitFor();const b=await panel.boundingBox();assert(b.x>=0&&b.x+b.width<=320,JSON.stringify(b));
 await button.click();await profile.click();await p.getByRole("link",{name:"Профиль",exact:true}).waitFor();await c.close();
});
fs.writeFileSync(path.join(out,"checks.json"),JSON.stringify({checks,failures},null,2));
console.log(`${checks.length} passed; ${failures.length} failed`);await browser.close();if(failures.length)process.exitCode=1;

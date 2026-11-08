import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {chromium} from "playwright";

const site=resolve(process.argv[2]||"site-root");
const html=readFileSync(join(site,"circuitjgr.html"),"utf8");
assert(!existsSync(join(site,"circuitjs.html")),
 "El simulador raíz debe usar circuitjgr.html, no un duplicado de circuitjs.html");
assert(html.includes('<title>Circuits JGR 1.0</title>'));
assert(html.includes('src="./initial-settings.js"'));
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({locale:"es-ES",viewport:{width:1280,height:850}});
 const page=await context.newPage();
 page.on("pageerror",error=>console.error("Error en Circuits JGR:",error.message));
 await page.goto("http://127.0.0.1:8767/circuitjgr.html",{waitUntil:"domcontentloaded"});
 assert.equal(await page.title(),"Circuits JGR 1.0");
 await page.locator("#lab-start-modal").waitFor({state:"visible",timeout:30000});
 assert.equal(await page.locator('input[name="lab-start-format"]').count(),2);
 await page.locator("#lab-start-accept").click();
 await page.waitForFunction(()=>!!(window.CircuitJS1?.getElements),null,{timeout:90000});
 assert.equal(await page.locator(".lab-start-settings").count(),1);
 await page.goto("http://127.0.0.1:8767/circuitjs/about.html?lang=es",
  {waitUntil:"domcontentloaded"});
 const brand=page.locator("#circuits-jgr-identity");
 await brand.waitFor({state:"visible"});
 assert.match(await brand.innerText(),/Circuits JGR 1\.0/);
 assert.match(await brand.innerText(),/Jesús Gracia Ruiz/);
 assert.match(await brand.innerText(),/Desarrollo y adaptación/);
 assert.match(await page.locator("body").innerText(),/Paul Falstad/);
 assert.match(await page.locator("body").innerText(),/Iain Sharp/);
 const files=await page.locator('#circuits-jgr-identity a').evaluateAll(
  nodes=>nodes.map(n=>n.getAttribute("href")));
 assert(files.includes("../LICENSE-GPLv3.txt"));
 console.log("OK: Vite abre Circuits JGR 1.0 en la raíz, configuración regional "+
  "y Acerca de con autor, créditos y licencia; sin rutas del laboratorio.");
 await context.close();
}finally{await browser.close();}

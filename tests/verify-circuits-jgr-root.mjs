import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {resolve,join} from "node:path";
import {chromium} from "playwright";

const site=resolve(process.argv[2]||"site-root");
const html=readFileSync(join(site,"circuitjgr.html"),"utf8");
assert(!existsSync(join(site,"circuitjs.html")),
 "El simulador raíz debe usar circuitjgr.html, no un duplicado de circuitjs.html");
assert(html.includes('<title>Circuit JGR 1.0</title>'));
assert(html.includes('src="./initial-settings.js"'));
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({locale:"es-ES",viewport:{width:1280,height:850}});
 const page=await context.newPage();
 page.on("pageerror",error=>console.error("Error en Circuit JGR:",error.message));
 await page.goto("http://127.0.0.1:8767/",{waitUntil:"domcontentloaded"});
 assert.equal(await page.title(),"Circuit JGR | Inicio");
 assert.equal(await page.locator('a[href="./circuitjgr.html"]').count(),1,
  "La portada debe ofrecer acceso al simulador");
 assert.equal(await page.locator('a[href="./electrotecnia/"]').count(),1,
  "La portada debe conservar el acceso al laboratorio");

 await page.goto("http://127.0.0.1:8767/circuitjgr.html",{waitUntil:"domcontentloaded"});
 assert.equal(await page.title(),"Circuit JGR 1.0");
 await page.locator("#lab-start-modal").waitFor({state:"visible",timeout:30000});
 assert.equal(await page.locator('input[name="lab-start-format"]').count(),2);
 await page.locator("#lab-start-accept").click();
 await page.waitForFunction(()=>!!(window.CircuitJS1?.getElements),null,{timeout:90000});
 assert.equal(await page.locator(".lab-start-settings").count(),1);
 await page.goto("http://127.0.0.1:8767/circuitjs/about.html?lang=es",
  {waitUntil:"domcontentloaded"});
 const brand=page.locator("#circuits-jgr-identity");
 await brand.waitFor({state:"visible"});
 assert.match(await brand.innerText(),/Circuit JGR 1\.0/);
 assert.match(await brand.innerText(),/Jesús Gracia Ruiz/);
 assert.match(await brand.innerText(),/Desarrollo y adaptación/);
 assert.match(await page.locator("body").innerText(),/Paul Falstad/);
 assert.match(await page.locator("body").innerText(),/Iain Sharp/);
 const files=await page.locator('#circuits-jgr-identity a').evaluateAll(
  nodes=>nodes.map(n=>n.getAttribute("href")));
 assert(files.includes("../LICENSE-GPLv3.txt"));

 // Comprobar la ventana real (no solo los diccionarios) en los 22 idiomas.
 // Prioridad: inglés, valenciano; después el resto, sin omitir créditos legales.
 const allLanguages=["en","ca-es-valencia","es","ca","gl","eu","de","fr","it",
  "pt","nl","sv","da","nb","fi","pl","csx","ru","zh","zh-tw","ja","kr"];
 for(const language of allLanguages){
  await page.goto("http://127.0.0.1:8767/circuitjs/about.html?lang="+
   encodeURIComponent(language),{waitUntil:"load"});
  const data=await page.evaluate(()=>{
   const original=[...document.querySelectorAll("div > p")];
   return {
    development:document.querySelector("#jgr-development")?.textContent?.trim(),
    authors:document.querySelector("#jgr-authors")?.textContent?.trim(),
    licenseLabel:document.querySelector("#jgr-license")?.textContent?.trim(),
    sourceLabel:document.querySelector("#jgr-code")?.textContent?.trim(),
    versions:original[0]?.firstChild?.nodeValue?.trim(),
    credits:original[4]?.textContent?.trim(),
    legal:original[6]?.textContent?.trim(),
    warranty:original[7]?.textContent?.trim(),
    liability:original[12]?.textContent?.trim(),
    finalNotice:original[15]?.textContent?.trim(),
    legalHref:document.querySelector("#circuits-jgr-identity a")?.getAttribute("href"),
    upstream:!!document.querySelector('a[href="https://github.com/pfalstad/circuitjs1"]'),
    documentLanguage:document.documentElement.lang
   };
  });
  for(const key of ["development","authors","licenseLabel","sourceLabel",
    "versions","credits","legal","warranty","liability","finalNotice"])
   assert(data[key]?.length>12,language+": falta texto en Acerca de: "+key);
  assert(data.versions.includes("CircuitJS1"),language+": versión original incorrecta");
  assert(data.authors.includes("Paul Falstad")&&data.authors.includes("Iain Sharp"),
   language+": faltan autores originales");
  for(const name of ["Edward Calver","Colin Howell","Pablo Sanz Martin"])
   assert(data.credits.includes(name),language+": crédito omitido: "+name);
  assert(data.upstream,language+": falta el enlace al código original");
  assert.equal(data.legalHref,"../LICENSE-GPLv3.txt");
  assert.equal(data.documentLanguage,language==="ca-es-valencia"?"ca-ES-valencia":
   language==="csx"?"cs":language==="kr"?"ko":language);
  if(language!=="en"){
   assert(!data.versions.startsWith("Circuit Simulator"),
    language+": se muestra texto original sin traducir");
   assert(!data.legal.includes("This program is free software"),
    language+": aviso legal en inglés");
   assert(!data.finalNotice.includes("THE SOFTWARE IS PROVIDED"),
    language+": exención de garantía sin traducir");
   assert(!data.credits.startsWith("Thanks to:"),
    language+": colaboradores sin traducir");
   assert(!data.authors.includes("and contributors"),
    language+": denominación de colaboradores en inglés");
  }
  if(language==="en"){
   assert.equal(data.development,"Development and adaptation");
   assert.equal(data.versions,"Original CircuitJS1, version");
   assert(data.authors.includes("and contributors"));
  }
  if(language==="ca-es-valencia"){
   assert.equal(data.development,"Desenvolupament i adaptació");
   assert.equal(data.versions,"CircuitJS1 original, versió");
   assert(data.authors.includes("i col·laboradors"));
   assert(data.legal.includes("programari lliure"));
   assert(data.credits.startsWith("Agraïments a"));
  }
 }
 console.log("OK: 22 idiomas de Acerca de, con prioridad inglés y valenciano; "+
  "identidad, autores, colaboradores y avisos legales íntegros.");
 console.log("OK: portada principal con accesos a Circuit JGR y laboratorio");
 console.log("OK: Vite abre Circuit JGR 1.0 en la raíz, configuración regional "+
  "y Acerca de con autor, créditos y licencia; sin rutas del laboratorio.");
 await context.close();
}finally{await browser.close();}

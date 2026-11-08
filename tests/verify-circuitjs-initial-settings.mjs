import assert from "node:assert/strict";
import {chromium} from "playwright";

// Validación real de la misma configuración al abrir CircuitJS directamente.
// El navegador comparte localStorage entre / y /circuitjs/circuitjs.html.
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({locale:"es-ES",viewport:{width:1280,height:800}});
 const page=await context.newPage();
 page.on("pageerror",error=>console.error("Error de configuración:",error.message));
 await page.goto("http://127.0.0.1:8765/circuitjs/circuitjs.html",
  {waitUntil:"domcontentloaded"});
 const modal=page.locator("#lab-start-modal");
 await modal.waitFor({state:"visible",timeout:30000});
 const modes=await page.locator('input[name="lab-start-format"]').evaluateAll(
  nodes=>nodes.map(node=>node.value));
 assert.deepEqual(modes,["eu","uk"],
  "La configuración solo debe ofrecer Europeo y Anglosajón");
 assert.equal(await page.locator('input[name="lab-start-format"][value="eu"]').isChecked(),true);
 assert.equal(await page.locator("#lab-start-accept").textContent(),"Guardar y abrir CircuitJS");
 assert.equal(await page.locator("#lab-start-language option").count(),23,
  "Debe existir idioma automático más los 22 idiomas seleccionables");
 await page.locator("#lab-start-accept").click();
 await page.waitForFunction(()=>localStorage.getItem("labRegionalFormat")==="eu" &&
  document.querySelector("#lab-start-modal")?.hidden,{},{timeout:30000});
 assert.equal(await page.evaluate(()=>localStorage.getItem("labDecimalSeparator")),",");
 assert.equal(await page.evaluate(()=>localStorage.getItem("labGroupingSeparator")),".");
 await page.locator(".lab-start-settings").click();
 await modal.waitFor({state:"visible"});
 await page.locator('input[name="lab-start-format"][value="uk"]').check();
 await page.locator("#lab-start-accept").click();
 await page.waitForFunction(()=>localStorage.getItem("labRegionalFormat")==="uk" &&
  document.querySelector("#lab-start-modal")?.hidden,{},{timeout:30000});
 assert.equal(await page.evaluate(()=>localStorage.getItem("labDecimalSeparator")),".");
 assert.equal(await page.evaluate(()=>localStorage.getItem("labGroupingSeparator")),",");
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
 assert.equal(await page.locator("#lab-start-modal").isHidden(),true,
  "El laboratorio debe compartir las preferencias ya guardadas en CircuitJS");
 await page.locator('button[data-mode="falstad"]').click();
 const simulator=page.frameLocator("#circuit-frame");
 await simulator.locator(".lab-start-settings").waitFor({state:"visible",timeout:90000});
 await simulator.locator(".lab-start-settings").click();
 await simulator.locator("#lab-start-modal").waitFor({state:"visible"});
 const embeddedModes=await simulator.locator('input[name="lab-start-format"]').evaluateAll(
  nodes=>nodes.map(node=>node.value));
 assert.deepEqual(embeddedModes,["eu","uk"]);
 // Preferencias antiguas "Personalizado": migración a formato europeo.
 await page.evaluate(()=>{
  localStorage.setItem("labRegionalFormat","custom");
  localStorage.setItem("labDecimalSeparator",",");
  localStorage.setItem("labGroupingSeparator","");
 });
 await page.goto("http://127.0.0.1:8765/circuitjs/circuitjs.html",
  {waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>localStorage.getItem("labRegionalFormat")==="eu");
 assert.equal(await page.evaluate(()=>localStorage.getItem("labDecimalSeparator")),",");
 assert.equal(await page.evaluate(()=>localStorage.getItem("labGroupingSeparator")),".");
 console.log("OK: migración de configuración personalizada anterior al formato europeo");
 console.log("OK: configuración de CircuitJS independiente e integrado, 22 idiomas, "+
  "solo formatos europeo/anglosajón y preferencias regionales compartidas.");
 await context.close();
} finally { await browser.close(); }

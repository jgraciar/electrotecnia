import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chromium} from "playwright";

// Prueba real del motor compilado: entrada desde Wulflemm sin exigir salida compatible.
// Requiere el servidor HTTP del sitio compilado en 127.0.0.1:8765.
const original = readFileSync(new URL("./fixtures/wulflemm-aron.xml",import.meta.url),"utf8");
assert.equal((original.match(/<WattmeterTrue /g)||[]).length,2);

const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:950}});
  page.on("pageerror",error=>console.error("Error del navegador:",error.message));
  await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
  await page.locator('button[data-mode="falstad"]').click();
  await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    return api && api.getTime?.()>=0.03;
  },null,{timeout:90000});

  // Archivo original de Wulflemm: carga de circuito y dos vatimetros reconocidos.
  const incoming = await page.evaluate(xml=>{
    const imported=window.LabCircuit.importWulflemmXml(xml);
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const count=Array.from(sim.getElements()).filter(el=>el.getType()==="WattmeterTrueElm").length;
    const output=sim.exportCircuit();
    const doc=new DOMParser().parseFromString(output,"application/xml");
    const tags=Array.from(doc.querySelectorAll("WattmeterTrue"));
    return {imported,count,withExtra:tags.some(el=>el.hasAttribute("labCurrentMode")||el.hasAttribute("labPowerMask")),
      modes:tags.map(el=>el.getAttribute("meter"))};
  },original);
  assert(incoming.imported?.ok && incoming.imported?.simulated,JSON.stringify(incoming));
  assert.equal(incoming.count,2);
  assert.equal(incoming.withExtra,false,"No introducir preferencias nuevas por defecto en XML Wulflemm");
  assert.deepEqual(incoming.modes,["1","1"],"No conservar los modos originales");
  console.log("XML entrante Wulflemm: dos vatimetros y ajustes originales",incoming);

  await page.waitForFunction(()=>{
    const m=window.LabCircuit.getAronReadings();
    return m?.valid && Number.isFinite(m.w1)&&Number.isFinite(m.w2) && m.total>0;
  },null,{timeout:90000});
  console.log("Aron con el motor real",await page.evaluate(()=>window.LabCircuit.getAronReadings()));

  // Opciones propias: se deben guardar y reabrir en el laboratorio,
  // sin que sea necesario exportarlas a Wulflemm.
  const extended=original.replace(/(<WattmeterTrue\b[^>]*\bmeter="1")\s*\/>/,
    '$1 labCurrentMode="2" labPowerMask="7"/>');
  assert.notEqual(extended,original,"No se ha creado la variante local");
  const saved=await page.evaluate(xml=>{
    const loaded=window.LabCircuit.importWulflemmXml(xml);
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const output=sim.exportCircuit();
    const doc=new DOMParser().parseFromString(output,"application/xml");
    const attr=Array.from(doc.querySelectorAll("WattmeterTrue")).map(el=>({
      current:el.getAttribute("labCurrentMode"),mask:el.getAttribute("labPowerMask")
    }));
    sim.importCircuit(output);
    const after=new DOMParser().parseFromString(sim.exportCircuit(),"application/xml");
    const second=Array.from(after.querySelectorAll("WattmeterTrue")).map(el=>({
      current:el.getAttribute("labCurrentMode"),mask:el.getAttribute("labPowerMask")
    }));
    return {loaded,attr,second};
  },extended);
  assert(saved.loaded?.ok,JSON.stringify(saved));
  assert.equal(saved.attr[0]?.current,"2");
  assert.equal(saved.attr[0]?.mask,"7");
  assert.deepEqual(saved.attr,saved.second,"Perdida de preferencias P/Q/S al guardar y abrir");
  console.log("Preferencias locales persistentes tras guardar y abrir",saved.attr);
} finally {
  await browser.close();
}

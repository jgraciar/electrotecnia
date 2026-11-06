import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {chromium} from "playwright";
const xml=await readFile(new URL("./fixtures/fv-bateria-tres-escalones.xml",import.meta.url),"utf8");
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage();
 await page.addInitScript(()=>localStorage.setItem("labStartConfigured","1"));
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
 await page.locator('button[data-mode="falstad"]').click();
 await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
 await page.waitForFunction(()=>document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1?.getTime()>0.02,null,{timeout:90000});
 const imported=await page.evaluate(x=>window.LabCircuit.importNativeCircuit("FV tres escalones",x),xml);
 assert(imported?.ok,"Importación del banco de condensadores rechazada");
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  return sim?.getTime()>0.05&&Array.from(sim.getElements()).filter(e=>e.getType()==="CapacitorElm").length===3;
 },null,{timeout:60000});
 const result=await page.evaluate(()=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  const elements=Array.from(sim.getElements());
  return {capacitors:elements.filter(e=>e.getType()==="CapacitorElm").length,
   switches:elements.filter(e=>e.getType()==="SwitchElm").map(e=>e.position),
   inverter:elements.filter(e=>e.getType()==="PVInverterElm").length,
   time:sim.getTime()};
 });
 assert.equal(result.capacitors,3);
 assert.deepEqual(result.switches,[1,1,1],"Los tres contactores deben empezar abiertos");
 assert.equal(result.inverter,1);
 console.log("OK: batería FV importada con tres condensadores y tres interruptores independientes",result);
}finally{await browser.close();}

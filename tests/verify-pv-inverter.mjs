import assert from "node:assert/strict";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:950}});
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem("labStartConfigured","1"));
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
 await page.locator('button[data-mode="falstad"]').click();
 await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  return !!sim?.importCircuit&&sim.getTime()>0.02;
 },null,{timeout:90000});
 const menu=await page.evaluate(()=>Array.from(
  document.querySelector("#circuit-frame")?.contentDocument?.querySelectorAll(".itemLabel")??[]
 ).some(e=>e.textContent?.includes("Inversor fotovoltaico FV (CA)")));
 assert(menu,"El inversor debe estar en el menú de CircuitJS");
 // Fuente de tensión 10 V RMS y 50 Hz; carga resistiva 100 ohmios.
 // Inversor en paralelo con la carga; el borne de salida es el segundo.
 const xml='<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="20" mts="5e-11">'+
  '<v x="80 304 80 448" f="0" wf="1" fr="50" maxv="14.142135623730951"/>'+
  '<g x="80 448 80 480" f="0"/>'+
  '<w x="80 304 288 304" f="0"/>'+
  '<r x="288 304 288 448" f="0" resistance="100"/>'+
  '<w x="288 448 80 448" f="0"/>'+
  '<PVInverter x="400 448 400 304" f="0" pvP="0.5" pvQ="0" pvV="10" pvF="50" pvPhase="0"/>'+
  '<w x="400 304 288 304" f="0"/>'+
  '<w x="400 448 288 448" f="0"/></cir>';
 const result=await page.evaluate(x=>window.LabCircuit.importNativeCircuit("FV en paralelo",x),xml);
 assert(result?.ok&&result?.simulated,"Importación FV fallida: "+JSON.stringify(result));
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  return sim?.getTime()>0.05&&Array.from(sim.getElements()).some(e=>e.getType()==="PVInverterElm");
 },null,{timeout:60000});
 const state=await page.evaluate(()=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  const elms=Array.from(sim.getElements());
  const inv=elms.find(e=>e.getType()==="PVInverterElm");
  const exported=sim.exportCircuit();
  const tag=new DOMParser().parseFromString(exported,"application/xml").querySelector("PVInverter");
  return {time:sim.getTime(),current:inv?.getCurrent(),count:elms.filter(e=>e.getType()==="PVInverterElm").length,
   p:tag?.getAttribute("pvP"),q:tag?.getAttribute("pvQ")};
 });
 assert.equal(state.count,1);
 assert.equal(state.p,"0.5");
 assert.equal(state.q,"0");
 assert(Number.isFinite(state.current)&&state.time>0.05);
 const rt=await page.evaluate(()=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  sim.importCircuit(sim.exportCircuit());
  return Array.from(sim.getElements()).filter(e=>e.getType()==="PVInverterElm").length;
 });
 assert.equal(rt,1,"Debe sobrevivir a la exportación/importación");
 assert.equal(errors.length,0,"Errores del navegador: "+errors.join("; "));
 console.log("OK: inversor FV compilado, visible, simulado y serializado",state);
}finally{await browser.close();}

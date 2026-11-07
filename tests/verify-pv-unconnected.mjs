import assert from "node:assert/strict";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({locale:"es-ES",viewport:{width:1400,height:900}});
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.addInitScript(()=>localStorage.setItem("labStartConfigured","1"));
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
 await page.locator('button[data-mode="falstad"]').click();
 await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  return sim?.getTime()>0.02;
 },null,{timeout:90000});

 const menu=await page.evaluate(()=>{
  const doc=document.querySelector("#circuit-frame").contentDocument;
  const groups=[...doc.querySelectorAll("li.hasSubmenu")];
  const label=li=>[...li.childNodes].filter(n=>n.nodeType===3)
   .map(n=>n.textContent).join(" ").trim();
  const passive=groups.find(e=>/Passive Components|Componentes pasivos/i.test(label(e)));
  const input=groups.find(e=>/Inputs and Sources|Entradas y fuentes/i.test(label(e)));
  const containsInverter=li=>!![...li?.querySelectorAll(".itemLabel")??[]]
   .find(e=>e.textContent?.includes("Inversor fotovoltaico FV (CA)"));
  const ohm=[...doc.querySelectorAll("li")].find(e=>
   /Show Ω Unit|Mostrar.*(?:unidad|símbolo).*Ω/i.test(e.textContent??"") &&
   !!e.querySelector(".checkMark") && !e.classList.contains("hasSubmenu"));
  return {passive:containsInverter(passive),input:containsInverter(input),
   ohmFound:!!ohm,ohmCheck:ohm?.querySelector(".checkMark")?.style.visibility};
 });
 console.log("Menú del inversor y opción de ohmios",menu);
 assert.equal(menu.passive,false,"El inversor no debe ser componente pasivo");
 assert.equal(menu.input,true,"El inversor debe estar en Entradas y fuentes");
 assert(menu.ohmFound,"Falta la opción Mostrar unidad Ω");
 assert.equal(menu.ohmCheck,"visible","Mostrar unidad Ω debe aparecer activado");

 const base='<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="300" mts="5e-11">'+
  '<v x="80 160 80 304" f="0" wf="1" fr="50" maxv="325.2691193458119"/>'+
  '<g x="80 304 80 336" f="0"/>'+
  '<r x="240 160 240 304" f="0" r="1000"/>'+
  '<w x="80 160 240 160" f="0"/>'+
  '<w x="80 304 240 304" f="0"/>';
 for(const mode of ["grid","island"]){
  // Un inversor en fase de colocación, con los dos bornes aún sin cablear.
  const xml=base+'<PVInverter x="608 160 608 304" f="0" pvP="1000" pvQ="0"'+
   ' pvPnom="5000" pvSnom="5500" pvV="230" pvF="50"'+
   ' pvMode="'+mode+'" pvCos="1"/></cir>';
  const imported=await page.evaluate(p=>
   window.LabCircuit.importNativeCircuit(p.name,p.xml),
   {name:"Inversor desconectado "+mode,xml});
  assert(imported?.ok,mode+": fallo al colocar el inversor desconectado");
  const state=await page.evaluate(async()=>{
   const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
   const start=sim.getTime();
   await new Promise(resolve=>setTimeout(resolve,1200));
   const e=[...sim.getElements()];
   return {start,end:sim.getTime(),
    inverters:e.filter(x=>x.getType()==="PVInverterElm").length,
    loadIrms:e.find(x=>x.getType()==="ResistorElm")?.getCurrent(),
    inverterCurrent:e.find(x=>x.getType()==="PVInverterElm")?.getCurrent()};
  });
  console.log("Simulación con inversor aún sin conectar",mode,state);
  assert.equal(state.inverters,1,mode+": inversor ausente");
  assert(state.end-state.start>.03,
   mode+": colocar el inversor no debe detener el tiempo de la simulación");
  assert(Number.isFinite(state.inverterCurrent));
  assert(Number.isFinite(state.loadIrms));
 }
 assert.deepEqual(errors,[],"Errores JS al incorporar un inversor");
 console.log("OK: FV en Entradas y fuentes, Ω predeterminado y simulación continua al colocar inversor");
}finally{await browser.close();}

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
  '<r x="288 304 288 448" f="0" r="100"/>'+
  '<w x="288 448 80 448" f="0"/>'+
  '<PVInverter x="400 448 400 304" f="0" pvP="0.5" pvQ="0" pvV="10" pvF="50" pvPhase="0"/>'+
  '<w x="400 304 288 304" f="0"/>'+
  '<w x="400 448 288 448" f="0"/></cir>';
 const result=await page.evaluate(x=>window.LabCircuit.importNativeCircuit("FV en paralelo",x),xml);
 assert(result?.ok,"Importación FV rechazada: "+JSON.stringify(result));
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
 // Captura en cada paso del solver, sin depender del reloj del navegador.
 const measurement=await page.evaluate(async()=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  const original=sim.ontimestep;
  const samples=[];
  sim.ontimestep=()=>{
   original?.();
   const elements=Array.from(sim.getElements());
   const source=elements.find(e=>e.getType()==="VoltageElm");
   const resistor=elements.find(e=>e.getType()==="ResistorElm");
   const inverter=elements.find(e=>e.getType()==="PVInverterElm");
   if(!source||!resistor||!inverter)return;
   const t=sim.getTime();
   if(!Number.isFinite(t))return;
   samples.push({t,vs:source.getVoltageDiff(),is:source.getCurrent(),
    vr:resistor.getVoltageDiff(),ir:resistor.getCurrent(),
    vi:inverter.getVoltageDiff(),ii:inverter.getCurrent()});
   if(samples.length>50000)samples.shift();
  };
  try{
   const start=sim.getTime();
   for(let k=0;k<500;k++){
    await new Promise(resolve=>setTimeout(resolve,20));
    if(sim.getTime()-start>0.12)break;
   }
  }finally{sim.ontimestep=original;}
  const tEnd=samples.at(-1)?.t??0;
  const tStart=tEnd-0.08;
  const data=samples.filter(s=>s.t>=tStart);
  let duration=0,load=0,source=0,inverter=0,voltageSq=0;
  for(let i=1;i<data.length;i++){
   const a=data[i-1],b=data[i],dt=b.t-a.t;
   if(!(dt>0))continue;
   duration+=dt;
   load+=dt*(a.vr*a.ir+b.vr*b.ir)/2;
   source+=dt*(a.vs*a.is+b.vs*b.is)/2;
   inverter+=dt*(a.vi*a.ii+b.vi*b.ii)/2;
   voltageSq+=dt*(a.vr*a.vr+b.vr*b.vr)/2;
  }
  return {samples:data.length,duration,load:load/duration,source:source/duration,
   inverter:inverter/duration,voltageRms:Math.sqrt(voltageSq/duration)};
 });
 console.log("Potencias reales de CircuitJS (orientación de terminales):",measurement);
 assert(measurement.samples>100&&measurement.duration>0.06,"Muestras insuficientes del solver");
 assert(Object.values(measurement).every(Number.isFinite),"Medidas no finitas");
 assert(measurement.voltageRms>5&&measurement.voltageRms<15,"Tensión RMS fuera de rango");
 assert(Math.abs(measurement.load-1)<0.05,"La carga de 100 ohmios a 10 V debe consumir 1 W");
 assert(Math.abs(measurement.source-measurement.inverter-measurement.load)<0.05,
  "La potencia suministrada por red y FV debe igualar la carga");
 assert(Math.abs(measurement.inverter+0.5)<0.05,"El inversor debe inyectar 0,5 W");
 assert(Math.abs(measurement.source-0.5)<0.05,"La red debe aportar los 0,5 W restantes");
 const rt=await page.evaluate(()=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  sim.importCircuit(sim.exportCircuit());
  return Array.from(sim.getElements()).filter(e=>e.getType()==="PVInverterElm").length;
 });
 assert.equal(rt,1,"Debe sobrevivir a la exportación/importación");
 assert.equal(errors.length,0,"Errores del navegador: "+errors.join("; "));
 console.log("OK: inversor FV compilado, visible, simulado y serializado",state);
}finally{await browser.close();}

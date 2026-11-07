import assert from "node:assert/strict";
import {chromium} from "playwright";
import {pvThreePhaseBalance} from "../scripts/LabPVThreePhaseBalance.ts";

// Red 400 V (entre fases), 50 Hz, 4 hilos. FV equilibrada de 6 kW;
// cargas monofásicas L-N de 0,7/2/3,3 kW, respectivamente.
// El balance global es P_red=0, pero L1 exporta 1,3 kW y L3 importa 1,3.
// Es una prueba eléctrica de la implementación, NO un ensayo de antivertido.
const lineVoltage=400,phaseVoltage=lineVoltage/Math.sqrt(3);
const loadP=[0.7,2,3.3],pvP=[2,2,2];
const expectation=pvThreePhaseBalance({
 lineVoltage,loadP,loadQ:[0,0,0],pvP
});
const phases=[0,4*Math.PI/3,2*Math.PI/3]; // 0°, -120°, +120°
const xmlParts=['<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="400" mts="5e-11">'];
for(let i=0;i<3;i++){
 const top=128+224*i,bottom=top+96;
 const phase=phases[i];
 const peak=phaseVoltage*Math.SQRT2;
 const resistance=phaseVoltage**2/(loadP[i]*1000);
 xmlParts.push(
  `<v x="80 ${top} 80 ${bottom}" f="0" wf="1" fr="50" maxv="${peak}" phaseShift="${phase}"/>`,
  `<r x="240 ${top} 240 ${bottom}" f="0" r="${resistance}"/>`,
  `<PVInverter x="400 ${bottom} 400 ${top}" f="0" pvP="${pvP[i]*1000}" pvQ="0" pvV="${phaseVoltage}" pvF="50" pvPhase="${phase*180/Math.PI}"/>`,
  `<w x="80 ${top} 240 ${top}" f="0"/>`,
  `<w x="240 ${top} 400 ${top}" f="0"/>`,
  `<w x="80 ${bottom} 240 ${bottom}" f="0"/>`,
  `<w x="240 ${bottom} 400 ${bottom}" f="0"/>`,
  `<w x="400 ${bottom} 560 ${bottom}" f="0"/>`
 );
}
xmlParts.push('<w x="560 224 560 448" f="0"/>',
 '<w x="560 448 560 672" f="0"/>',
 '<g x="560 672 560 704" f="0"/>',
 '</cir>');
const xml=xmlParts.join("");
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:950}});
 const errors=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.addInitScript(()=>localStorage.setItem("labStartConfigured","1"));
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
 await page.locator('button[data-mode="falstad"]').click();
 await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  return !!sim?.importCircuit&&sim.getTime()>0.02;
 },null,{timeout:90000});
 const result=await page.evaluate(x=>window.LabCircuit.importNativeCircuit("FV desequilibrio 400 V",x),xml);
 assert(result?.ok,"No se pudo importar el circuito trifásico: "+JSON.stringify(result));
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  if(!sim||sim.getTime()<=0.06)return false;
  const elements=Array.from(sim.getElements());
  return elements.filter(e=>e.getType()==="VoltageElm").length===3&&
   elements.filter(e=>e.getType()==="ResistorElm").length===3&&
   elements.filter(e=>e.getType()==="PVInverterElm").length===3;
 },null,{timeout:90000});
 const measurements=await page.evaluate(async()=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  const elements=Array.from(sim.getElements());
  const sources=elements.filter(e=>e.getType()==="VoltageElm");
  const resistors=elements.filter(e=>e.getType()==="ResistorElm");
  const inverters=elements.filter(e=>e.getType()==="PVInverterElm");
  const samples=[],previous=sim.ontimestep;
  sim.ontimestep=()=>{
   previous?.();
   if(sources.length!==3||resistors.length!==3)return;
   const t=sim.getTime();
   if(!Number.isFinite(t))return;
   samples.push({
    t,voltages:sources.map(s=>s.getVoltageDiff()),
    currents:sources.map(s=>s.getCurrent()),
    loadPower:resistors.map(r=>r.getVoltageDiff()*r.getCurrent())
   });
   if(samples.length>100000)samples.shift();
  };
  try{
   const start=sim.getTime();
   for(let k=0;k<500&&sim.getTime()-start<0.14;k++)
    await new Promise(resolve=>setTimeout(resolve,20));
  }finally{sim.ontimestep=previous;}
  const end=samples.at(-1)?.t??0,data=samples.filter(s=>s.t>=end-0.08);
  const powers=[0,0,0],loads=[0,0,0],iSquared=[0,0,0],vSquared=[0,0,0];
  let neutralSquared=0,duration=0;
  for(let k=1;k<data.length;k++){
   const a=data[k-1],b=data[k],dt=b.t-a.t;
   if(!(dt>0))continue;
   duration+=dt;
   for(let p=0;p<3;p++){
    powers[p]+=dt*(a.voltages[p]*a.currents[p]+b.voltages[p]*b.currents[p])/2;
    loads[p]+=dt*(a.loadPower[p]+b.loadPower[p])/2;
    iSquared[p]+=dt*(a.currents[p]**2+b.currents[p]**2)/2;
    vSquared[p]+=dt*(a.voltages[p]**2+b.voltages[p]**2)/2;
   }
   const sum=(s)=>s.currents.reduce((total,i)=>total+i,0);
   neutralSquared+=dt*(sum(a)**2+sum(b)**2)/2;
  }
  const exported=sim.exportCircuit();
  const parsed=new DOMParser().parseFromString(exported,"application/xml");
  return {duration,samples:data.length,
   gridPower:powers.map(x=>x/duration),
   loadPower:loads.map(x=>x/duration),
   lineCurrent:iSquared.map(x=>Math.sqrt(x/duration)),
   voltageRms:vSquared.map(x=>Math.sqrt(x/duration)),
   neutralCurrent:Math.sqrt(neutralSquared/duration),
   inverterCount:inverters.length,
   inverterP:Array.from(parsed.querySelectorAll("PVInverter")).map(x=>Number(x.getAttribute("pvP"))),
   exported
  };
 });
 const display={...measurements,exported:"[XML completo omitido]"};
 console.log("CircuitJS trifásica 400 V desequilibrada:",JSON.stringify(display));
 assert(measurements.duration>0.06&&measurements.samples>100,
  "Muestras insuficientes en prueba trifásica");
 assert.equal(measurements.inverterCount,3);
 assert.deepEqual(measurements.inverterP,[2000,2000,2000]);
 const close=(actual,expected,tol,name)=>{
  assert(Number.isFinite(actual),name+": valor no finito");
  assert(Math.abs(actual-expected)<=tol,
   `${name}: ${actual} != ${expected} (tolerancia ${tol})`);
 };
 for(let p=0;p<3;p++){
  close(measurements.voltageRms[p],phaseVoltage,2.5,"U fase "+p);
  close(measurements.loadPower[p],loadP[p]*1000,75,"P carga fase "+p);
  close(measurements.gridPower[p],expectation.phases[p].gridP*1000,85,
   "P red fase "+p);
  close(measurements.lineCurrent[p],expectation.phases[p].gridCurrent,0.5,
   "I red fase "+p);
 }
 close(measurements.gridPower.reduce((a,b)=>a+b,0),0,110,"P total red");
 close(measurements.neutralCurrent,expectation.neutralCurrent,0.7,
  "I neutro");
 assert(measurements.neutralCurrent>5,"Debe circular corriente por el neutro");
 // Persistencia de los tres inversores y de los tres generadores CA.
 const roundtrip=await page.evaluate(exported=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  sim.importCircuit(exported);
  const elements=Array.from(sim.getElements());
  return {
   sources:elements.filter(e=>e.getType()==="VoltageElm").length,
   inverters:elements.filter(e=>e.getType()==="PVInverterElm").length
  };
 },measurements.exported);
 assert.deepEqual(roundtrip,{sources:3,inverters:3});
 assert.deepEqual(errors,[],"Errores del navegador");
 console.log("OK: CircuitJS 400 V, L1/L2/L3, vertido por fase y corriente RMS de neutro");
} finally {await browser.close();}

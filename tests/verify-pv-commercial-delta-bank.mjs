import assert from "node:assert/strict";
import {chromium} from "playwright";

// Ensayo real en CircuitJS: 400 V L-L, 50 Hz, FV trifásica 6 kW,
// cargas equilibradas de 6 kW y batería comercial de 12,5 kVAr
// conectada en triángulo. No simula protecciones ni reactancias de rechazo.
const lineVoltage=400;
const phaseVoltage=lineVoltage/Math.sqrt(3);
const frequency=50, omega=2*Math.PI*frequency;
const capKvar=12.5;
const deltaCapacitance=capKvar*1000/(3*omega*lineVoltage**2);
const branchCurrent=omega*deltaCapacitance*lineVoltage;
const lineCurrent=capKvar*1000/(Math.sqrt(3)*lineVoltage);
const resistance=phaseVoltage**2/2000;
const positions=[128,352,576],angles=[0,4*Math.PI/3,2*Math.PI/3];
const xml=['<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="400" mts="5e-11">'];
for(let p=0;p<3;p++){
 const y=positions[p],bottom=y+96,sourceBottom=y+80;
 xml.push(
  `<v x="80 ${y} 80 ${sourceBottom}" f="0" wf="1" fr="50" maxv="${phaseVoltage*Math.SQRT2}" phaseShift="${angles[p]}"/>`,
  `<g x="80 ${sourceBottom} 80 ${sourceBottom+32}" f="0"/>`,
  `<r x="240 ${y} 240 ${bottom}" f="0" r="${resistance}"/>`,
  `<g x="240 ${bottom} 240 ${bottom+32}" f="0"/>`,
  `<PVInverter x="320 ${bottom} 320 ${y}" f="0" pvP="2000" pvQ="0" pvV="${phaseVoltage}" pvF="50" pvPhase="${angles[p]*180/Math.PI}"/>`,
  `<g x="320 ${bottom} 320 ${bottom+32}" f="0"/>`,
  `<w x="80 ${y} 240 ${y}" f="0"/>`,
  `<w x="240 ${y} 320 ${y}" f="0"/>`
 );
}
xml.push(
 '<w x="320 128 400 128" f="0"/>',
 '<w x="400 128 720 128" f="0"/>',
 '<w x="320 352 400 352" f="0"/>',
 '<w x="400 352 560 352" f="0"/>',
 '<w x="320 576 560 576" f="0"/>',
 '<w x="560 576 720 576" f="0"/>',
 `<c x="400 128 400 352" f="0" c="${deltaCapacitance}" voltdiff="0"/>`,
 `<c x="560 352 560 576" f="0" c="${deltaCapacitance}" voltdiff="0"/>`,
 `<c x="720 576 720 128" f="0" c="${deltaCapacitance}" voltdiff="0"/>`,
 '</cir>'
);
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:950}});
 const browserErrors=[];
 page.on("pageerror",err=>browserErrors.push(err.message));
 await page.addInitScript(()=>localStorage.setItem("labStartConfigured","1"));
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
 await page.locator('button[data-mode="falstad"]').click();
 await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  return !!sim?.importCircuit&&sim.getTime()>0.02;
 },null,{timeout:90000});
 const result=await page.evaluate(x=>window.LabCircuit.importNativeCircuit("FV 6 kW + batería delta 12,5 kVAr",x),xml.join(""));
 assert(result?.ok,"No se pudo importar circuito comercial: "+JSON.stringify(result));
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  if(!sim||sim.getTime()<0.12)return false;
  const elements=Array.from(sim.getElements());
  return ["VoltageElm","ResistorElm","PVInverterElm","CapacitorElm"]
   .every(type=>elements.filter(e=>e.getType()===type).length===3);
 },null,{timeout:90000});
 const measured=await page.evaluate(async()=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  const e=Array.from(sim.getElements());
  const sources=e.filter(x=>x.getType()==="VoltageElm"),
   capacitors=e.filter(x=>x.getType()==="CapacitorElm");
  const previous=sim.ontimestep,samples=[];
  sim.ontimestep=()=>{
   previous?.();
   samples.push({
    t:sim.getTime(),
    v:sources.map(s=>s.getVoltageDiff()),
    i:sources.map(s=>s.getCurrent()),
    cap:capacitors.map(c=>c.getCurrent())
   });
   if(samples.length>100000)samples.shift();
  };
  try{
   const start=sim.getTime();
   for(let j=0;j<550&&sim.getTime()-start<0.14;j++)
    await new Promise(resolve=>setTimeout(resolve,20));
  }finally{sim.ontimestep=previous;}
  const end=samples.at(-1)?.t??0,data=samples.filter(s=>s.t>=end-0.08);
  let duration=0,gridP=0,gridQ=0,neutralSquared=0;
  const lineI2=[0,0,0],capI2=[0,0,0],lineV2=[0,0,0];
  for(let j=1;j<data.length-1;j++){
   const a=data[j-1],b=data[j],c=data[j+1];
   const dt=(c.t-a.t)/2, span=c.t-a.t;
   if(!(dt>0))continue;
   duration+=dt;
   const sumI=(s)=>s.i.reduce((sum,i)=>sum+i,0);
   neutralSquared+=dt*sumI(b)**2;
   for(let p=0;p<3;p++){
    lineI2[p]+=dt*b.i[p]**2;
    capI2[p]+=dt*b.cap[p]**2;
    lineV2[p]+=dt*b.v[p]**2;
    gridP+=dt*b.v[p]*b.i[p];
    gridQ+=dt*(-(c.v[p]-a.v[p])/(span*2*Math.PI*50))*b.i[p];
   }
  }
  return {
   samples:data.length,duration,
   lineIrms:lineI2.map(v=>Math.sqrt(v/duration)),
   branchIrms:capI2.map(v=>Math.sqrt(v/duration)),
   voltageRms:lineV2.map(v=>Math.sqrt(v/duration)),
   neutralIrms:Math.sqrt(neutralSquared/duration),
   gridP:gridP/duration,gridQ:gridQ/duration,
   exported:sim.exportCircuit()
  };
 });
 console.log("FV con batería comercial delta 12,5 kVAr:",JSON.stringify({...measured,exported:"XML omitido"}));
 const close=(actual,expected,tolerance,name)=>{
  assert(Number.isFinite(actual),name+": no finito");
  assert(Math.abs(actual-expected)<=tolerance,
   `${name}: ${actual} != ${expected}, tolerancia ${tolerance}`);
 };
 assert(measured.samples>100&&measured.duration>0.06,"Muestras insuficientes");
 for(let p=0;p<3;p++){
  close(measured.voltageRms[p],phaseVoltage,3,"U fase "+p);
  close(measured.lineIrms[p],lineCurrent,0.5,"I línea "+p);
  close(measured.branchIrms[p],branchCurrent,0.4,"I rama delta "+p);
 }
 close(measured.neutralIrms,0,0.5,"I neutro equilibrado");
 close(measured.gridP,0,200,"P red con FV cubriendo la carga");
 close(measured.gridQ,-12500,600,"Q red con batería capacitiva");
 const post=await page.evaluate(exported=>{
  const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
  sim.importCircuit(exported);
  const elements=Array.from(sim.getElements());
  return {caps:elements.filter(e=>e.getType()==="CapacitorElm").length,
   pv:elements.filter(e=>e.getType()==="PVInverterElm").length,
   sources:elements.filter(e=>e.getType()==="VoltageElm").length};
 },measured.exported);
 assert.deepEqual(post,{caps:3,pv:3,sources:3});
 assert.deepEqual(browserErrors,[],"Errores de ejecución");
 console.log("OK: 400 V FV 6 kW con batería delta 12,5 kVAr real en CircuitJS");
}finally{await browser.close();}

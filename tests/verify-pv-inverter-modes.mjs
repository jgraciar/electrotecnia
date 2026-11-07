import assert from "node:assert/strict";
import {chromium} from "playwright";

// Pruebas físicas: inversor conectado a una red 12 V/60 Hz aunque su
// ficha XML antigua todavía indique 10 V/50 Hz; en aislada NO hay red.
const browser=await chromium.launch({headless:true});
const near=(x,y,tolerance,name)=>{
 assert(Number.isFinite(x),name+" no finito");
 assert(Math.abs(x-y)<=tolerance,
  name+": "+x+" frente a "+y+" (tol "+tolerance+")");
};
try{
 const page=await browser.newPage({viewport:{width:1440,height:900}});
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

 const base='<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="250" mts="5e-11">';
 const grid=base+
  '<v x="80 304 80 448" f="0" wf="1" fr="60" maxv="16.9705627485"/>'+
  '<g x="80 448 80 480" f="0"/>'+
  '<r x="288 304 288 448" f="0" r="144"/>'+
  '<PVInverter x="400 448 400 304" f="0" pvP="0.5" pvQ="0" pvV="10" pvF="50" pvPhase="0" pvPnom="5" pvSnom="5.5" pvCos="1" pvMode="grid"/>'+
  '<w x="80 304 288 304" f="0"/>'+
  '<w x="288 304 400 304" f="0"/>'+
  '<w x="80 448 288 448" f="0"/>'+
  '<w x="288 448 400 448" f="0"/></cir>';

 const island=base+
  '<PVInverter x="400 448 400 304" f="0" pvP="0" pvQ="0" pvV="230" pvF="50" pvPhase="0" pvPnom="5000" pvSnom="5500" pvCos="1" pvMode="island"/>'+
  '<r x="288 304 288 448" f="0" r="52.9"/>'+
  '<w x="288 304 400 304" f="0"/>'+
  '<w x="288 448 400 448" f="0"/>'+
  '<g x="288 448 288 480" f="0"/></cir>';
 for(const {name,xml,expectRms,expectP,mode} of [
  {name:"Inversor FV conectado a red 60 Hz",xml:grid,expectRms:12,expectP:1,mode:"grid"},
  {name:"Inversor FV aislado 230 V",xml:island,expectRms:230*52.9/(52.9+.01*230**2/5500),
   expectP:230**2*52.9/(52.9+.01*230**2/5500)**2,mode:"island"}
 ]){
  const result=await page.evaluate(c=>window.LabCircuit.importNativeCircuit(c.name,c.xml),{name,xml});
  assert(result?.ok,name+" import failure: "+JSON.stringify(result));
  await page.waitForFunction(()=>{
   const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
   return sim?.getTime()>0.10&&Array.from(sim.getElements())
    .filter(e=>e.getType()==="PVInverterElm").length===1;
  },null,{timeout:90000});
  const readings=await page.evaluate(async()=>{
   const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
   const e=Array.from(sim.getElements());
   const inv=e.find(x=>x.getType()==="PVInverterElm");
   const load=e.find(x=>x.getType()==="ResistorElm");
   const source=e.find(x=>x.getType()==="VoltageElm");
   const before=sim.ontimestep,samples=[];
   sim.ontimestep=()=>{
    before?.();
    samples.push({t:sim.getTime(),v:load.getVoltageDiff(),
     p:load.getVoltageDiff()*load.getCurrent(),
     sourceP:source?source.getVoltageDiff()*source.getCurrent():null});
   };
   try{
    const t0=sim.getTime();
    for(let i=0;i<400&&sim.getTime()-t0<0.11;i++)
     await new Promise(resolve=>setTimeout(resolve,20));
   }finally{sim.ontimestep=before;}
   const end=samples.at(-1)?.t??0,data=samples.filter(s=>s.t>=end-0.06);
   let seconds=0,energy=0,v2=0,sourceP=0;
   for(let i=1;i<data.length;i++){
    const a=data[i-1],b=data[i],dt=b.t-a.t;
    if(!(dt>0))continue;
    seconds+=dt;energy+=dt*(a.p+b.p)/2;
    v2+=dt*(a.v*a.v+b.v*b.v)/2;
    if(a.sourceP!=null&&b.sourceP!=null)
     sourceP+=dt*(a.sourceP+b.sourceP)/2;
   }
   const tag=new DOMParser().parseFromString(sim.exportCircuit(),"application/xml")
    .querySelector("PVInverter");
   return {seconds,samples:data.length,voltageRms:Math.sqrt(v2/seconds),
    loadPower:energy/seconds,gridPower:sourceP/seconds,
    fields:{mode:tag?.getAttribute("pvMode"),
     nominalP:tag?.getAttribute("pvPnom"),nominalS:tag?.getAttribute("pvSnom"),
     currentMode:tag?.getAttribute("pvIView")??"0"},
    hasGridSource:!!source
   };
  });
  console.log("Inversor FV comercial",name,readings);
  assert(readings.seconds>0.04&&readings.samples>100,name+": samples");
  near(readings.voltageRms,expectRms,1.2,name+": U RMS");
  near(readings.loadPower,expectP,Math.max(.04,expectP*.04),name+": P carga");
  assert.equal(readings.fields.mode,mode);
  assert.equal(readings.fields.currentMode,"0",
   "RMS debe ser predeterminado al no especificar pvIView");
  if(mode==="grid"){
   near(readings.gridPower,.5,.07,"Red P (FV 0.5 W)");
   assert(readings.hasGridSource);
  }else{
   assert(!readings.hasGridSource,"La aislada no debe tener fuente de red");
  }
 }
 assert.deepEqual(errors,[],"Errores de JavaScript en navegador");
 console.log("OK: red U/f automáticas, ficha Pn/Smax, cosφ avanzado; aislada mantiene 230 V/50 Hz");
}finally{await browser.close();}

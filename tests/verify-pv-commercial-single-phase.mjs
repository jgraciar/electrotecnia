import assert from "node:assert/strict";
import {chromium} from "playwright";

// Monofásica 230 V/50 Hz: vivienda/local con inversor de 5 kW.
// Carga resistiva de 4 kW y escalón comercial de 2,5 kVAr en paralelo.
// Regímenes con FV 3, 4 y 5 kW: importación, balance nulo y vertido.
// Modelo eléctrico ideal: NO certifica dispositivo antivertido ni protecciones.
const voltage=230,frequency=50,omega=2*Math.PI*frequency;
const loadP=4000,capQ=2500;
const resistance=voltage**2/loadP,capacitance=capQ/(omega*voltage**2);
const cases=[
 {pvP:3000,gridP:1000},
 {pvP:4000,gridP:0},
 {pvP:5000,gridP:-1000}
];
const circuit=pvP=>'<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="250" mts="5e-11">'+
 `<v x="80 128 80 224" f="0" wf="1" fr="50" maxv="${voltage*Math.SQRT2}"/>`+
 '<g x="80 224 80 256" f="0"/>'+
 `<r x="240 128 240 224" f="0" r="${resistance}"/>`+
 '<g x="240 224 240 256" f="0"/>'+
 `<PVInverter x="320 224 320 128" f="0" pvP="${pvP}" pvQ="0" pvV="230" pvF="50" pvPhase="0"/>`+
 '<g x="320 224 320 256" f="0"/>'+
 `<c x="480 128 480 224" f="0" c="${capacitance}" voltdiff="0"/>`+
 '<g x="480 224 480 256" f="0"/>'+
 '<w x="80 128 240 128" f="0"/>'+
 '<w x="240 128 320 128" f="0"/>'+
 '<w x="320 128 480 128" f="0"/></cir>';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:950}});
 const errors=[];
 page.on("pageerror",err=>errors.push(err.message));
 await page.addInitScript(()=>localStorage.setItem("labStartConfigured","1"));
 await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
 await page.locator('button[data-mode="falstad"]').click();
 await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
 await page.waitForFunction(()=>{
  const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
  return !!sim?.importCircuit&&sim.getTime()>0.02;
 },null,{timeout:90000});
 const close=(actual,expected,tolerance,name)=>{
  assert(Number.isFinite(actual),name+": magnitud no finita");
  assert(Math.abs(actual-expected)<=tolerance,
   `${name}: ${actual} != ${expected}; tolerancia ${tolerance}`);
 };
 for(const scenario of cases){
  const imported=await page.evaluate(x=>window.LabCircuit.importNativeCircuit("FV monofásica "+x.p+" W",x.xml),
   {p:scenario.pvP,xml:circuit(scenario.pvP)});
  assert(imported?.ok,"Fallo al importar circuito: "+JSON.stringify(imported));
  await page.waitForFunction(p=>{
   const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
   if(!sim||sim.getTime()<=0.12)return false;
   const el=new DOMParser().parseFromString(sim.exportCircuit(),"application/xml")
    .querySelector("PVInverter");
   return Number(el?.getAttribute("pvP"))===p;
  },scenario.pvP,{timeout:90000});
  const m=await page.evaluate(async()=>{
   const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
   const elements=Array.from(sim.getElements());
   const source=elements.find(e=>e.getType()==="VoltageElm");
   const resistor=elements.find(e=>e.getType()==="ResistorElm");
   const inverter=elements.find(e=>e.getType()==="PVInverterElm");
   const capacitor=elements.find(e=>e.getType()==="CapacitorElm");
   if(!source||!resistor||!inverter||!capacitor)throw Error("Falta un elemento");
   const samples=[],previous=sim.ontimestep;
   sim.ontimestep=()=>{
    previous?.();
    samples.push({
     t:sim.getTime(),v:source.getVoltageDiff(),i:source.getCurrent(),
     capI:capacitor.getCurrent(),
     loadP:resistor.getVoltageDiff()*resistor.getCurrent(),
     pvP:inverter.getVoltageDiff()*inverter.getCurrent()
    });
    if(samples.length>80000)samples.shift();
   };
   try{
    const start=sim.getTime();
    for(let k=0;k<500&&sim.getTime()-start<0.14;k++)
     await new Promise(resolve=>setTimeout(resolve,20));
   }finally{sim.ontimestep=previous;}
   const end=samples.at(-1)?.t??0,data=samples.filter(x=>x.t>=end-0.08);
   let duration=0,p=0,q=0,load=0,pv=0,iSquared=0,capSquared=0,voltageSquared=0;
   for(let k=1;k<data.length-1;k++){
    const a=data[k-1],b=data[k],c=data[k+1];
    const span=c.t-a.t,dt=span/2;
    if(!(dt>0))continue;
    duration+=dt;
    p+=dt*b.v*b.i;
    q+=dt*(-(c.v-a.v)/(span*2*Math.PI*50))*b.i;
    load+=dt*b.loadP;pv+=dt*b.pvP;
    iSquared+=dt*b.i*b.i;
    capSquared+=dt*b.capI*b.capI;
    voltageSquared+=dt*b.v*b.v;
   }
   return {samples:data.length,duration,p:p/duration,q:q/duration,
    loadP:load/duration,pvP:pv/duration,
    voltageRms:Math.sqrt(voltageSquared/duration),
    lineIrms:Math.sqrt(iSquared/duration),
    capacitorIrms:Math.sqrt(capSquared/duration)
   };
  });
  console.log("FV monofásica 230 V + 2,5 kVAr:",scenario.pvP,m);
  assert(m.samples>100&&m.duration>0.06,"Muestras de solver insuficientes");
  close(m.voltageRms,voltage,2,"Tensión 230 V");
  close(m.loadP,loadP,100,"Potencia de carga");
  close(m.pvP,-scenario.pvP,100,"Inyección FV");
  close(m.p,scenario.gridP,120,"Potencia activa de red");
  close(m.q,-capQ,160,"Potencia reactiva de red");
  close(m.capacitorIrms,capQ/voltage,0.3,"Corriente de condensador");
  close(m.lineIrms,Math.hypot(scenario.gridP,capQ)/voltage,0.45,
   "Corriente de acometida");
 }
 assert.deepEqual(errors,[],"Errores de navegador");
 console.log("OK: 230 V FV 5 kW y condensador 2,5 kVAr; importación, P=0 y vertido");
}finally{await browser.close();}

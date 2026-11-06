import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {chromium} from "playwright";

const xml=await readFile(new URL("./fixtures/fv-bateria-tres-escalones.xml",import.meta.url),"utf8");
const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage();
  const browserErrors=[];
  page.on("pageerror",error=>browserErrors.push(error.message));
  await page.addInitScript(()=>localStorage.setItem("labStartConfigured","1"));
  await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
  await page.locator('button[data-mode="falstad"]').click();
  await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
  await page.waitForFunction(()=>document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1?.getTime()>0.02,null,{timeout:90000});

  // Comprobar las ocho combinaciones reales de tres interruptores y condensadores.
  // Cada escalón aporta 0,5, 0,5 y 1 VAr a 10 V RMS y 50 Hz.
  for(let mask=0;mask<8;mask++){
    let index=0;
    const circuit=xml.replace(/(<s\b[^>]*\bp=")1(")/g,(_,a,b)=>{
      const closed=Boolean(mask&(1<<index++));
      return a+(closed?"0":"1")+b;
    });
    assert.equal(index,3,"Deben existir exactamente tres interruptores en el circuito");
    const imported=await page.evaluate(x=>window.LabCircuit.importNativeCircuit("FV banco "+x.mask,x.circuit),{mask,circuit});
    assert(imported?.ok,"Importación rechazada para combinación "+mask);
    await page.waitForFunction(()=>{
      const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
      return sim?.getTime()>0.10&&Array.from(sim.getElements()).filter(e=>e.getType()==="CapacitorElm").length===3;
    },null,{timeout:60000});
    const measured=await page.evaluate(async()=>{
      const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
      const elements=Array.from(sim.getElements());
      const switches=elements.filter(e=>e.getType()==="SwitchElm");
      const capacitors=elements.filter(e=>e.getType()==="CapacitorElm");
      const inverter=elements.filter(e=>e.getType()==="PVInverterElm");
      const grid=elements.find(e=>e.getType()==="VoltageElm");
      const samples=[];
      const previous=sim.ontimestep;
      sim.ontimestep=()=>{
        previous?.();
        if(!grid)return;
        samples.push({t:sim.getTime(),i:grid.getCurrent(),v:grid.getVoltageDiff(),
          caps:capacitors.map(c=>c.getCurrent())});
        if(samples.length>50000)samples.shift();
      };
      try{
        const start=sim.getTime();
        for(let k=0;k<500&&sim.getTime()-start<0.12;k++)
          await new Promise(resolve=>setTimeout(resolve,20));
      }finally{sim.ontimestep=previous;}
      const end=samples.at(-1)?.t??0;
      const data=samples.filter(s=>s.t>=end-0.08);
      let duration=0,gridI2=0,gridEnergy=0,gridV2=0;
      const capI2=[0,0,0];
      for(let i=1;i<data.length;i++){
        const a=data[i-1],b=data[i],dt=b.t-a.t;
        if(!(dt>0))continue;
        duration+=dt;
        gridI2+=dt*(a.i*a.i+b.i*b.i)/2;
        gridV2+=dt*(a.v*a.v+b.v*b.v)/2;
        gridEnergy+=dt*(a.i*a.v+b.i*b.v)/2;
        for(let j=0;j<3;j++)capI2[j]+=dt*(a.caps[j]**2+b.caps[j]**2)/2;
      }
      return {switches:switches.map(s=>s.position),capacitors:capacitors.length,
        inverter:inverter.length,samples:data.length,duration,
        gridIrms:Math.sqrt(gridI2/duration),gridVrms:Math.sqrt(gridV2/duration),gridP:gridEnergy/duration,
        capIrms:capI2.map(v=>Math.sqrt(v/duration)),exported:sim.exportCircuit()};
    });
    assert.equal(measured.capacitors,3);
    assert.equal(measured.inverter,1);
    assert.deepEqual(measured.switches,[0,1,2].map(j=>mask&(1<<j)?0:1));
    assert(measured.samples>100&&measured.duration>0.06,"Muestreo insuficiente: "+mask);
    assert(Number.isFinite(measured.gridIrms)&&Number.isFinite(measured.gridP));
    assert(Math.abs(measured.gridVrms-10)<0.15,
      "Tensión de red fuera de tolerancia en combinación "+mask+": "+measured.gridVrms);
    const expected=[0.05,0.05,0.10].map((i,j)=>mask&(1<<j)?i:0);
    for(let j=0;j<3;j++)
      assert(Math.abs(measured.capIrms[j]-expected[j])<0.008,
        "Corriente de condensador "+j+" incorrecta para combinación "+mask+": "+measured.capIrms[j]);
    // FV aporta 0,5 W; la red sigue suministrando 0,5 W.
    assert(Math.abs(Math.abs(measured.gridP)-0.5)<0.06,
      "Potencia activa de red incorrecta en combinación "+mask+": "+measured.gridP);
    const expectedGrid=Math.hypot(0.05,expected.reduce((a,b)=>a+b,0));
    assert(Math.abs(measured.gridIrms-expectedGrid)<0.012,
      "Corriente RMS de red incorrecta en combinación "+mask+": "+measured.gridIrms+" frente a "+expectedGrid);
    const roundTrip=await page.evaluate(exported=>{
      const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
      sim.importCircuit(exported);
      const e=Array.from(sim.getElements());
      return {switches:e.filter(x=>x.getType()==="SwitchElm").map(x=>x.position),
        capacitors:e.filter(x=>x.getType()==="CapacitorElm").length,
        inverter:e.filter(x=>x.getType()==="PVInverterElm").length};
    },measured.exported);
    assert.deepEqual(roundTrip.switches,measured.switches,"Interruptores alterados tras exportación/importación");
    assert.equal(roundTrip.capacitors,3);
    assert.equal(roundTrip.inverter,1);
    console.log("OK: combinación",mask, "Ired",measured.gridIrms,"P red",measured.gridP,"I condensadores",measured.capIrms);
  }
  assert.deepEqual(browserErrors,[],"Errores de ejecución del navegador");
}finally{await browser.close();}

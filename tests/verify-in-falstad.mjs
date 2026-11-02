import assert from "node:assert/strict";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
page.on("pageerror",err=>console.error("BROWSER:",err.message));
try {
  await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
  // El iframe CircuitJS se carga de forma diferida y está oculto en la vista inicial.
  await page.locator('button[data-mode="falstad"]').click();
  await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:180000});
  await page.waitForFunction(()=>document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1,null,{timeout:180000});
  // La instancia JS puede existir antes de que termine la carga del circuito inicial.
  await page.waitForFunction(()=>{const s=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;return s?.getTime?.()>0.02;},null,{timeout:45000});
  for(const [unit,number] of [[2,1],[2,2],[3,3],[3,5],[3,6],[4,4],[4,5],[4,6]]){
    const ref={unit,kind:"resuelta",number};
    const meta=await page.evaluate(ref=>{
      const x=window.LabTextbookExercises.build(ref);
      const result=window.LabCircuit.loadExerciseCircuit(x.id,x.circuit);
      return {id:x.id,expected:x.measured,load:result};
    },ref);
    assert(meta.load?.ok,meta.id+": CircuitJS rechazó la importación: "+JSON.stringify(meta.load));
    try{
      await page.waitForFunction(id=>{
        const r=window.LabCircuit.getInstrumentReadings();
        return r?.id===id && r.time>=0.03 && Number.isFinite(r.current) &&
          Number.isFinite(r.voltage) && Number.isFinite(r.power);
      },meta.id,{timeout:8000});
    }catch(err){
      const diagnostic=await page.evaluate(()=>{
        const frame=document.getElementById("circuit-frame");
        const sim=frame?.contentWindow?.CircuitJS1;
        let state={status:document.getElementById("bridge-status")?.textContent,
          frameSrc:frame?.src,readings:window.LabCircuit.getInstrumentReadings()};
        try{
          state.time=sim?.getTime();
          state.elements=Array.from(sim?.getElements()||[]).map(el=>({
            type:el.getType(),current:el.getCurrent?.(),voltage:el.getVoltageDiff?.()
          })).slice(0,18);
        }catch(x){state.problem=String(x);}
        return state;
      });
      console.error("DIAGNÓSTICO DE CIRCUITJS",JSON.stringify(diagnostic));
      throw err;
    }
    const readings=await page.evaluate(()=>window.LabCircuit.getInstrumentReadings());
    for(const measure of meta.expected){
      const actual=readings[measure.type];
      const tolerance=Math.max(0.0001,Math.abs(measure.value)*0.005);
      const error=Math.abs(actual-measure.value);
      assert(error<=tolerance,meta.id+": "+measure.label+
        " calcula "+measure.value+", Falstad "+actual+", error "+error);
      console.log(meta.id,measure.label,"teoría",measure.value,"medido",actual);
    }
  }
  // Comprobar importación y exportación nativas con el motor real del iframe.
  const roundtrip=await page.evaluate(()=>{
    const frame=document.getElementById("circuit-frame");
    const api=frame?.contentWindow?.CircuitJS1;
    const before=Array.from(api?.getElements?.()||[]).map(el=>el.getType());
    const exported=window.LabCircuit.exportNativeCircuit();
    if(!exported.ok)return {exported,typesBefore:before};
    const imported=window.LabCircuit.importNativeCircuit("PN-roundtrip",exported.dump);
    const after=Array.from(api.getElements()).map(el=>el.getType());
    const again=window.LabCircuit.exportNativeCircuit();
    return {exported:{ok:exported.ok,format:exported.format,header:exported.dump.slice(0,2)},
      imported,again:{ok:again.ok,header:again.dump?.slice(0,2)},
      typesBefore:before,typesAfter:after};
  });
  assert(roundtrip.exported.ok,"Exportación nativa fallida: "+JSON.stringify(roundtrip));
  assert.equal(roundtrip.exported.format,"circuitjs-text");
  assert.equal(roundtrip.exported.header,"$ ");
  assert(roundtrip.imported?.ok,"Importación nativa fallida: "+JSON.stringify(roundtrip));
  assert(roundtrip.again?.ok && roundtrip.again.header==="$ ","Reexportación fallida");
  assert.deepEqual(roundtrip.typesAfter,roundtrip.typesBefore,"El circuito cambió al reimportarlo");
  console.log("IMPORTACIÓN/EXPORTACIÓN NATIVA CIRCUITJS CONTRASTADA CON MOTOR REAL");
  console.log("OCHO ACTIVIDADES CONTRASTADAS CON MOTOR REAL CIRCUITJS");
}finally{await browser.close();}

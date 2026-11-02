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
  assert.equal(roundtrip.exported.format,"circuitjs-xml");
  assert.equal(roundtrip.exported.header,"<c");
  assert(roundtrip.imported?.ok,"Importación nativa fallida: "+JSON.stringify(roundtrip));
  assert(roundtrip.again?.ok && roundtrip.again.header==="<c","Reexportación fallida");
  assert.deepEqual(roundtrip.typesAfter,roundtrip.typesBefore,"El circuito cambió al reimportarlo");
  // Contraste cruzado: el XML del motor pasa por el importador Wulflemm,
  // vuelve al motor eléctrico y conserva el inventario de componentes.
  const cross=await page.evaluate(()=>{
    const api=document.getElementById("circuit-frame").contentWindow.CircuitJS1;
    const original=window.LabCircuit.exportNativeCircuit();
    const types=Array.from(api.getElements()).map(e=>e.getType());
    const imported=window.LabCircuit.importWulflemmXml(original.dump);
    const after=Array.from(api.getElements()).map(e=>e.getType());
    const wulflemm=window.LabCircuit.exportWulflemmXml();
    const reimported=wulflemm.ok
      ?window.LabCircuit.importNativeCircuit("PN-wulflemm-roundtrip",wulflemm.xml):null;
    const final=Array.from(api.getElements()).map(e=>e.getType());
    return {imported,wulflemm:{ok:wulflemm.ok,length:wulflemm.xml?.length},
      reimported,types,after,final};
  });
  assert(cross.imported?.ok && cross.imported.simulated,
    "XML Wulflemm no se carga en el motor: "+JSON.stringify(cross));
  assert.deepEqual(cross.after,cross.types,"XML Wulflemm altera los componentes");
  assert(cross.wulflemm.ok && cross.reimported?.ok,
    "XML Wulflemm no se puede reimportar: "+JSON.stringify(cross));
  assert.deepEqual(cross.final,cross.types,
    "Ida y vuelta XML Wulflemm altera los componentes");
  // Comparación estructural de atributos y jerarquía XML, no solo clases.
  const structure=await page.evaluate(()=>{
    const api=document.getElementById("circuit-frame").contentWindow.CircuitJS1;
    const first=api.exportCircuit();
    const parse=xml=>{
      const doc=new DOMParser().parseFromString(xml,"application/xml");
      if(doc.querySelector("parsererror"))throw Error("XML mal formado");
      const walk=el=>({
        tag:el.tagName,
        attrs:Object.fromEntries(Array.from(el.attributes).map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0]))),
        children:Array.from(el.children).map(walk)
      });
      return walk(doc.documentElement);
    };
    const before=parse(first);
    const imported=window.LabCircuit.importWulflemmXml(first);
    const after=parse(api.exportCircuit());
    return {imported,before,after};
  });
  assert(structure.imported.ok && structure.imported.simulated,
    "Importación XML eléctrica fallida: "+JSON.stringify(structure.imported));
  assert.deepEqual(structure.after,structure.before,
    "Se han modificado parámetros, conexiones o estructura XML durante la importación");
  console.log("ESTRUCTURA Y ATRIBUTOS XML CONSERVADOS TRAS IMPORTACIÓN ELÉCTRICA");
  // Fichero Wulflemm original: comprobar carga eléctrica real y dos vatímetros.
  const originalXml=await (await fetch("http://127.0.0.1:8765/tests/fixtures/wulflemm-aron.xml")).text();
  assert(originalXml.includes("<WattmeterTrue "),"Falta el circuito Wulflemm de referencia");
  const originalCross=await page.evaluate(xml=>{
    const api=document.getElementById("circuit-frame").contentWindow.CircuitJS1;
    const imported=window.LabCircuit.importWulflemmXml(xml);
    const types=Array.from(api.getElements()).map(e=>e.getType());
    const exported=window.LabCircuit.exportNativeCircuit();
    return {imported,types,exported:exported.ok?{ok:true,xml:exported.dump}:exported};
  },originalXml);
  assert(originalCross.imported.ok && originalCross.imported.simulated,
    "El circuito original Wulflemm no se ha cargado eléctricamente: "+JSON.stringify(originalCross.imported));
  assert.equal(originalCross.types.filter(t=>/Wattmeter/.test(t)).length,2,
    "El motor no conserva los dos vatímetros Wulflemm");
  assert(originalCross.exported.ok,"No se puede exportar el circuito Wulflemm original");
  const exportedXml=originalCross.exported.xml;
  const compare=await page.evaluate(({original,exported})=>{
    const normalize=xml=>{
      const d=new DOMParser().parseFromString(xml,"application/xml");
      if(d.querySelector("parsererror"))throw Error("XML mal formado");
      return Array.from(d.documentElement.children).filter(e=>e.tagName!=="o").map(e=>({
        tag:e.tagName,
        attrs:Object.fromEntries(Array.from(e.attributes)
          .filter(a=>!["i","vd"].includes(a.name))
          .map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0])))
      }));
    };
    return {before:normalize(original),after:normalize(exported)};
  },{original:originalXml,exported:exportedXml});
  assert.deepEqual(compare.after,compare.before,
    "La importación/exportación Wulflemm modifica componentes o conexiones");
  // Comprobar que los dos vatímetros producen potencia finita y que
  // la suma coincide con la potencia activa de las tres resistencias.
  await page.waitForFunction(()=>{
    const r=window.LabCircuit.getAronReadings();
    const api=document.getElementById("circuit-frame")?.contentWindow?.CircuitJS1;
    return r?.valid && api?.getTime?.()>0.2;
  },null,{timeout:30000});
  const aron=await page.evaluate(()=>{
    const api=document.getElementById("circuit-frame").contentWindow.CircuitJS1;
    const elements=Array.from(api.getElements());
    const readings=window.LabCircuit.getAronReadings();
    const resistors=elements.filter(e=>e.getType()==="ResistorElm").map(e=>({
      voltage:e.getVoltageDiff(),current:e.getCurrent()
    }));
    return {readings,resistors,time:api.getTime()};
  });
  assert.equal(aron.resistors.length,3,"El circuito Aron debe tener tres resistencias");
  const resistorPower=aron.resistors.reduce((sum,r)=>sum+r.voltage*r.current,0);
  assert(Number.isFinite(aron.readings.w1)&&Number.isFinite(aron.readings.w2),
    "Lecturas de vatímetros no finitas");
  assert(Math.abs(aron.readings.total-(aron.readings.w1+aron.readings.w2))<1e-8,
    "La suma de vatímetros Aron no coincide");
  // La carga RLC consume potencia activa en las resistencias ideales.
  // El margen incluye la integración temporal de 100 ms y el régimen transitorio.
  const tolerance=Math.max(0.2,Math.abs(resistorPower)*0.05);
  assert(Math.abs(aron.readings.total-resistorPower)<=tolerance,
    "Potencia Aron "+aron.readings.total+" W, resistencias "+resistorPower+" W");
  console.log("ARON: W1",aron.readings.w1,"W; W2",aron.readings.w2,
    "W; suma",aron.readings.total,"W; resistencias",resistorPower,"W");
  console.log("ARCHIVO ORIGINAL WULFLEMM: DOS VATÍMETROS Y TOPOLOGÍA CONSERVADOS");
  console.log("INTERCAMBIO XML ENTRE IMPORTADOR WULFLEMM Y MOTOR CIRCUITJS VALIDADO");
  console.log("IMPORTACIÓN/EXPORTACIÓN NATIVA CIRCUITJS CONTRASTADA CON MOTOR REAL");
  console.log("OCHO ACTIVIDADES CONTRASTADAS CON MOTOR REAL CIRCUITJS");
}finally{await browser.close();}

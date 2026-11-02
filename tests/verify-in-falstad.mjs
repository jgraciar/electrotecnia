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
  // Exportación Wulflemm: debe reflejar el estado eléctrico real del motor.
  const liveWulflemm=await page.evaluate(()=>({
    live:window.LabCircuit.exportWulflemmXml(),
    native:window.LabCircuit.exportNativeCircuit().format
  }));
  assert(liveWulflemm.live.ok,
    "No se exporta XML Wulflemm desde el estado real: "+JSON.stringify(liveWulflemm));
  assert.equal(liveWulflemm.live.format,"wulflemm-xml");
  assert(liveWulflemm.live.xml.includes("<WattmeterTrue "),
    "La exportación viva pierde los vatímetros");
  console.log("EXPORTACIÓN WULFLEMM DESDE MOTOR REAL",JSON.stringify({
    format:liveWulflemm.native,bytes:liveWulflemm.live.xml.length}));
  // Round-trip de una edición XML de resistencia a través del motor real.
  const editedRoundTrip=await page.evaluate(()=>{
    const api=document.getElementById("circuit-frame").contentWindow.CircuitJS1;
    const doc=new DOMParser().parseFromString(api.exportCircuit(),"application/xml");
    const node=Array.from(doc.documentElement.children).find(e=>e.tagName==="r");
    if(!node)return {error:"No hay resistencia"};
    const original=Number(node.getAttribute("r")),changed=original+137;
    node.setAttribute("r",String(changed));
    const imported=window.LabCircuit.importWulflemmXml(new XMLSerializer().serializeToString(doc));
    const exported=window.LabCircuit.exportWulflemmXml();
    if(!imported.ok||!exported.ok)return {imported,exported};
    const saved=new DOMParser().parseFromString(exported.xml,"application/xml");
    const persisted=Number(Array.from(saved.documentElement.children).find(e=>e.tagName==="r")?.getAttribute("r"));
    const reimported=window.LabCircuit.importWulflemmXml(exported.xml);
    return {original,changed,persisted,imported,reimported};
  });
  assert(editedRoundTrip.imported?.ok&&editedRoundTrip.reimported?.ok,
    "Error de edición y reimportación: "+JSON.stringify(editedRoundTrip));
  assert.equal(editedRoundTrip.persisted,editedRoundTrip.changed,
    "La exportación no conserva la resistencia editada");
  console.log("EDICIÓN XML BIDIRECCIONAL",JSON.stringify({
    original:editedRoundTrip.original,changed:editedRoundTrip.changed}));
  const restored=await page.evaluate(xml=>window.LabCircuit.importWulflemmXml(xml),originalXml);
  assert(restored.ok,"No se pudo restaurar el circuito original");
  // Diagnóstico reproducible para automatizar la edición gráfica del resistor.
  const gui=await page.evaluate(()=>{
    const d=document.getElementById("circuit-frame").contentDocument;
    return {canvas:Array.from(d.querySelectorAll("canvas")).map(c=>({
      id:c.id,width:c.width,height:c.height,
      rect:{x:c.getBoundingClientRect().x,y:c.getBoundingClientRect().y,
        width:c.getBoundingClientRect().width,height:c.getBoundingClientRect().height}})),
      controls:Array.from(d.querySelectorAll("input,button")).slice(0,12).map(e=>({
        tag:e.tagName,id:e.id,value:e.value,text:e.textContent?.trim().slice(0,45)}))};
  });
  console.log("DIAGNÓSTICO EDICIÓN GRÁFICA",JSON.stringify(gui));
  // Inspección del diálogo real de edición mediante doble clic en la resistencia.
  const guiEdit=await page.evaluate(()=>{
    const frame=document.getElementById("circuit-frame");
    const d=frame.contentDocument;
    const canvas=Array.from(d.querySelectorAll("canvas")).find(c=>c.width===952&&c.height===448);
    const r=Array.from(new DOMParser().parseFromString(frame.contentWindow.CircuitJS1.exportCircuit(),"application/xml").documentElement.children)
      .find(n=>n.tagName==="r");
    if(!canvas||!r)return {error:"Faltan lienzo o resistencia"};
    const xy=r.getAttribute("x").split(/\\s+/).map(Number);
    const rect=canvas.getBoundingClientRect();
    return {x:rect.x+(xy[0]+xy[2])/2,y:rect.y+(xy[1]+xy[3])/2,
      resistor:xy,canvas:{width:rect.width,height:rect.height}};
  });
  if(guiEdit.error)throw Error(JSON.stringify(guiEdit));
  const circuitFrame=page.frameLocator("#circuit-frame");
  await page.evaluate(({x,y})=>{
    const d=document.getElementById("circuit-frame").contentDocument;
    const canvas=Array.from(d.querySelectorAll("canvas")).find(c=>c.width===952&&c.height===448);
    for(const type of ["mousedown","mouseup","click","mousedown","mouseup","click","dblclick"])
      canvas.dispatchEvent(new MouseEvent(type,{bubbles:true,cancelable:true,view:d.defaultView,
        clientX:x,clientY:y,button:0,buttons:type==="mousedown"?1:0,detail:type==="dblclick"?2:1}));
  },{x:guiEdit.x,y:guiEdit.y});
  const dialogSnapshot=await page.evaluate(()=>{
    const d=document.getElementById("circuit-frame").contentDocument;
    return Array.from(d.querySelectorAll("input,button,[role=dialog]"))
      .filter(e=>e.getBoundingClientRect().width>0)
      .map(e=>({tag:e.tagName,type:e.type,value:e.value,text:e.textContent?.trim().slice(0,70)}))
      .slice(-25);
  });
  console.log("DIÁLOGO EDICIÓN RESISTENCIA",JSON.stringify({guiEdit,dialogSnapshot}));
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
  // Validación de la potencia instantánea con los bornes oficiales del motor.
  // En cargas RLC, la potencia instantánea incluye energía almacenada en L y C.
  // Evitar el falso positivo observado: t=0 y todas las potencias nulas.
  try {
    await page.waitForFunction(()=>{
      const api=document.getElementById("circuit-frame")?.contentWindow?.CircuitJS1;
      if(!api || !(api.getTime()>0.005))return false;
      const meters=Array.from(api.getElements()).filter(e=>e.getType()==="WattmeterTrueElm");
      if(meters.length!==2)return false;
      const powers=meters.map(e=>e.getVoltageDiff()*e.getCurrent());
      return powers.every(Number.isFinite) && powers.some(p=>Math.abs(p)>0.01);
    },null,{timeout:15000});
  } catch(error) {
    const state=await page.evaluate(()=>{
      const api=document.getElementById("circuit-frame")?.contentWindow?.CircuitJS1;
      const elements=Array.from(api?.getElements?.()||[]);
      return {time:api?.getTime?.(),readings:window.LabCircuit.getAronReadings(),
        meters:elements.filter(e=>/Wattmeter/.test(e.getType())).map(e=>({
          type:e.getType(),current:e.getCurrent?.(),posts:e.getPostCount?.(),
          terminals:Array.from({length:e.getPostCount?.()||0},(_,i)=>({
            index:i,voltage:e.getVoltage?.(i),
            point:(()=>{try{const p=e.getPost?.(i);return p?{x:p.x,y:p.y}:null;}catch(_){return null;}})()
          }))
        }))};
    });
    console.error("ARON SIN AVANCE",JSON.stringify(state));
    throw error;
  }
  const aron=await page.evaluate(()=>{
    const api=document.getElementById("circuit-frame").contentWindow.CircuitJS1;
    const elements=Array.from(api.getElements());
    const meters=elements.filter(e=>e.getType()==="WattmeterTrueElm");
    const resistors=elements.filter(e=>e.getType()==="ResistorElm");
    return {
      time:api.getTime(),
      meterPowers:meters.map(e=>e.getVoltageDiff()*e.getCurrent()),
      resistorPowers:resistors.map(e=>e.getVoltageDiff()*e.getCurrent())
    };
  });
  assert.equal(aron.meterPowers.length,2,"Faltan vatímetros en Aron");
  assert.equal(aron.resistorPowers.length,3,"Faltan resistencias en Aron");
  const meterTotal=aron.meterPowers.reduce((a,b)=>a+b,0);
  const resistorTotal=aron.resistorPowers.reduce((a,b)=>a+b,0);
  assert(Number.isFinite(meterTotal)&&Number.isFinite(resistorTotal),
    "Potencias instantáneas no finitas: "+JSON.stringify(aron));
  // No comparar potencia instantánea de Aron con solo pérdidas resistivas:
  // la diferencia incluye d/dt de la energía almacenada en L y C.
  assert(aron.meterPowers.some(p=>Math.abs(p)>0.01),
    "Los dos vatímetros siguen sin medir potencia: "+JSON.stringify(aron));
  console.log("ARON INSTANTÁNEO",JSON.stringify({time:aron.time,
    meters:aron.meterPowers,total:meterTotal,resistors:resistorTotal}));
  // Integración trapezoidal de potencia durante al menos un ciclo de 60 Hz.
  // El muestreo depende del tiempo simulado, no del reloj de Playwright.
  const average=await page.evaluate(async()=>{
    const api=document.getElementById("circuit-frame").contentWindow.CircuitJS1;
    const elements=Array.from(api.getElements());
    const meters=elements.filter(e=>e.getType()==="WattmeterTrueElm");
    const resistors=elements.filter(e=>e.getType()==="ResistorElm");
    const samples=[];
    const start=api.getTime();
    const deadline=performance.now()+45000;
    while(api.getTime()-start<1/60 && performance.now()<deadline){
      const t=api.getTime();
      if(!samples.length || t>samples[samples.length-1].t){
        samples.push({t,w:meters.map(e=>e.getVoltageDiff()*e.getCurrent()),
          r:resistors.map(e=>e.getVoltageDiff()*e.getCurrent())});
      }
      await new Promise(resolve=>setTimeout(resolve,30));
    }
    const integrate=key=>{
      let energy=0;
      for(let i=1;i<samples.length;i++){
        const a=samples[i-1],b=samples[i],dt=b.t-a.t;
        const pa=a[key].reduce((x,y)=>x+y,0),pb=b[key].reduce((x,y)=>x+y,0);
        energy+=dt*(pa+pb)/2;
      }
      const duration=samples.length>1?samples[samples.length-1].t-samples[0].t:0;
      return duration>0?energy/duration:NaN;
    };
    return {start,end:api.getTime(),samples:samples.length,
      watts:integrate("w"),resistors:integrate("r")};
  });
  console.log("ARON MEDIA 60 HZ",JSON.stringify(average));
  assert(average.end-average.start>=1/60,
    "No se completó un periodo simulado de 60 Hz: "+JSON.stringify(average));
  assert(average.samples>=5 && Number.isFinite(average.watts) &&
    Number.isFinite(average.resistors),
    "Muestreo insuficiente para potencia media: "+JSON.stringify(average));
  // Referencia independiente: tres ramas equilibradas R-L-C en serie.
  // Fuente por fase: 169.705627 V de pico = 120 V eficaces.
  const omega=2*Math.PI*60;
  const reactance=omega*1-1/(omega*10e-6);
  const theoreticalPower=3*120**2*1000/(1000**2+reactance**2);
  const relativeError=Math.abs(average.watts-theoreticalPower)/theoreticalPower;
  console.log("ARON TEORÍA RLC",JSON.stringify({theoreticalPower,
    measuredPower:average.watts,relativeError}));
  assert(relativeError<0.05,
    "La potencia media Aron difiere más del 5 % de la referencia RLC: "+
    JSON.stringify({theoreticalPower,average,relativeError}));
  // Durante transitorios, la energía reactiva almacenada puede cambiar
  // entre los extremos de la ventana; no exigir aún igualdad de medias.
  // La potencia activa media exige integrar muestras en un periodo completo;
  // no se afirma validación de esa medida mediante esta prueba instantánea.
  console.log("ARCHIVO ORIGINAL WULFLEMM: DOS VATÍMETROS Y TOPOLOGÍA CONSERVADOS");
  console.log("INTERCAMBIO XML ENTRE IMPORTADOR WULFLEMM Y MOTOR CIRCUITJS VALIDADO");
  console.log("IMPORTACIÓN/EXPORTACIÓN NATIVA CIRCUITJS CONTRASTADA CON MOTOR REAL");
  console.log("OCHO ACTIVIDADES CONTRASTADAS CON MOTOR REAL CIRCUITJS");
}finally{await browser.close();}

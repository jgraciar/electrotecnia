import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {chromium} from "playwright";

// Prueba real del motor compilado: entrada desde Wulflemm sin exigir salida compatible.
// Requiere el servidor HTTP del sitio compilado en 127.0.0.1:8765.
const original = readFileSync(new URL("./fixtures/wulflemm-aron.xml",import.meta.url),"utf8");
assert.equal((original.match(/<WattmeterTrue /g)||[]).length,2);

const browser = await chromium.launch({headless:true});
try {
  const page = await browser.newPage({viewport:{width:1440,height:950}});
  page.on("pageerror",error=>console.error("Error del navegador:",error.message));
  await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
  await page.locator('button[data-mode="falstad"]').click();
  await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    return api && api.getTime?.()>=0.03;
  },null,{timeout:90000});

  // Archivo original de Wulflemm: carga de circuito y dos vatimetros reconocidos.
  const incoming = await page.evaluate(xml=>{
    const imported=window.LabCircuit.importWulflemmXml(xml);
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const count=Array.from(sim.getElements()).filter(el=>el.getType()==="WattmeterTrueElm").length;
    const output=sim.exportCircuit();
    const doc=new DOMParser().parseFromString(output,"application/xml");
    const tags=Array.from(doc.querySelectorAll("WattmeterTrue"));
    return {imported,count,withExtra:tags.some(el=>el.hasAttribute("labCurrentMode")||el.hasAttribute("labPowerMask")),
      modes:tags.map(el=>el.getAttribute("meter"))};
  },original);
  assert(incoming.imported?.ok && incoming.imported?.simulated,JSON.stringify(incoming));
  assert.equal(incoming.count,2);
  assert.equal(incoming.withExtra,false,"No introducir preferencias nuevas por defecto en XML Wulflemm");
  assert.deepEqual(incoming.modes,["1","1"],"No conservar los modos originales");
  console.log("XML entrante Wulflemm: dos vatimetros y ajustes originales",incoming);
  const diagnostics=await page.evaluate(()=>window.LabCircuit.getCompatibilityDiagnostics());
  assert(diagnostics.ready && diagnostics.wattmeterTruePresent);
  assert.equal(diagnostics.xmlImportVerified,true,"Importación XML no confirmada por el puente");
  assert.equal(diagnostics.lastImport?.expected,27,"Inventario Wulflemm inesperado");
  assert.equal(diagnostics.lastImport?.recognized,27,"El motor perdió elementos");

  const parameters=await page.evaluate(xml=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const signature=text=>{
      const doc=new DOMParser().parseFromString(text,"application/xml");
      const attrs={v:["x","f","wf","fr","maxv","phaseShift"],
        r:["x","f","r"],l:["x","f","l","ic"],
        c:["x","f","c","iv","sr"],
        WattmeterTrue:["x","f","w","meter"]};
      return Array.from(doc.documentElement.children).filter(el=>attrs[el.tagName])
        .map(el=>({type:el.tagName,
          values:attrs[el.tagName].map(key=>el.getAttribute(key)??(key==="phaseShift"?"0":""))}));
    };
    return {expected:signature(xml),actual:signature(sim.exportCircuit())};
  },original);
  assert.deepEqual(parameters.actual,parameters.expected,
    "Al importar Wulflemm se modifican los parámetros originales de elementos eléctricos");

  await page.waitForFunction(()=>{
    const m=window.LabCircuit.getAronReadings();
    return m?.valid && Number.isFinite(m.w1)&&Number.isFinite(m.w2) && m.total>0;
  },null,{timeout:90000});
  console.log("Aron con el motor real",await page.evaluate(()=>window.LabCircuit.getAronReadings()));

  // Comprobar que el motor real ofrece P, Q y S en la ficha del vatímetro,
  // además de conservar las máscaras de visualización en el XML.
  const instrumentInfo=await page.evaluate(()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(sim.getElements()).filter(e=>e.getType()==="WattmeterTrueElm")
      .map(e=>e.getInfo());
  });
  assert.equal(instrumentInfo.length,2,"Deben existir los dos vatímetros físicos de Aron");
  for(const info of instrumentInfo){
    assert(info.some(line=>/^P = /.test(line)),
      "El instrumento no muestra P promedio: "+JSON.stringify(info));
    assert(info.some(line=>/^Q \(fundamental\) = /.test(line)),
      "El instrumento no muestra Q fundamental: "+JSON.stringify(info));
    assert(info.some(line=>/^S = /.test(line)),
      "El instrumento no muestra S aparente: "+JSON.stringify(info));
  }
  console.log("Pantalla de magnitudes P/Q/S disponible para ambos vatímetros");


  // Opciones propias: se deben guardar y reabrir en el laboratorio,
  // sin que sea necesario exportarlas a Wulflemm.
  const extended=original.replace(/(<WattmeterTrue\b[^>]*\bmeter="1")\s*\/>/,
    '$1 labCurrentMode="2" labPowerMask="7"/>');
  assert.notEqual(extended,original,"No se ha creado la variante local");
  const saved=await page.evaluate(xml=>{
    const loaded=window.LabCircuit.importWulflemmXml(xml);
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const output=sim.exportCircuit();
    const doc=new DOMParser().parseFromString(output,"application/xml");
    const attr=Array.from(doc.querySelectorAll("WattmeterTrue")).map(el=>({
      current:el.getAttribute("labCurrentMode"),mask:el.getAttribute("labPowerMask")
    }));
    sim.importCircuit(output);
    const after=new DOMParser().parseFromString(sim.exportCircuit(),"application/xml");
    const second=Array.from(after.querySelectorAll("WattmeterTrue")).map(el=>({
      current:el.getAttribute("labCurrentMode"),mask:el.getAttribute("labPowerMask")
    }));
    return {loaded,attr,second};
  },extended);
  assert(saved.loaded?.ok,JSON.stringify(saved));
  assert.equal(saved.attr[0]?.current,"2");
  assert.equal(saved.attr[0]?.mask,"7");
  assert.deepEqual(saved.attr,saved.second,"Perdida de preferencias P/Q/S al guardar y abrir");
  console.log("Preferencias locales persistentes tras guardar y abrir",saved.attr);
  // Las siete selecciones no vacias deben serializarse de forma estable.
  const modes=await page.evaluate(original=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const out=[];
    for(let mask=1;mask<=7;mask++){
      const xml=original.replace(/(<WattmeterTrue\b[^>]*\bmeter="1")\s*\/>/,
        '$1 labCurrentMode="2" labPowerMask="'+mask+'"/>');
      sim.importCircuit(xml);
      const saved=sim.exportCircuit();
      const meter=new DOMParser().parseFromString(saved,"application/xml")
        .querySelector("WattmeterTrue");
      out.push({requested:mask,recorded:Number(meter.getAttribute("labPowerMask")||1),
        mode:meter.getAttribute("labCurrentMode")});
    }
    return out;
  },original);
  assert.equal(modes.length,7);
  assert(modes.every(x=>x.requested===x.recorded && x.mode==="2"),
    "Alguna combinacion P/Q/S se pierde al guardar: "+JSON.stringify(modes));
  console.log("Combinaciones de potencia verificadas",modes);

  // Archivo de texto del CircuitJS clásico (la compatibilidad no se limita a XML).
  const nativeCircuit = [
    "$ 1 0.000005 10 50 5 50",
    "v 32 128 32 64 0 0 40 5 0 0 0.5",
    "g 32 128 32 144 0",
    "r 32 64 160 64 0 100",
    "w 160 64 160 128 0",
    "w 160 128 32 128 0"
  ].join("\n")+"\n";
  const plain=await page.evaluate(dump=>{
    const loaded=window.LabCircuit.importNativeCircuit("falstad-example.txt",dump);
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return {loaded,types:Array.from(sim.getElements()).map(x=>x.getType())};
  },nativeCircuit);
  assert(plain.loaded?.ok && plain.loaded?.simulated,"Importación de archivo TXT Falstad fallida: "+JSON.stringify(plain));
  assert.equal(plain.types.length,5,"Importación TXT Falstad pierde elementos");
  const textDiagnostics=await page.evaluate(()=>window.LabCircuit.getCompatibilityDiagnostics());
  assert(textDiagnostics.lastImport?.ok && textDiagnostics.lastImport.format==="circuitjs-text",
    "El diagnóstico no reconoce correctamente el formato de Falstad");

  // Verificación de la vía real del usuario (selector de archivos de la web).
  await page.locator("#wulflemmXmlFile").setInputFiles({
    name:"falstad-circuit.txt",mimeType:"text/plain",buffer:Buffer.from(nativeCircuit)
  });
  await page.waitForFunction(()=>
    document.querySelector("#wulflemmXmlStatus")?.textContent?.includes("cargado y comprobado"),
    null,{timeout:12000});

  // La cabecera XML opcional y BOM son frecuentes en archivos intercambiados.
  const xmlDeclaration="\uFEFF<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"+original;
  const prefixed=await page.evaluate(xml=>{
    const loaded=window.LabCircuit.importWulflemmXml(xml);
    const types=Array.from(document.querySelector("#circuit-frame").contentWindow.CircuitJS1.getElements())
      .map(x=>x.getType());
    return {loaded,meters:types.filter(t=>t==="WattmeterTrueElm").length};
  },xmlDeclaration);
  assert(prefixed.loaded?.ok && prefixed.meters===2,
    "Importación XML con declaración/BOM fallida: "+JSON.stringify(prefixed));

  // Nunca anunciar éxito si el motor ha descartado un componente desconocido.
  const unknown=original.replace("</cir>",'  <UnrecognizedLaboratoryPart x="16 16 80 16" f="0"/>\n</cir>');
  const rejected=await page.evaluate(xml=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const before=Array.from(sim.getElements()).map(x=>x.getType());
    const result=window.LabCircuit.importWulflemmXml(xml);
    const after=Array.from(sim.getElements()).map(x=>x.getType());
    return {result,before,after};
  },unknown);
  assert.equal(rejected.result?.ok,false,"No debe aceptar XML con componentes descartados");
  assert.deepEqual(rejected.after,rejected.before,
    "Al rechazar un componente se debe restaurar el circuito anterior");
  console.log("Formatos entrantes verificados: TXT Falstad, XML Wulflemm y rechazo seguro de componentes no admitidos.");

  // Conjunto de circuitos originales de Falstad (tomados de la copia upstream
  // utilizada en esta misma compilación). No se alteran los parámetros.
  const falstadSamples=[
    ["ohms.txt", "ley de Ohm"],
    ["lrc.txt", "RLC y variables ajustables"],
    ["fullrect.txt", "rectificador con diodos"],
    ["transformer.txt", "transformador"],
    ["3phasewye.txt", "red trifásica"],
    ["amp-noninvert.txt", "amplificador operacional"]
  ];
  for(const [filename,description] of falstadSamples){
    const circuit=readFileSync(
      new URL("../../circuitjs-src/ts/public/circuits/"+filename,import.meta.url),"utf8");
    const expected=circuit.trim().split(/\r?\n/).filter(line=>{
      const cols=line.trim().split(/\s+/);
      return cols.length>=6 &&
        /^-?\d+$/.test(cols[1]) && /^-?\d+$/.test(cols[2]) &&
        /^-?\d+$/.test(cols[3]) && /^-?\d+$/.test(cols[4]) &&
        /^-?\d+$/.test(cols[5]) &&
        !["o","h","$","!","%","?","B",".","&",'"',"38"].includes(cols[0]);
    }).length;
    const actual=await page.evaluate(({filename,circuit})=>{
      const loaded=window.LabCircuit.importNativeCircuit(filename,circuit);
      const types=Array.from(document.querySelector("#circuit-frame").contentWindow.CircuitJS1.getElements())
        .map(el=>el.getType());
      return {loaded,types};
    },{filename,circuit});
    assert(actual.loaded?.ok && actual.loaded.simulated,
      "Circuito original Falstad no importado: "+filename+" "+JSON.stringify(actual.loaded));
    assert.equal(actual.types.length,expected,
      "Pérdida de componentes al importar "+filename);
    console.log("Falstad oficial importado:",filename,description,"componentes",expected);
  }

  // Comprobación independiente de potencia activa: los tres ramales equilibrados
  // del circuito Aron de referencia tienen R-L-C serie y tensión de fase de 120 V.
  // Se contrasta el cálculo eléctrico teórico, no solo que las lecturas sean finitas.
  const impedanceRe=1000;
  const impedanceIm=2*Math.PI*60*1 - 1/(2*Math.PI*60*10e-6);
  const expectedAron=3*120*120*impedanceRe/
    (impedanceRe*impedanceRe+impedanceIm*impedanceIm);
  const replay=await page.evaluate(xml=>{
    const loaded=window.LabCircuit.importWulflemmXml(xml);
    return loaded;
  },original);
  assert(replay.ok && replay.simulated,"No se puede restaurar el Aron para comprobar la potencia");
  await page.waitForFunction(()=>{
    const reading=window.LabCircuit.getAronReadings();
    return reading?.valid && Number.isFinite(reading.total) && reading.total>0;
  },null,{timeout:90000});
  const measuredAron=await page.evaluate(()=>window.LabCircuit.getAronReadings());
  const relativeError=Math.abs(measuredAron.total-expectedAron)/expectedAron;
  assert(relativeError<0.10,
    "Potencia Aron incompatible con RLC calculado: "+JSON.stringify({
      measured:measuredAron.total,expected:expectedAron,relativeError
    }));
  console.log("Aron: contraste eléctrico independiente",{
    measured:measuredAron.total,expected:expectedAron,relativeError
  });

  // Recargar Aron mediante el selector real para disponer de la lista de componentes.
  await page.locator("#wulflemmXmlFile").setInputFiles({
    name:"wulflemm-aron.xml",mimeType:"application/xml",buffer:Buffer.from(original)
  });
  await page.waitForFunction(()=>
    document.querySelector("#wulflemmXmlStatus")?.textContent?.includes("cargado y comprobado"),
    null,{timeout:12000});
  assert.equal(await page.locator("#wulflemmComponent").isDisabled(),false);
  assert.equal(await page.locator("#wulflemmApply").isDisabled(),false);

  // Modificar una resistencia desde la interfaz y comprobar el efecto sobre
  // el XML real exportado. Antes solo se alteraba una copia del archivo.
  const edited=await page.evaluate(()=>{
    const source=window.LabCircuit.getWulflemmComponents();
    const resistor=source.find(e=>e.name==="r");
    if(!resistor)return {error:"No se encontró resistencia"};
    const modified=window.LabCircuit.updateWulflemmAttribute(resistor.index,"r","470");
    const output=window.LabCircuit.exportWulflemmXml();
    const doc=output.ok?new DOMParser().parseFromString(output.xml,"application/xml"):null;
    const actual=doc && Array.from(doc.querySelectorAll("r"))
      .find(el=>el.getAttribute("x")===resistor.attrs.x)?.getAttribute("r");
    const scopeCount=doc?.querySelectorAll("o").length ?? 0;
    const wattCount=doc?.querySelectorAll("WattmeterTrue").length ?? 0;
    const componentCount=Array.from(document.querySelector("#circuit-frame").contentWindow.CircuitJS1.getElements()).length;
    return {modified,output:output.ok,actual,scopeCount,wattCount,componentCount,resistorIndex:resistor.index};
  });
  assert(edited.modified?.ok && edited.modified?.simulated && edited.output,
    "No se aplicó el cambio XML al motor: "+JSON.stringify(edited));
  assert.equal(edited.actual,"470","La resistencia modificada no quedó en el XML real");
  assert.equal(edited.componentCount,27,"La edición eléctrica perdió componentes");
  assert.equal(edited.wattCount,2,"La edición perdió vatímetros");
  assert.equal(edited.scopeCount,3,"La edición perdió los osciloscopios");
  console.log("Edición eléctrica real de resistencia: 1000 Ω -> 470 Ω, 27 elementos y tres osciloscopios");

  // La vía del botón «Modificar XML» debe actualizar también la simulación.
  await page.locator("#wulflemmComponent").selectOption(String(edited.resistorIndex));
  await page.locator("#wulflemmAttribute").fill("r");
  await page.locator("#wulflemmValue").fill("680");
  await page.locator("#wulflemmApply").click();
  const editByUi=await page.evaluate(()=>{
    const status=document.querySelector("#wulflemmXmlStatus").textContent;
    const saved=window.LabCircuit.exportWulflemmXml();
    const values=saved.ok?Array.from(new DOMParser().parseFromString(saved.xml,"application/xml")
      .querySelectorAll("r")).map(el=>el.getAttribute("r")):[];
    return {status,values};
  });
  assert.match(editByUi.status,/aplicado al circuito en funcionamiento/,
    "El botón no confirmó la edición eléctrica");
  assert(editByUi.values.includes("680"),
    "El botón no modificó el componente real: "+JSON.stringify(editByUi));



} finally {
  await browser.close();
}

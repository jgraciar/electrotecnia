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
  // Prueba de lo realmente pintado en el lienzo de CircuitJS; comprobar
  // solo atributos XML no detecta una vista incrustada que recorte las lecturas.
  const recordPaint=()=>{
    const fill=CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText=function(value,...args){
      const label=String(value);
      if(/^(?:P |p\(t\) |Pmax |PRMS |Q |S |cosφ |f\.d\.p\. |u\(t\) |Umax |URMS |Umed |i\(t\) |Imax |IRMS |Imed |THD U |THD I |D\* )/.test(label)){
        const rows=window.__labWattPaint||(window.__labWattPaint=[]);
        rows.push(label);
        if(rows.length>240)rows.splice(0,rows.length-120);
      }
      return fill.call(this,value,...args);
    };
  };
  await page.addInitScript(recordPaint);
  page.on("pageerror",error=>console.error("Error del navegador:",error.message));
  await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
  await page.locator('button[data-mode="falstad"]').click();
  await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    return api && api.getTime?.()>=0.03;
  },null,{timeout:90000});

  // El circuito que aparece al iniciar debe llevar las tres potencias
  // activadas en AMBOS vatímetros, sin necesitar cambiar sus propiedades.
  const startup=await page.evaluate(()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const xml=sim.exportCircuit();
    const meters=Array.from(new DOMParser().parseFromString(xml,"application/xml")
      .querySelectorAll("WattmeterTrue"));
    return {
      count:meters.length,
      modes:meters.map(x=>x.getAttribute("labCurrentMode")),
      masks:meters.map(x=>x.getAttribute("labPowerMask"))
    };
  });
  assert.equal(startup.count,2,"El circuito inicial debe mostrar los dos vatímetros de Aron");
  assert.deepEqual(startup.modes,["2","2"],"Los dos vatímetros iniciales deben detectar CA forzada");
  assert.deepEqual(startup.masks,["7","7"],"Al iniciar deben estar activas P, Q y S");

  await page.waitForFunction(()=>{
    const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    if(!sim || sim.getTime()<0.06)return false;
    const meters=Array.from(sim.getElements()).filter(x=>x.getType()==="WattmeterTrueElm");
    return meters.length===2 && meters.every(x=>{
      const info=x.getInfo();
      return info.some(v=>/^P = /.test(v)) &&
        info.some(v=>/^Q \(fundamental\) = /.test(v)) &&
        info.some(v=>/^S = /.test(v));
    });
  },null,{timeout:90000});
  console.log("Inicio: ambos vatímetros Aron presentan P, Q y S activas");
  await page.waitForFunction(()=>{
    const drawn=document.querySelector("#circuit-frame")?.contentWindow?.__labWattPaint||[];
    return ["P ","Q ","S "].every(prefix=>drawn.filter(text=>text.startsWith(prefix)).length>=2) &&
      drawn.some(text=>text.startsWith("Q ")&&!text.includes("...")) &&
      drawn.some(text=>text.startsWith("S ")&&!text.includes("..."));
  },null,{timeout:30000});
  console.log("Vista incrustada: texto de P, Q y S realmente dibujado en el lienzo");

  // Aron trifásico desequilibrado: una rama resistiva se reduce a 470 Ω.
  // La suma de las dos potencias activas debe coincidir con la potencia
  // disipada en las tres resistencias, sin conductor neutro en la carga.
  const unbalancedAron=original.replace(
    '<r x="752 304 720 352" f="0" r="1000"/>',
    '<r x="752 304 720 352" f="0" r="470"/>')
    .replace(/<WattmeterTrue\b([^>]*?)\/>/g,
      '<WattmeterTrue$1 labCurrentMode="2" labPowerMask="7"/>');
  assert.notEqual(unbalancedAron,original,
    "No se ha creado el desequilibrio trifásico");
  const aronImport=await page.evaluate(xml=>
    window.LabCircuit.importWulflemmXml(xml),unbalancedAron);
  assert(aronImport.ok && aronImport.simulated,
    "No se importa el Aron desequilibrado: "+JSON.stringify(aronImport));
  await page.waitForFunction(()=>{
    const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meters=Array.from(sim?.getElements()||[]).filter(e=>
      e.getType()==="WattmeterTrueElm");
    return sim?.getTime()>0.12 && meters.length===2 &&
      meters.every(m=>m.getInfo().some(x=>x.startsWith("P = ")&&!x.includes("...")));
  },null,{timeout:60000});
  const aronResult=await page.evaluate(()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const els=Array.from(sim.getElements());
    const meters=els.filter(e=>e.getType()==="WattmeterTrueElm");
    const resistors=els.filter(e=>e.getType()==="ResistorElm");
    return {
      meters:meters.map(e=>e.getInfo()),
      resistors:resistors.map(e=>e.getInfo()),
      exported:sim.exportCircuit(),
      time:sim.getTime()
    };
  });
  assert.equal(aronResult.meters.length,2);
  assert.equal(aronResult.resistors.length,3,
    "El circuito Aron debe contener tres resistencias de carga");
  assert(/<r x="752 304 720 352"[^>]*r="470"/.test(aronResult.exported),
    "La resistencia de 470 ohmios no se conserva en el XML exportado: "+
      aronResult.exported.match(/<r [^>]+/g)?.join("; "));
  const aronPower=aronResult.meters.map(info=>{
    const line=info.find(x=>x.startsWith("P = "));
    const match=line?.match(/^P =\s*(-?\d+(?:[.,]\d+)?)\s*(n|µ|u|m|k)?W$/i);
    assert(match,"Potencia Aron ilegible: "+JSON.stringify(info));
    const multiplier={n:1e-9,"µ":1e-6,u:1e-6,m:1e-3,k:1e3,"":1};
    return Number(match[1].replace(",","."))*multiplier[match[2]||""];
  });
  assert(aronPower.every(Number.isFinite),
    "Potencias Aron no numéricas: "+JSON.stringify(aronResult));
  // La corriente instantánea en R no equivale a su potencia media.
  // Verificación de signos y conservación energética mediante P total.
  const aronTotal=aronPower.reduce((a,b)=>a+b,0);
  assert(aronTotal>0,
    "La suma de potencias Aron debe ser positiva: "+JSON.stringify(aronResult));
  // Referencia analítica independiente: tres ramas R-L-C serie en estrella,
  // cada una alimentada a 120 V RMS, 60 Hz, con neutro de carga conectado.
  // P_rama=U² R/[R²+(ωL-1/(ωC))²].
  const omegaAron=2*Math.PI*60;
  const xAron=omegaAron*1-1/(omegaAron*10e-6);
  const expectedAron=[470,1000,1000].reduce((total,R)=>
    total+120**2*R/(R**2+xAron**2),0);
  assert(Math.abs(aronTotal-expectedAron)<Math.max(1,expectedAron*0.08),
    "La suma P1+P2 no coincide con la potencia analítica de las tres ramas: "+
    JSON.stringify({aronPower,aronTotal,expectedAron,xAron,aronResult}));
  console.log("Aron desequilibrado: P1+P2="+aronTotal.toFixed(3)+
    " W; referencia RLC="+expectedAron.toFixed(3)+" W");
  console.log("Aron desequilibrado: dos vatímetros activos, carga 470/1000/1000 Ω y P total positiva");

  // Selección nueva de lectura pico, tensión pico, intensidad instantánea y
  // ventana de 100 ms. Debe sobrevivir al XML y mostrarse en el motor real.
  const extendedModeXml=original.replace(
    /(<WattmeterTrue\b[^>]*\bmeter="1")\s*\/>/,
    '$1 labCurrentMode="2" labPowerMask="7" labPowerReadMode="1"'+
    ' labVoltageReadMode="1" labCurrentReadMode="0"'+
    ' labShowVoltage="1" labShowCurrent="1" labWindowMode="2"/>');
  assert.notEqual(extendedModeXml,original);
  const advancedModes=await page.evaluate(xml=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    sim.importCircuit(xml);
    const doc=new DOMParser().parseFromString(sim.exportCircuit(),"application/xml");
    const meter=doc.querySelector("WattmeterTrue");
    return {
      count:doc.querySelectorAll("WattmeterTrue").length,
      power:meter?.getAttribute("labPowerReadMode"),
      voltage:meter?.getAttribute("labVoltageReadMode"),
      current:meter?.getAttribute("labCurrentReadMode"),
      showVoltage:meter?.getAttribute("labShowVoltage"),
      showCurrent:meter?.getAttribute("labShowCurrent"),
      window:meter?.getAttribute("labWindowMode")
    };
  },extendedModeXml);
  assert.equal(advancedModes.count,2);
  assert.deepEqual([
    advancedModes.power,advancedModes.voltage,advancedModes.current,
    advancedModes.showVoltage,advancedModes.showCurrent,advancedModes.window
  ],["1","1","0","1","1","2"],"No se conservan modos y ventana del vatímetro");
  await page.waitForFunction(()=>{
    const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    if(!sim||sim.getTime()<0.13)return false;
    const meter=Array.from(sim.getElements()).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return info.some(s=>s.startsWith("Lectura P [pico] = ")&&!s.endsWith("...")) &&
      info.some(s=>s.startsWith("U [pico] = ")&&!s.endsWith("...")) &&
      info.some(s=>s.startsWith("I [instantánea] = ")&&!s.endsWith("..."));
  },null,{timeout:90000});
  const modeInformation=await page.evaluate(()=>{
    const frame=document.querySelector("#circuit-frame").contentWindow;
    const info=Array.from(frame.CircuitJS1.getElements())
      .find(e=>e.getType()==="WattmeterTrueElm")?.getInfo();
    return {info,painted:(frame.__labWattPaint||[]).slice(-80)};
  });
  assert(modeInformation.painted.some(s=>s.startsWith("Pmax ")),
    "El modo pico de potencia no se pinta en el lienzo");
  assert(modeInformation.painted.some(s=>s.startsWith("Umax ")),
    "El modo pico de tensión no se pinta en el lienzo");
  assert(modeInformation.painted.some(s=>s.startsWith("i(t) ")),
    "La intensidad instantánea no se pinta en el lienzo");
  console.log("Lecturas U/I/P configurables: pico e instantánea visibles; ventana 100 ms conservada");

  // La potencia activa usa P en los modos medio, pico y RMS, y p(t)
  // exclusivamente para la potencia instantánea. cosφ y f.d.p. se
  // seleccionan de forma independiente, y se conservan en el XML.
  const factorXml=original.replace(
    /(<WattmeterTrue\b[^>]*\bmeter="1")\s*\/>/,
    '$1 labCurrentMode="2" labPowerMask="7"'+
    ' labShowCosPhi="1" labShowPowerFactor="1"/>');
  const factorSaved=await page.evaluate(xml=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    sim.importCircuit(xml);
    const doc=new DOMParser().parseFromString(sim.exportCircuit(),"application/xml");
    const first=doc.querySelector("WattmeterTrue");
    return {
      mask:first?.getAttribute("labPowerMask"),
      cos:first?.getAttribute("labShowCosPhi"),
      fdp:first?.getAttribute("labShowPowerFactor"),
      meter:first?.getAttribute("meter"),
      labels:document.querySelector("#circuit-frame").contentWindow.__labWattPaint?.slice(-80)
    };
  },factorXml);
  assert.deepEqual([factorSaved.mask,factorSaved.cos,factorSaved.fdp,factorSaved.meter],
    ["7","1","1","1"],"Las casillas cosφ/f.d.p. no sobreviven al XML");
  await page.waitForFunction(()=>{
    const w=document.querySelector("#circuit-frame")?.contentWindow;
    const sim=w?.CircuitJS1;
    if(!sim || sim.getTime()<0.10)return false;
    const first=Array.from(sim.getElements()).find(e=>e.getType()==="WattmeterTrueElm");
    const info=first?.getInfo()||[];
    const cos=info.find(s=>s.startsWith("cos φ (fundamental) = "));
    const fdp=info.find(s=>s.startsWith("f.d.p. real (P/S) = "));
    return cos && fdp && !cos.endsWith("...") && !fdp.endsWith("...");
  },null,{timeout:90000});
  const factorInfo=await page.evaluate(()=>{
    const w=document.querySelector("#circuit-frame").contentWindow;
    const info=Array.from(w.CircuitJS1.getElements())
      .find(e=>e.getType()==="WattmeterTrueElm")?.getInfo()||[];
    const value=prefix=>{
      const line=info.find(s=>s.startsWith(prefix));
      return line?Number(line.substring(prefix.length).trim().replace(",",".")):NaN;
    };
    return {
      cos:value("cos φ (fundamental) = "),
      fdp:value("f.d.p. real (P/S) = "),
      info,
      painted:(w.__labWattPaint||[]).slice(-150)
    };
  });
  assert(Number.isFinite(factorInfo.cos)&&Number.isFinite(factorInfo.fdp),
    "El motor no calcula los dos indicadores: "+JSON.stringify(factorInfo));
  assert(Math.abs(factorInfo.cos)<=1.001&&Math.abs(factorInfo.fdp)<=1.001);
  assert(factorInfo.painted.some(s=>s.startsWith("cosφ ")),
    "El valor cosφ no está dibujado sobre el vatímetro");
  assert(factorInfo.painted.some(s=>s.startsWith("f.d.p. ")),
    "El valor f.d.p. no está dibujado sobre el vatímetro");
  console.log("cosφ fundamental y f.d.p. P/S: valores independientes, visibles y persistentes");

  // Nuevas lecturas armónicas: XML, información y dibujo real del medidor.
  const harmonicsXml=original.replace(
    /(<WattmeterTrue\b[^>]*\bmeter="1")\s*\/>/,
    '$1 labCurrentMode="2" labPowerMask="7"'+
    ' labShowTHDU="1" labShowTHDI="1" labShowDistortion="1"/>');
  assert.notEqual(harmonicsXml,original,"No se creó el circuito de prueba armónica");
  const harmonicSaved=await page.evaluate(xml=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    sim.importCircuit(xml);
    const saved=sim.exportCircuit();
    const doc=new DOMParser().parseFromString(saved,"application/xml");
    const first=doc.querySelector("WattmeterTrue");
    sim.importCircuit(saved);
    const second=new DOMParser().parseFromString(sim.exportCircuit(),"application/xml")
      .querySelector("WattmeterTrue");
    return ["labShowTHDU","labShowTHDI","labShowDistortion"].map(key=>
      [first?.getAttribute(key),second?.getAttribute(key)]);
  },harmonicsXml);
  assert.deepEqual(harmonicSaved,[["1","1"],["1","1"],["1","1"]],
    "Las opciones armónicas no sobreviven a exportación/importación XML");
  await page.waitForFunction(()=>{
    const w=document.querySelector("#circuit-frame")?.contentWindow;
    const sim=w?.CircuitJS1;
    if(!sim || sim.getTime()<0.12)return false;
    const meter=Array.from(sim.getElements()).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return ["THD tension = ","THD corriente = ","D* residual no fundamental = "]
      .every(prefix=>info.some(line=>line.startsWith(prefix)&&!line.endsWith("...")));
  },null,{timeout:90000});
  // Esperar un repintado posterior a la importación. getInfo() puede
  // actualizarse antes de que el lienzo haya dibujado las nuevas filas.
  try {
    await page.waitForFunction(()=>{
      const w=document.querySelector("#circuit-frame")?.contentWindow;
      const drawn=w?.__labWattPaint||[];
      return ["THD U ","THD I ","D* "].every(prefix=>
        drawn.some(line=>line.startsWith(prefix)));
    },null,{timeout:30000});
  } catch(error) {
    const diagnostic=await page.evaluate(()=>{
      const w=document.querySelector("#circuit-frame")?.contentWindow;
      const sim=w?.CircuitJS1;
      const meter=sim && Array.from(sim.getElements())
        .find(e=>e.getType()==="WattmeterTrueElm");
      return {
        painted:(w?.__labWattPaint||[]).slice(-100),
        meterInfo:meter?.getInfo?.(),
        xml:sim?.exportCircuit?.()?.match(/<WattmeterTrue[^>]*>/g)
      };
    });
    throw new Error("Faltan magnitudes armónicas en el lienzo: "+
      JSON.stringify(diagnostic),{cause:error});
  }
  const harmonicPaint=await page.evaluate(()=>{
    const w=document.querySelector("#circuit-frame").contentWindow;
    return (w.__labWattPaint||[]).slice(-180);
  });
  assert(["THD U ","THD I ","D* "].every(prefix=>
    harmonicPaint.some(line=>line.startsWith(prefix))),
    "No se dibujan todas las magnitudes armónicas en el vatímetro: "+
      JSON.stringify(harmonicPaint));
  console.log("THD U/I y D*: XML persistente, cálculo disponible y dibujo verificado");

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

  // El archivo original de Wulflemm solo solicita P (máscara por defecto);
  // no debe forzarse Q ni S sin que estén seleccionadas.
  const instrumentInfo=await page.evaluate(()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(sim.getElements()).filter(e=>e.getType()==="WattmeterTrueElm")
      .map(e=>e.getInfo());
  });
  assert.equal(instrumentInfo.length,2,"Deben existir los dos vatímetros físicos de Aron");
  for(const info of instrumentInfo){
    assert(info.some(line=>/^P = /.test(line)),
      "El instrumento no muestra P promedio: "+JSON.stringify(info));
    assert(!info.some(line=>/^Q \(fundamental\) = /.test(line)),
      "Q no debe estar activa por defecto en Wulflemm original: "+JSON.stringify(info));
    assert(!info.some(line=>/^S = /.test(line)),
      "S no debe estar activa por defecto en Wulflemm original: "+JSON.stringify(info));
  }
  console.log("XML Wulflemm original: solo P en el vatímetro, sin Q ni S seleccionadas");


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
  await page.waitForFunction(()=>{
    const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    if(!sim || sim.getTime()<0.025)return false;
    const meter=Array.from(sim.getElements()).find(e=>e.getType()==="WattmeterTrueElm");
    const lines=meter?.getInfo()||[];
    return lines.some(line=>/^Q \(fundamental\) = /.test(line)) &&
      lines.some(line=>/^S = /.test(line));
  },null,{timeout:30000});
  const extendedInfo=await page.evaluate(()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(sim.getElements()).filter(x=>x.getType()==="WattmeterTrueElm")
      .map(x=>x.getInfo());
  });
  assert(extendedInfo[0].some(line=>/^Q \(fundamental\) = /.test(line)) &&
    extendedInfo[0].some(line=>/^S = /.test(line)),
    "Con máscara 7 deben verse P, Q y S: "+JSON.stringify(extendedInfo[0]));
  console.log("Máscara 7: P/Q/S disponibles en información del vatímetro");
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

  const unsafeEdit=await page.evaluate(index=>{
    const invalidNumber=window.LabCircuit.updateWulflemmAttribute(index,"r","sin-valor-numérico");
    const ignoredField=window.LabCircuit.updateWulflemmAttribute(index,"atributoInventado","42");
    const exported=window.LabCircuit.exportWulflemmXml();
    const doc=exported.ok?new DOMParser().parseFromString(exported.xml,"application/xml"):null;
    const resistors=doc?Array.from(doc.querySelectorAll("r")).map(el=>el.getAttribute("r")):[];
    return {invalidNumber,ignoredField,resistors};
  },edited.resistorIndex);
  assert.equal(unsafeEdit.invalidNumber?.ok,false,
    "No se puede aceptar una resistencia no numérica");
  assert.equal(unsafeEdit.ignoredField?.ok,false,
    "No se debe anunciar éxito para atributos que CircuitJS ignora");
  assert(unsafeEdit.resistors.includes("680"),
    "La edición incorrecta eliminó un ajuste válido: "+JSON.stringify(unsafeEdit));
  console.log("Ediciones rechazadas sin perder valores eléctricos previos");




  // Comprobar CC en un circuito realmente alimentado en continua.
  const dcCircuit = '<cir f="1" ts="0.00001" ic="10" cb="50" pb="50" vr="5" mts="5e-11">'+
    '<v x="80 304 80 448" f="0" wf="0" fr="40" maxv="12"/>'+
    '<g x="80 448 80 480" f="0"/>'+
    '<w x="80 304 336 304" f="0"/>'+
    '<WattmeterTrue x="336 304 448 304" f="0" w="32" meter="1" labCurrentMode="1" labPowerMask="7"/>'+
    '<w x="448 304 512 304" f="0"/>'+
    '<r x="512 304 512 448" f="0" r="12"/>'+
    '<w x="512 448 80 448" f="0"/>'+
    '<w x="336 336 80 304" f="0"/>'+
    '<w x="448 336 512 448" f="0"/></cir>';
  const dcImport=await page.evaluate(xml=>window.LabCircuit.importWulflemmXml(xml),dcCircuit);
  assert(dcImport.ok && dcImport.elements===9,
    "No se abre el circuito CC de medida: "+JSON.stringify(dcImport));
  await page.waitForFunction(()=>{
    const w=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meter=Array.from(w?.getElements()||[]).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return w?.getTime()>0.08 && info.some(x=>/^P = /.test(x));
  },null,{timeout:30000});
  const dcReading=await page.evaluate(()=>{
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const meter=Array.from(api.getElements()).find(e=>e.getType()==="WattmeterTrueElm");
    return {info:meter.getInfo(),xml:api.exportCircuit()};
  });
  assert(dcReading.info.some(line=>/^Q \(fundamental\) = 0 VAr$/.test(line)));
  assert(dcReading.info.some(line=>/^S = 0 VA$/.test(line)));
  const pString=dcReading.info.find(line=>/^P = /.test(line));
  assert(pString && !/P = 0(?:\s|$)/.test(pString),
    "La potencia activa CC debe mostrar su valor real: "+JSON.stringify(dcReading.info));
  // Validación numérica de la lectura REAL del instrumento en el navegador:
  // 12 V sobre 12 ohmios -> 1 A y 12 W (sin limitarse a comprobar P != 0).
  const dcPowerMatch=pString.match(/^P =\s*(-?\d+(?:[.,]\d+)?)\s*(?:W|watts?)?$/i);
  assert(dcPowerMatch,
    "La lectura de P CC no tiene formato numérico en vatios: "+pString);
  const dcPower=Number(dcPowerMatch[1].replace(",","."));
  assert(Math.abs(dcPower-12)<0.3,
    "Vatímetro CC: se esperan 12 W con 12 V y 12 ohmios, lectura "+pString);
  console.log("Continua: P = 12 W verificados en la interfaz, Q=0 VAr y S=0 VA");

  // CA resistiva: fuente de amplitud 12*sqrt(2) V a 50 Hz y R=12 ohmios.
  // Valores analíticos independientes: Uef=12 V, Ief=1 A,
  // P=S=12 y Q1=0. Se comprueba la lectura real de getInfo().
  const acCircuit=dcCircuit
    .replace('wf="0" fr="40" maxv="12"',
      'wf="1" fr="50" maxv="16.97056274847714"')
    .replace('labCurrentMode="1"','labCurrentMode="2"');
  const acImport=await page.evaluate(xml=>window.LabCircuit.importWulflemmXml(xml),acCircuit);
  assert(acImport.ok && acImport.simulated,
    "No se abre la carga resistiva en CA: "+JSON.stringify(acImport));
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meter=Array.from(api?.getElements()||[]).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return api?.getTime()>0.2 && ["P = ","Q (fundamental) = ","S = "]
      .every(prefix=>info.some(x=>x.startsWith(prefix)&&!x.includes("...")));
  },null,{timeout:45000});
  const acInfo=await page.evaluate(()=>{
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(api.getElements()).find(e=>e.getType()==="WattmeterTrueElm").getInfo();
  });
  const acValue=(prefix,unit,acInfoOverride=acInfo)=>{
    const line=acInfoOverride.find(x=>x.startsWith(prefix));
    const match=line?.match(/(-?\d+(?:[.,]\d+)?)\s*(m?W|m?VAr|m?VA)\s*$/i);
    assert(match && match[2].toLowerCase()===unit.toLowerCase(),
      "Lectura CA no reconocida: "+JSON.stringify({prefix,line,acInfo:acInfoOverride}));
    return Number(match[1].replace(",","."))/ (match[2].startsWith("m")?1000:1);
  };
  assert(Math.abs(acValue("P = ","W")-12)<0.5,
    "Potencia activa CA resistiva distinta de 12 W: "+JSON.stringify(acInfo));
  assert(Math.abs(acValue("Q (fundamental) = ","VAr"))<0.5,
    "Potencia reactiva de carga resistiva distinta de cero: "+JSON.stringify(acInfo));
  assert(Math.abs(acValue("S = ","VA")-12)<0.5,
    "Potencia aparente CA resistiva distinta de 12 VA: "+JSON.stringify(acInfo));
  console.log("CA resistiva: P=12 W, Q1=0 VAr y S=12 VA comprobados en el vatímetro");

  // Carga RL serie: R=8 ohmios, XL=6 ohmios a 50 Hz,
  // L=6/(2*pi*50) H, Uef=10 V. Por tanto Z=8+j6 ohmios,
  // Ief=1 A, P=8 W, Q1=+6 VAr, S=10 VA y cosφ=0,8.
  const rlCircuit=acCircuit
    .replace('maxv="16.97056274847714"','maxv="14.142135623730951"')
    .replace('<r x="512 304 512 448" f="0" r="12"/>',
      '<r x="512 304 512 384" f="0" r="8"/>'+
      '<l x="512 384 512 448" f="0" l="0.01909859317102744"/>');
  const rlImport=await page.evaluate(xml=>window.LabCircuit.importWulflemmXml(xml),rlCircuit);
  assert(rlImport.ok && rlImport.simulated,
    "No se abre el circuito RL: "+JSON.stringify(rlImport));
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meter=Array.from(api?.getElements()||[]).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return api?.getTime()>0.4 && ["P = ","Q (fundamental) = ","S = "]
      .every(prefix=>info.some(x=>x.startsWith(prefix)&&!x.includes("...")));
  },null,{timeout:45000});
  const rlInfo=await page.evaluate(()=>{
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(api.getElements()).find(e=>e.getType()==="WattmeterTrueElm").getInfo();
  });
  const rlP=acValue("P = ","W",rlInfo);
  const rlQ=acValue("Q (fundamental) = ","VAr",rlInfo);
  const rlS=acValue("S = ","VA",rlInfo);
  assert(Math.abs(rlP-8)<0.5 && Math.abs(rlQ-6)<0.5 && Math.abs(rlS-10)<0.5,
    "RL: se esperan P=8 W, Q1=+6 VAr, S=10 VA; medidas "+
      JSON.stringify({rlP,rlQ,rlS,rlInfo}));
  assert(Math.abs(rlP/rlS-0.8)<0.05,
    "RL: cosφ esperado 0,8; medidas "+JSON.stringify({rlP,rlS}));
  console.log("CA inductiva RL: P=8 W, Q1=+6 VAr, S=10 VA y cosφ=0,8 comprobados");

  // Carga RC serie: R=8 ohmios, XC=-6 ohmios a 50 Hz,
  // C=1/(2*pi*50*6) F, Uef=10 V. Z=8-j6 ohmios,
  // Ief=1 A, P=8 W, Q1=-6 VAr, S=10 VA, cosφ=0,8.
  const rcCircuit=rlCircuit.replace(
    '<l x="512 384 512 448" f="0" l="0.01909859317102744"/>',
    '<c x="512 384 512 448" f="0" c="0.0005305164769729845"/>');
  assert(rcCircuit!==rlCircuit,"No se ha sustituido la bobina por el condensador");
  const rcImport=await page.evaluate(xml=>window.LabCircuit.importWulflemmXml(xml),rcCircuit);
  assert(rcImport.ok && rcImport.simulated,
    "No se abre el circuito RC: "+JSON.stringify(rcImport));
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meter=Array.from(api?.getElements()||[]).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return api?.getTime()>0.4 && ["P = ","Q (fundamental) = ","S = "]
      .every(prefix=>info.some(x=>x.startsWith(prefix)&&!x.includes("...")));
  },null,{timeout:45000});
  const rcInfo=await page.evaluate(()=>{
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(api.getElements()).find(e=>e.getType()==="WattmeterTrueElm").getInfo();
  });
  const rcP=acValue("P = ","W",rcInfo);
  const rcQ=acValue("Q (fundamental) = ","VAr",rcInfo);
  const rcS=acValue("S = ","VA",rcInfo);
  assert(Math.abs(rcP-8)<0.5 && Math.abs(rcQ+6)<0.5 && Math.abs(rcS-10)<0.5,
    "RC: se esperan P=8 W, Q1=-6 VAr, S=10 VA; medidas "+
      JSON.stringify({rcP,rcQ,rcS,rcInfo}));
  assert(Math.abs(rcP/rcS-0.8)<0.05,
    "RC: cosφ esperado 0,8; medidas "+JSON.stringify({rcP,rcS}));
  assert(rlQ>0 && rcQ<0,"La potencia reactiva debe cambiar de signo entre RL y RC");
  console.log("CA capacitiva RC: P=8 W, Q1=-6 VAr, S=10 VA y cosφ=0,8 comprobados");

  // Ensayo con quinto armónico: U1=10 V RMS (50 Hz), U5=5 V RMS (250 Hz),
  // R=10 ohmios. P=S=12,5; Q1=0; THD U=THD I=50 %.
  const harmonicCircuit=acCircuit
    .replace('<v x="80 304 80 448" f="0" wf="1" fr="50" maxv="16.97056274847714"/>',
      '<v x="80 304 80 376" f="0" wf="1" fr="50" maxv="14.142135623730951"/>'+
      '<v x="80 376 80 448" f="0" wf="1" fr="250" maxv="7.0710678118654755"/>')
    .replace('<r x="512 304 512 448" f="0" r="12"/>',
      '<r x="512 304 512 448" f="0" r="10"/>')
    .replace('labPowerMask="7"',
      'labPowerMask="7" labShowTHDU="1" labShowTHDI="1"');
  const harmonicImport=await page.evaluate(xml=>window.LabCircuit.importWulflemmXml(xml),harmonicCircuit);
  assert(harmonicImport.ok && harmonicImport.simulated,
    "No se abre el circuito con quinto armónico: "+JSON.stringify(harmonicImport));
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meter=Array.from(api?.getElements()||[]).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return api?.getTime()>0.4 && ["P = ","Q (fundamental) = ","S = ",
      "THD tension = ","THD corriente = "].every(prefix=>
      info.some(x=>x.startsWith(prefix)&&!x.includes("...")));
  },null,{timeout:45000});
  const harmonicInfo=await page.evaluate(()=>{
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(api.getElements()).find(e=>e.getType()==="WattmeterTrueElm").getInfo();
  });
  const hP=acValue("P = ","W",harmonicInfo);
  const hQ=acValue("Q (fundamental) = ","VAr",harmonicInfo);
  const hS=acValue("S = ","VA",harmonicInfo);
  assert(Math.abs(hP-12.5)<0.7 && Math.abs(hQ)<0.7 && Math.abs(hS-12.5)<0.7,
    "Potencias con quinto armónico incorrectas: "+JSON.stringify({hP,hQ,hS,harmonicInfo}));
  const readPercentage=prefix=>{
    const line=harmonicInfo.find(x=>x.startsWith(prefix));
    const match=line?.match(/(-?\d+(?:[.,]\d+)?)\s*%/);
    assert(match,"THD sin porcentaje reconocible: "+JSON.stringify({prefix,line,harmonicInfo}));
    return Number(match[1].replace(",","."));
  };
  const hThdU=readPercentage("THD tension = ");
  const hThdI=readPercentage("THD corriente = ");
  assert(Math.abs(hThdU-50)<5 && Math.abs(hThdI-50)<5,
    "THD U/I esperada 50 %: "+JSON.stringify({hThdU,hThdI,harmonicInfo}));
  console.log("Quinto armónico: P=S=12,5, Q1=0, THD U=THD I=50 %");

  // Ensayo con desfase y distorsión: U1=10 V RMS a 50 Hz,
  // U5=5 V RMS a 250 Hz, R=8 ohmios y XL1=6 ohmios.
  // I1=1 A, I5=5/sqrt(8²+30²) A. P incluye ambas frecuencias,
  // Q1 solo la fundamental; cosφ1=0,8 y P/S es inferior.
  const distortedRlCircuit=harmonicCircuit
    .replace('<r x="512 304 512 448" f="0" r="10"/>',
      '<r x="512 304 512 384" f="0" r="8"/>'+
      '<l x="512 384 512 448" f="0" l="0.01909859317102744"/>')
    .replace('labShowTHDI="1"',
      'labShowTHDI="1" labShowCosPhi="1" labShowPowerFactor="1"');
  assert(distortedRlCircuit!==harmonicCircuit,
    "No se ha construido la carga RL con quinto armónico");
  const distortedRlImport=await page.evaluate(xml=>
    window.LabCircuit.importWulflemmXml(xml),distortedRlCircuit);
  assert(distortedRlImport.ok && distortedRlImport.simulated,
    "No se abre la carga RL con armónicos: "+JSON.stringify(distortedRlImport));
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meter=Array.from(api?.getElements()||[]).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return api?.getTime()>0.4 && ["P = ","Q (fundamental) = ","S = ",
      "cos φ (fundamental) = ","f.d.p. real (P/S) = "].every(prefix=>
      info.some(x=>x.startsWith(prefix)&&!x.includes("...")));
  },null,{timeout:45000});
  const distortedRlInfo=await page.evaluate(()=>{
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(api.getElements()).find(e=>e.getType()==="WattmeterTrueElm").getInfo();
  });
  const dP=acValue("P = ","W",distortedRlInfo);
  const dQ=acValue("Q (fundamental) = ","VAr",distortedRlInfo);
  const dS=acValue("S = ","VA",distortedRlInfo);
  const expectedDistortedP=8+25*8/(8**2+30**2);
  const expectedDistortedS=Math.hypot(10,5)*Math.hypot(1,5/Math.hypot(8,30));
  const readFactor=prefix=>{
    const line=distortedRlInfo.find(x=>x.startsWith(prefix));
    const match=line?.match(/(-?\d+(?:[.,]\d+)?)/);
    assert(match,"Factor no reconocible: "+JSON.stringify({prefix,line,distortedRlInfo}));
    return Number(match[1].replace(",","."));
  };
  const dCos=readFactor("cos φ (fundamental) = ");
  const dFdp=readFactor("f.d.p. real (P/S) = ");
  assert(Math.abs(dP-expectedDistortedP)<0.5 &&
    Math.abs(dQ-6)<0.5 && Math.abs(dS-expectedDistortedS)<0.5,
    "Potencias RL armónicas incorrectas: "+JSON.stringify({
      dP,dQ,dS,expectedDistortedP,expectedDistortedS,distortedRlInfo}));
  assert(Math.abs(dCos-0.8)<0.05 &&
    Math.abs(dFdp-expectedDistortedP/expectedDistortedS)<0.05 &&
    dCos-dFdp>0.04,
    "cosφ fundamental y f.d.p. real deben diferir: "+
      JSON.stringify({dCos,dFdp,distortedRlInfo}));
  console.log("RL con quinto armónico: P, Q1, S, cosφ y f.d.p. real contrastados");

  // Rectificador real de media onda: diodo en serie con R=10 ohmios,
  // fuente de 10 V RMS a 50 Hz. La corriente pulsante contiene CC y
  // armónicos; la tensión de alimentación permanece sinusoidal.
  // La caída directa del diodo se mide, sin suponer un diodo ideal.
  const rectifierCircuit=acCircuit
    .replace('<r x="512 304 512 448" f="0" r="12"/>',
      '<d x="512 304 512 368" f="0"/>'+
      '<r x="512 368 512 448" f="0" r="10"/>')
    .replace('labPowerMask="7"',
      'labPowerMask="7" labShowTHDU="1" labShowTHDI="1"'+
      ' labShowCosPhi="1" labShowPowerFactor="1"');
  assert(rectifierCircuit!==acCircuit,"No se ha generado el rectificador");
  const rectifierImport=await page.evaluate(xml=>
    window.LabCircuit.importWulflemmXml(xml),rectifierCircuit);
  assert(rectifierImport.ok && rectifierImport.simulated,
    "No se abre el rectificador: "+JSON.stringify(rectifierImport));
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meter=Array.from(api?.getElements()||[]).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return api?.getTime()>0.4 && ["P = ","S = ","THD tension = ",
      "THD corriente = ","cos φ (fundamental) = ",
      "f.d.p. real (P/S) = "].every(prefix=>
      info.some(x=>x.startsWith(prefix)&&!x.includes("...")));
  },null,{timeout:45000});
  const rectifierInfo=await page.evaluate(()=>{
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(api.getElements()).find(e=>e.getType()==="WattmeterTrueElm").getInfo();
  });
  const rectifierP=acValue("P = ","W",rectifierInfo);
  const rectifierS=acValue("S = ","VA",rectifierInfo);
  const rectifierFactor=prefix=>{
    const line=rectifierInfo.find(x=>x.startsWith(prefix));
    const match=line?.match(/(-?\d+(?:[.,]\d+)?)/);
    assert(match,"Lectura del rectificador ilegible: "+JSON.stringify({prefix,line,rectifierInfo}));
    return Number(match[1].replace(",","."));
  };
  const rectifierCos=rectifierFactor("cos φ (fundamental) = ");
  const rectifierFdp=rectifierFactor("f.d.p. real (P/S) = ");
  // La lectura de THD del rectificador se extrae de su propio instrumento.
  const rectifierThd=prefix=>{
    const line=rectifierInfo.find(x=>x.startsWith(prefix));
    const match=line?.match(/(-?\d+(?:[.,]\d+)?)\s*%/);
    assert(match,"THD del rectificador ilegible: "+JSON.stringify({prefix,line,rectifierInfo}));
    return Number(match[1].replace(",","."));
  };
  const rectifierThdVoltage=rectifierThd("THD tension = ");
  const rectifierThdCurrent=rectifierThd("THD corriente = ");
  assert(rectifierP>0 && rectifierS>=rectifierP && rectifierS<15,
    "Potencias no físicas en el rectificador: "+JSON.stringify({rectifierP,rectifierS,rectifierInfo}));
  assert(Math.abs(rectifierThdVoltage)<3 && rectifierThdCurrent>30,
    "La tensión debe ser sinusoidal y la corriente deformada: "+
      JSON.stringify({rectifierThdVoltage,rectifierThdCurrent,rectifierInfo}));
  assert(rectifierCos>0.9 && rectifierCos<=1.01 &&
    rectifierFdp>0 && rectifierFdp<rectifierCos-0.08 &&
    Math.abs(rectifierFdp-rectifierP/rectifierS)<0.04,
    "El factor de potencia debe reflejar la distorsión: "+
      JSON.stringify({rectifierCos,rectifierFdp,rectifierP,rectifierS,rectifierInfo}));
  console.log("Rectificador de media onda: corriente deformada, cosφ y f.d.p. separados");

  // Puente rectificador de onda completa con cuatro diodos y carga R.
  // El vatímetro mide en el lado CA; los cuatro diodos forman las ramas
  // A->P, B->P, N->A y N->B. Las diagonales se cruzan sin conexión.
  const bridgeCircuit=acCircuit
    .replace('<r x="512 304 512 448" f="0" r="12"/>',
      '<d x="512 304 640 304" f="0"/>'+
      '<d x="512 448 640 304" f="0"/>'+
      '<d x="640 448 512 304" f="0"/>'+
      '<d x="640 448 512 448" f="0"/>'+
      '<r x="640 304 640 448" f="0" r="10"/>')
    .replace('labPowerMask="7"',
      'labPowerMask="7" labShowTHDU="1" labShowTHDI="1"'+
      ' labShowCosPhi="1" labShowPowerFactor="1"');
  assert(bridgeCircuit!==acCircuit,"No se ha generado el puente rectificador");
  const bridgeImport=await page.evaluate(xml=>
    window.LabCircuit.importWulflemmXml(xml),bridgeCircuit);
  assert(bridgeImport.ok && bridgeImport.simulated,
    "No se abre el puente rectificador: "+JSON.stringify(bridgeImport));
  await page.waitForFunction(()=>{
    const api=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    const meter=Array.from(api?.getElements()||[]).find(e=>e.getType()==="WattmeterTrueElm");
    const info=meter?.getInfo()||[];
    return api?.getTime()>0.4 && ["P = ","Q (fundamental) = ","S = ",
      "THD tension = ","THD corriente = ","cos φ (fundamental) = ",
      "f.d.p. real (P/S) = "].every(prefix=>
      info.some(x=>x.startsWith(prefix)&&!x.includes("...")));
  },null,{timeout:45000});
  const bridgeInfo=await page.evaluate(()=>{
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    return Array.from(api.getElements()).find(e=>e.getType()==="WattmeterTrueElm").getInfo();
  });
  const bP=acValue("P = ","W",bridgeInfo);
  // Q1 puede ser prácticamente nula y expresarse en nVAr o µVAr.
  // El lector genérico de CA solo contempla W/VAr/VA y prefijo mili.
  const bQLine=bridgeInfo.find(x=>x.startsWith("Q (fundamental) = "));
  const bQMatch=bQLine?.match(/(-?\d+(?:[.,]\d+)?)\s*(n|µ|u|m|k)?VAr$/i);
  assert(bQMatch,"Q1 del puente ilegible: "+JSON.stringify(bridgeInfo));
  const bQ=Number(bQMatch[1].replace(",","."))*
    ({n:1e-9,"µ":1e-6,u:1e-6,m:1e-3,k:1e3,"":1}[bQMatch[2]||""]);
  const bS=acValue("S = ","VA",bridgeInfo);
  const bridgeNumeric=prefix=>{
    const line=bridgeInfo.find(x=>x.startsWith(prefix));
    const match=line?.match(/(-?\d+(?:[.,]\d+)?)/);
    assert(match,"Lectura del puente ilegible: "+JSON.stringify({prefix,line,bridgeInfo}));
    return Number(match[1].replace(",","."));
  };
  const bCos=bridgeNumeric("cos φ (fundamental) = ");
  const bFdp=bridgeNumeric("f.d.p. real (P/S) = ");
  const bThdU=bridgeNumeric("THD tension = ");
  const bThdI=bridgeNumeric("THD corriente = ");
  // Referencia independiente: puente ideal con diodos reales de caída
  // directa. La potencia debe superar la media onda y permanecer por
  // debajo de los 12 W del circuito resistivo sin diodos.
  assert(bP>rectifierP*1.35 && bP<15 && bS>=bP && bS<15,
    "Potencias incoherentes en puente completo: "+
      JSON.stringify({bP,bQ,bS,rectifierP,bridgeInfo}));
  assert(Math.abs(bQ)<1.2 && Math.abs(bThdU)<3 && bThdI>3,
    "Puente: tensión sinusoidal, Q1 aproximadamente nula y corriente distorsionada: "+
      JSON.stringify({bQ,bThdU,bThdI,bridgeInfo}));
  assert(bCos>0.9 && bCos<=1.01 &&
    bFdp>0 && bFdp<=bCos+0.02 &&
    Math.abs(bFdp-bP/bS)<0.04,
    "Puente: cosφ y factor de potencia incoherentes: "+
      JSON.stringify({bCos,bFdp,bP,bS,bridgeInfo}));
  console.log("Puente de onda completa: P, Q1, S, THD y f.d.p. contrastados");

  // Al cargar otro vatímetro en CC sin máscara explícita, Q y S
  // siguen disponibles en el editor, pero empiezan sin seleccionar.
  const defaultDc=dcCircuit.replace(' labPowerMask="7"','');
  const defaultRead=await page.evaluate(xml=>{
    const loaded=window.LabCircuit.importWulflemmXml(xml);
    const api=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const elem=new DOMParser().parseFromString(api.exportCircuit(),"application/xml")
      .querySelector("WattmeterTrue");
    return {loaded,mask:elem?.getAttribute("labPowerMask"),mode:elem?.getAttribute("labCurrentMode")};
  },defaultDc);
  assert(defaultRead.loaded.ok && defaultRead.mask===null && defaultRead.mode==="1",
    "Las potencias Q y S deberían estar desmarcadas por defecto en continua");
  console.log("Continua: Q y S desmarcadas por defecto, seleccionables en propiedades");

  // Repetir comprobación del circuito incrustado en un móvil, donde antes
  // se veía solo la potencia activa por falta de espacio para el dibujo.
  // La vista principal ya no participa en la prueba; cerrarla evita que dos
  // simulaciones sigan consumiendo CPU y que la pestaña móvil quede en segundo plano.
  await page.close();
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,deviceScaleFactor:2});
  mobile.on("pageerror",e=>console.error("Error JS móvil:",e.message));
  mobile.on("console",m=>{if(m.type()==="error")console.error("Consola móvil:",m.text());});
  try {
    await mobile.bringToFront();
    await mobile.addInitScript(recordPaint);
    await mobile.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
    await mobile.locator('button[data-mode="falstad"]').click();
    // El circuito está por debajo de los controles en móviles.
    // Forzar su entrada en el área visible detecta errores de carga diferida.
    await mobile.locator("#circuit-frame").scrollIntoViewIfNeeded();
    await mobile.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:60000});
    const mobileDiagnostic=await mobile.evaluate(()=>{
      const frame=document.querySelector("#circuit-frame");
      const scroll=document.querySelector(".circuit-frame-scroll");
      const api=frame?.contentWindow?.CircuitJS1;
      const tags=api?Array.from(new DOMParser().parseFromString(
        api.exportCircuit(),"application/xml").querySelectorAll("WattmeterTrue")):[];
      return {viewport:window.innerWidth,frameWidth:frame?.clientWidth,
        scrollWidth:scroll?.scrollWidth,clientWidth:scroll?.clientWidth,
        loaded:!!api,masks:tags.map(x=>x.getAttribute("labPowerMask")),
        startup:frame?.getAttribute("loading"),src:frame?.getAttribute("src"),
        frameReady:frame?.contentDocument?.readyState,
        frameTitle:frame?.contentDocument?.title,
        frameBody:frame?.contentDocument?.body?.textContent?.slice(0,100),
        scripts:frame?.contentDocument?.querySelectorAll("script").length};
    });
    console.log("Diagnóstico de CircuitJS incrustado en móvil",mobileDiagnostic);
    await mobile.waitForFunction(()=>{
      const f=document.querySelector("#circuit-frame"),s=document.querySelector(".circuit-frame-scroll");
      const api=f?.contentWindow?.CircuitJS1;
      if(!api || !s || f.offsetWidth<780 || s.scrollWidth<=s.clientWidth)return false;
      const doc=new DOMParser().parseFromString(api.exportCircuit(),"application/xml");
      const tags=Array.from(doc.querySelectorAll("WattmeterTrue"));
      return tags.length===2 && tags.every(el=>el.getAttribute("labPowerMask")==="7");
    },null,{timeout:45000});
    try {
      await mobile.waitForFunction(()=>{
        const labels=document.querySelector("#circuit-frame")?.contentWindow?.__labWattPaint||[];
        return ["P ","Q ","S "].every(p=>labels.some(t=>t.startsWith(p))) &&
          labels.some(t=>t.startsWith("Q ")&&!t.includes("..."));
      },null,{timeout:15000});
    } catch(error) {
      const diagnosis=await mobile.evaluate(()=>{
        const w=document.querySelector("#circuit-frame")?.contentWindow;
        const sim=w?.CircuitJS1;
        return {running:sim?.isRunning?.(),time:sim?.getTime?.(),timestep:sim?.getTimeStep?.(),
          drawn:(w?.__labWattPaint||[]).slice(-20),
          ready:w?.document?.readyState,
          frameInnerWidth:w?.innerWidth,frameInnerHeight:w?.innerHeight,
          canvasCount:w?.document?.querySelectorAll("canvas").length,
          bodyVisibility:w?.document?.visibilityState};
      });
      console.error("Diagnóstico del pintado móvil tras inicializar",diagnosis);
      throw error;
    }
    console.log("Móvil 390 px: vista incrustada con desplazamiento y P/Q/S dibujadas");
  } finally { await mobile.close(); }


} finally {
  await browser.close();
}

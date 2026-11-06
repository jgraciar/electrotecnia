import assert from "node:assert/strict";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true});
try {
  const page=await browser.newPage({viewport:{width:1440,height:950}});
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  await page.addInitScript(()=>localStorage.setItem("labStartConfigured","1"));
  await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
  await page.locator('button[data-mode="falstad"]').click();
  await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
  await page.waitForFunction(()=>{
    const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    return !!sim?.getElements && !!sim?.importCircuit && sim.getTime()>0.03;
  },null,{timeout:90000});
  const menu=await page.evaluate(()=>{
    const doc=document.querySelector("#circuit-frame")?.contentDocument;
    return Array.from(doc?.querySelectorAll(".itemLabel")??[])
      .some(e=>e.textContent?.includes("Carga no lineal: puente rectificador con filtro C"));
  });
  assert(menu,"La carga no lineal debe figurar en el menú de pasivos");
  const xml='<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="20" mts="5e-11">'+
    '<v x="80 304 80 448" f="0" wf="1" fr="50" maxv="14.142135623730951"/>'+
    '<g x="80 448 80 480" f="0"/>'+
    '<w x="80 304 256 304" f="0"/>'+
    '<FilteredBridge x="256 304 352 304" f="0" r="200" c="0.002"/>'+
    '<w x="352 304 352 448" f="0"/>'+
    '<w x="352 448 80 448" f="0"/></cir>';
  const result=await page.evaluate(xml=>window.LabCircuit.importNativeCircuit("Puente filtrado",xml),xml);
  assert(result?.ok && result?.simulated,"Error al importar puente filtrado: "+JSON.stringify(result));
  await page.waitForFunction(()=>{
    const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
    return sim?.getTime()>0.05 && Array.from(sim.getElements()).some(e=>e.getType()==="FilteredBridgeElm");
  },null,{timeout:60000});
  const check=await page.evaluate(()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const elm=Array.from(sim.getElements()).find(e=>e.getType()==="FilteredBridgeElm");
    const tag=new DOMParser().parseFromString(sim.exportCircuit(),"application/xml").querySelector("FilteredBridge");
    return {posts:elm?.getPostCount(),r:tag?.getAttribute("r"),c:tag?.getAttribute("c"),
      current:elm?.getCurrent(),time:sim.getTime()};
  });
  assert.equal(check.posts,2);
  assert.equal(check.r,"200");
  assert.equal(check.c,"0.002");
  // La exportación XML debe permitir recuperar el mismo elemento sin perder
  // los valores físicos, el tipo ni los dos terminales de conexión.
  const roundtrip=await page.evaluate(()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const saved=sim.exportCircuit();
    sim.importCircuit(saved);
    const elm=Array.from(sim.getElements()).find(e=>e.getType()==="FilteredBridgeElm");
    const xml2=sim.exportCircuit();
    const tag=new DOMParser().parseFromString(xml2,"application/xml").querySelector("FilteredBridge");
    return {count:Array.from(sim.getElements()).filter(e=>e.getType()==="FilteredBridgeElm").length,
      posts:elm?.getPostCount(),r:tag?.getAttribute("r"),c:tag?.getAttribute("c")};
  });
  assert.deepEqual(roundtrip,{count:1,posts:2,r:"200",c:"0.002"},
    "El puente debe conservar su topología y parámetros al reimportar XML");
  assert(Number.isFinite(check.current),"La corriente de entrada debe ser finita");
  // Comprobar la respuesta temporal del elemento real, no solo su presencia.
  // Capturar varias ventanas de tiempo de simulación con el solver en marcha.
  const wave=await page.evaluate(async()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const samples=[];
    for(let k=0;k<160;k++){
      await new Promise(resolve=>setTimeout(resolve,12));
      const elm=Array.from(sim.getElements()).find(e=>e.getType()==="FilteredBridgeElm");
      samples.push({t:sim.getTime(),i:elm.getCurrent()});
    }
    return samples;
  });
  assert(wave.every(x=>Number.isFinite(x.t)&&Number.isFinite(x.i)),
    "La evolución temporal debe ser finita");
  assert(wave.at(-1).t>wave[0].t+0.02,
    "La simulación debe avanzar al menos un periodo de 50 Hz");
  const peak=Math.max(...wave.map(x=>Math.abs(x.i)));
  assert(peak>1e-6,"El puente debe absorber corriente de la fuente");
  console.log("Puente real: corriente máxima observada",peak,"A; intervalo",
    wave.at(-1).t-wave[0].t,"s");
  // Medición de magnitudes de entrada del solver real.
  // Integración ponderada por el tiempo simulado, nunca por el reloj del navegador.
  const inputPower=await page.evaluate(async()=>{
    const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
    const measurements=[];
    const initialTime=sim.getTime();
    for(let k=0;k<1200;k++){
      await new Promise(resolve=>setTimeout(resolve,12));
      const bridge=Array.from(sim.getElements()).find(e=>e.getType()==="FilteredBridgeElm");
      measurements.push({t:sim.getTime(),u:bridge.getVoltageDiff(),i:bridge.getCurrent()});
      if(sim.getTime()-initialTime>=0.12)break;
    }
    let duration=0,u2=0,i2=0,ui=0,valid=0;
    for(let k=1;k<measurements.length;k++){
      const a=measurements[k-1],b=measurements[k],dt=b.t-a.t;
      if(!(dt>0)||!Number.isFinite(dt))continue;
      if(![a.u,a.i,b.u,b.i].every(Number.isFinite))continue;
      duration+=dt;
      u2+=dt*(a.u*a.u+b.u*b.u)/2;
      i2+=dt*(a.i*a.i+b.i*b.i)/2;
      ui+=dt*(a.u*a.i+b.u*b.i)/2;
      valid++;
    }
    return {duration,valid,urms:Math.sqrt(u2/duration),
      irms:Math.sqrt(i2/duration),P:ui/duration,
      S:Math.sqrt(u2*i2)/duration,
      pf:ui/Math.sqrt(u2*i2)};
  });
  console.log("Diagnóstico adquisición de potencia:",inputPower);
  assert(inputPower.duration>0.08&&inputPower.valid>20,
    "No hay suficientes muestras temporales válidas para calcular potencias");
  assert(Object.values(inputPower).every(Number.isFinite),
    "Las potencias del elemento real deben ser finitas");
  assert(inputPower.urms>1&&inputPower.irms>1e-6,
    "La fuente y el rectificador deben presentar valores RMS no nulos");
  assert(Math.abs(inputPower.P)<=inputPower.S*(1+1e-8),
    "Debe cumplirse |P| <= S");
  assert(Math.abs(inputPower.pf)<=1+1e-8,
    "El factor de potencia real debe estar entre -1 y 1");
  console.log("Medición temporal del rectificador real (muestreo no uniforme):",
    inputPower);
  // La THD exige una adquisición uniforme en tiempo simulado;
  // no se calcula mediante el muestreo asíncrono anterior.
  // Regresión: varios valores de R y C y reinicializaciones sucesivas.
  // Se comprueba el motor real, no solo el modelo matemático de referencia.
  for(const [resistance,capacitance] of [[100,0.0001],[200,0.002],[1000,0.00047],[50,0.00001]]){
    const circuit=xml.replace('r="200" c="0.002"',
      `r="${resistance}" c="${capacitance}"`);
    const imported=await page.evaluate(source=>
      window.LabCircuit.importNativeCircuit("Estrés R-C",source),circuit);
    assert(imported?.ok&&imported?.simulated,
      `No se pudo importar R=${resistance} C=${capacitance}`);
    await page.waitForFunction(()=>{
      const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
      return sim?.getTime()>0.025;
    },null,{timeout:60000});
    const actual=await page.evaluate(()=>{
      const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
      const bridge=Array.from(sim.getElements()).find(e=>e.getType()==="FilteredBridgeElm");
      const saved=sim.exportCircuit();
      const tag=new DOMParser().parseFromString(saved,"application/xml")
        .querySelector("FilteredBridge");
      return {count:Array.from(sim.getElements()).filter(e=>e.getType()==="FilteredBridgeElm").length,
        current:bridge?.getCurrent(),r:Number(tag?.getAttribute("r")),
        c:Number(tag?.getAttribute("c")),time:sim.getTime()};
    });
    assert.equal(actual.count,1,"No debe duplicarse el puente");
    assert.equal(actual.r,resistance);
    assert.equal(actual.c,capacitance);
    assert(Number.isFinite(actual.current)&&Number.isFinite(actual.time),
      "Corriente o tiempo no finitos después de cambiar R y C");
  }
  console.log("OK: cuatro reinicializaciones y cambios de R-C en CircuitJS");
  assert.equal(errors.length,0,"Errores JavaScript: "+errors.join("; "));
  console.log("OK: menú, importación, dos bornes, XML y corriente finita",check);
} finally {
  await browser.close();
}

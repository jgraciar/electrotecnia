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
  assert.equal(errors.length,0,"Errores JavaScript: "+errors.join("; "));
  console.log("OK: menú, importación, dos bornes, XML y corriente finita",check);
} finally {
  await browser.close();
}

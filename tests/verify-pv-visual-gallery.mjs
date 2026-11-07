import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {chromium} from "playwright";

// Cada supuesto del catálogo público debe tener vatímetro eléctrico real
// en la acometida (M-L en serie, C-V entre fase y N).
// Magnitudes previstas por vatímetro, W y VAr: se contrastan con el solver,
// no únicamente con la existencia de etiquetas XML.
const mono=[
 [0,350],[-2700,350],[1000,500],[0,-1500],
 [1000,-2500],[0,-2500],[-1000,-2500]
];
const tri=[
 ...Array(3).fill([-25000/3,12500/3]),
 ...Array(3).fill([0,12500/3]),
 ...Array(3).fill([-5000/3,25000/3]),
 ...Array(3).fill([0,-15000/3]),
 ...Array(3).fill([0,-12500/3]),
 ...Array(3).fill([-4000/3,-9500/3]),
 [-1300,0],[0,0],[1300,0]
];
const variants=[
 ["autoconsumo-monofasica-vatimetros.xml",mono],
 ["autoconsumo-trifasica-vatimetros.xml",tri],
 ["autoconsumo-galeria-vatimetros.xml",[...mono,...tri]]
];
// La compilacion minifica los nombres internos de campos de WattmeterTrueElm.
// Se comprueba su API publica (getInfo), que coincide con las lecturas visibles.
// Interpretar correctamente W, kW, VAr, kVAr, VA y kVA.
function readPower(info,prefix,unit){
 const line=info.find(x=>typeof x==="string"&&x.startsWith(prefix));
 assert(line,"Lectura "+prefix+" ausente: "+JSON.stringify(info));
 const raw=line.slice(prefix.length).trim();
 const match=raw.match(/^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+)(?:[Ee][+-]?\d+)?)\s*([pnumµμkMGT]?)((?:W|VAr|VA))$/);
 assert(match&&match[3]===unit,"Lectura incorrecta "+prefix+raw);
 const multiplier={"":1,p:1e-12,n:1e-9,u:1e-6,"µ":1e-6,"μ":1e-6,m:1e-3,k:1e3,M:1e6,G:1e9,T:1e12};
 return Number(match[1].replace(",","."))*multiplier[match[2]];
}
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:950}});
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
 for(const [filename,expected] of variants){
  const xml=await readFile(new URL("./fixtures/"+filename,import.meta.url),"utf8");
  const expectedPanels=filename.includes("galeria")?14:7;
  assert.equal((xml.match(/<WattmeterTrue /g)||[]).length,expected.length);
  assert.equal((xml.match(/<PVInverter /g)||[]).length,expected.length);
  assert.equal((xml.match(/RED esperada/g)||[]).length,expectedPanels);
  assert(xml.includes('labPowerMask="7"'),"Falta mostrar P, Q y S");
  const imported=await page.evaluate(
   x=>window.LabCircuit.importNativeCircuit(x.name,x.xml),
   {name:filename,xml});
  assert(imported?.ok,"XML rechazado: "+filename+" "+JSON.stringify(imported));
  await page.waitForFunction(count=>{
   const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
   return sim?.getTime()>0.16&&
    Array.from(sim.getElements()).filter(e=>e.getType()==="WattmeterTrueElm").length===count;
  },expected.length,{timeout:120000});
  const measured=await page.evaluate(()=>{
   const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
   const elems=Array.from(sim.getElements());
   const meters=elems.filter(e=>e.getType()==="WattmeterTrueElm");
   const pv=elems.filter(e=>e.getType()==="PVInverterElm");
   const info=meters.map(m=>m.getInfo());
   const exported=sim.exportCircuit();
   const doc=new DOMParser().parseFromString(exported,"application/xml");
   return {time:sim.getTime(),count:meters.length,pvCount:pv.length,
    info,
    xmlMeterCount:doc.querySelectorAll("WattmeterTrue").length,
    mask:Array.from(doc.querySelectorAll("WattmeterTrue")).map(e=>e.getAttribute("labPowerMask"))
   };
  });
  assert.equal(measured.count,expected.length,filename);
  assert.equal(measured.pvCount,expected.length,filename);
  assert.equal(measured.xmlMeterCount,expected.length,filename);
  assert(measured.mask.every(m=>m==="7"),"No se conservan P/Q/S al importar/exportar");
  for(let i=0;i<expected.length;i++){
   const info=measured.info[i];
   const p=readPower(info,"P = ","W");
   const q=readPower(info,"Q (fundamental) = ","VAr");
   const s=readPower(info,"S = ","VA");
   assert([p,q,s].every(Number.isFinite),
    filename+" vatímetro "+i+" magnitud no finita");
   assert(info.some(x=>x.startsWith("P = ")),filename+" vatímetro "+i+" no muestra P");
   assert(info.some(x=>x.startsWith("Q (fundamental) = ")),
    filename+" vatímetro "+i+" no muestra Q");
   assert(info.some(x=>x.startsWith("S = ")),
    filename+" vatímetro "+i+" no muestra S");
   console.log("MEDIDA VATIMETRO",filename,i,
    JSON.stringify({p,q,s,raw:info}));
   const [expectedP,expectedQ]=expected[i];
   const pTol=Math.max(120,Math.abs(expectedP)*0.09);
   const qTol=Math.max(150,Math.abs(expectedQ)*0.12);
   assert(Math.abs(p-expectedP)<pTol,
    filename+" W"+i+" P incorrecta "+p+" frente a "+expectedP);
   assert(Math.abs(q-expectedQ)<qTol,
    filename+" W"+i+" Q incorrecta "+q+" frente a "+expectedQ);
   assert(s+1e-6>=Math.hypot(p,q)*0.99,
    filename+" W"+i+" potencia aparente incoherente");
  }
  console.log("OK: catálogo",filename,"vatímetros",expected.length,
   "P/Q/S físicas contrastadas en CircuitJS");
 }
 assert.deepEqual(errors,[],"Errores de JavaScript en el navegador");
}finally{await browser.close();}

import assert from "node:assert/strict";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true});
const cases=[
 {browser:"es-ES",mode:"auto",saved:null,expected:"es",
  input:"Entradas y fuentes",passive:"Componentes pasivos",
  element:"Inversor fotovoltaico (CA)"},
 {browser:"es-ES",mode:"manual",saved:"en",expected:"en",
  input:"Inputs and Sources",passive:"Passive Components",
  element:"PV inverter (AC)"},
 {browser:"es-ES",mode:"manual",saved:"fr",expected:"fr",
  input:"Entrées et sources",passive:"Composants passifs",
  element:"Onduleur photovoltaïque (CA)"},
 {browser:"en-US",mode:"manual",saved:"de",expected:"de",
  input:"Eingänge und Quellen",passive:"Passive Bauelemente",
  element:"PV-Wechselrichter (AC)"},
 {browser:"en-US",mode:"manual",saved:"nl",expected:"nl",
  input:"Ingangen en bronnen",passive:"Passieve componenten",
  element:"PV-omvormer (AC)"}
];
try{
 for(const c of cases){
  const context=await browser.newContext({locale:c.browser,
   viewport:{width:1380,height:900}});
  try{
   const page=await context.newPage();
   const errors=[];
   page.on("pageerror",error=>errors.push(error.message));
   await page.addInitScript((pref)=>{
    localStorage.clear();
    localStorage.setItem("labStartConfigured","1");
    if(pref.mode==="manual"){
     localStorage.setItem("labLanguageMode","manual");
     localStorage.setItem("language",pref.saved);
    }else{
     localStorage.setItem("labLanguageMode","auto");
    }
   },{mode:c.mode,saved:c.saved});
   await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
   await page.locator('button[data-mode="falstad"]').click();
   await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),
    null,{timeout:150000});
   await page.waitForFunction(()=>{
    const d=document.querySelector("#circuit-frame")?.contentDocument;
    return !!d?.querySelectorAll(".itemLabel")?.length;
   },null,{timeout:90000});
   const current=await page.evaluate(()=>{
    const doc=document.querySelector("#circuit-frame").contentDocument;
    const headings=[...doc.querySelectorAll("li.hasSubmenu")].map(el=>
     [...el.childNodes].filter(n=>n.nodeType===Node.TEXT_NODE)
      .map(n=>n.textContent).join("").trim());
    const labels=[...doc.querySelectorAll(".itemLabel")]
     .map(el=>el.textContent?.trim());
    return {language:localStorage.getItem("language"),headings,labels};
   });
   console.log("Idioma CircuitJS",c.browser,c.mode,c.saved,
    {active:current.language,
     input:current.headings.find(h=>h.includes(c.input)),
     passive:current.headings.find(h=>h.includes(c.passive)),
     pv:current.labels.find(h=>h.includes(c.element))});
   assert.equal(current.language,c.expected,
    "Idioma del navegador o elección manual incorrecta");
   assert(current.headings.some(x=>x.includes(c.input)),
    "Submenú Entradas y fuentes sin traducir: "+c.expected);
   assert(current.headings.some(x=>x.includes(c.passive)),
    "Submenú Componentes pasivos sin traducir: "+c.expected);
   assert(current.labels.some(x=>x.includes(c.element)),
    "Inversor sin traducir: "+c.expected);
   assert.deepEqual(errors,[],"Errores JS para "+c.expected);
  }finally{await context.close();}
 }
 console.log("OK: español automático y selección manual en inglés, francés, alemán y neerlandés");
}finally{await browser.close();}

import assert from "node:assert/strict";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true});
const cases=[
 {browser:"es-ES",mode:"auto",saved:null,expected:"es",
  input:"Entradas y fuentes",passive:"Componentes pasivos",blocks:"Bloques funcionales activos",
  element:"Inversor fotovoltaico FV (CA)"},
 {browser:"es-ES",mode:"manual",saved:"en",expected:"en",
  input:"Inputs and Sources",passive:"Passive Components",blocks:"Active Building Blocks",
  element:"PV inverter (AC)"},
 {browser:"es-ES",mode:"manual",saved:"fr",expected:"fr",
  input:"Entrées et sources",passive:"Composants passifs",blocks:"Blocs fonctionnels actifs",
  element:"Onduleur photovoltaïque (CA)"},
 {browser:"en-US",mode:"manual",saved:"de",expected:"de",
  input:"Eingänge und Quellen",passive:"Passive Bauelemente",blocks:"Aktive Funktionsblöcke",
  element:"PV-Wechselrichter (AC)"},
 {browser:"es-ES",mode:"manual",saved:"it",expected:"it",
  input:"Ingressi e sorgenti",passive:"Componenti passivi",
  blocks:"Blocchi funzionali attivi",
  element:"Inverter fotovoltaico (CA)"},
 {browser:"es-ES",mode:"manual",saved:"pt",expected:"pt",
  input:"Entradas e fontes",passive:"Componentes passivos",
  blocks:"Blocos funcionais ativos",
  element:"Inversor fotovoltaico (CA)"},
 {browser:"es-ES",mode:"manual",saved:"pl",expected:"pl",
  input:"Wejścia i źródła",passive:"Elementy pasywne",
  blocks:"Aktywne bloki funkcjonalne",
  element:"Falownik fotowoltaiczny (AC)"},
 {browser:"cs-CZ",mode:"auto",saved:null,expected:"csx",
  input:"Vstupy a zdroje",passive:"Pasivní součástky",
  blocks:"Aktivní funkční bloky",element:"Fotovoltaický střídač (AC)"},
 {browser:"en-US",mode:"manual",saved:"da",expected:"da",
  input:"Indgange og kilder",passive:"Passive komponenter",
  blocks:"Aktive funktionsblokke",element:"Solcelleinverter (AC)"},
 {browser:"en-US",mode:"manual",saved:"fi",expected:"fi",
  input:"Tulot ja lähteet",passive:"Passiiviset komponentit",
  blocks:"Aktiiviset toimilohkot",element:"Aurinkosähköinvertteri (AC)"},
 {browser:"en-US",mode:"manual",saved:"nb",expected:"nb",
  input:"Innganger og kilder",passive:"Passive komponenter",
  blocks:"Aktive funksjonsblokker",element:"Solcellevekselretter (AC)"},
 {browser:"en-US",mode:"manual",saved:"ru",expected:"ru",
  input:"Входы и источники",passive:"Пассивные компоненты",
  blocks:"Активные функциональные блоки",element:"Фотоэлектрический инвертор (переменный ток)"},
 {browser:"en-US",mode:"manual",saved:"zh",expected:"zh",
  input:"输入与电源",passive:"无源元件",
  blocks:"有源功能模块",element:"光伏逆变器（交流）"},
 {browser:"zh-TW",mode:"auto",saved:null,expected:"zh-tw",
  input:"輸入與電源",passive:"被動元件",
  blocks:"主動功能模組",element:"太陽光電逆變器（交流）"},
 {browser:"en-US",mode:"manual",saved:"ja",expected:"ja",
  input:"入力と電源",passive:"受動部品",
  blocks:"能動機能ブロック",element:"太陽光発電インバーター（交流）"},
 {browser:"ko-KR",mode:"auto",saved:null,expected:"kr",
  input:"입력 및 전원",passive:"수동 소자",
  blocks:"능동 기능 블록",element:"태양광 인버터 (교류)"},
 {browser:"sv-SE",mode:"auto",saved:null,expected:"sv",
  input:"Ingångar och källor",passive:"Passiva komponenter",
  blocks:"Aktiva funktionsblock",element:"Solcellsväxelriktare (AC)"},
 {browser:"nl-NL",mode:"auto",saved:null,expected:"nl",
  input:"Ingangen en bronnen",passive:"Passieve componenten",
  blocks:"Actieve bouwblokken",element:"PV-omvormer (AC)"},
 {browser:"ca-ES",mode:"auto",saved:null,expected:"ca",
  input:"Entrades i fonts",passive:"Components passius",
  blocks:"Blocs funcionals actius",element:"Inversor fotovoltaic (CA)"},
 {browser:"es-ES",mode:"manual",saved:"ca-es-valencia",expected:"ca-es-valencia",
  input:"Entrades i fonts",passive:"Components passius",
  blocks:"Blocs funcionals actius",element:"Inversor fotovoltaic (CA)"},
 {browser:"gl-ES",mode:"auto",saved:null,expected:"gl",
  input:"Entradas e fontes",passive:"Compoñentes pasivos",
  blocks:"Bloques funcionais activos",element:"Inversor fotovoltaico (CA)"},
 {browser:"eu-ES",mode:"auto",saved:null,expected:"eu",
  input:"Sarrerak eta iturriak",passive:"Osagai pasiboak",
  blocks:"Bloke funtzional aktiboak",element:"Inbertsore fotovoltaikoa (AC)"}
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
    // La misma página contiene CircuitJS en un iframe del mismo origen:
    // preparar las preferencias SOLO en el documento principal para que
    // el iframe herede el idioma, en lugar de borrarlo en su arranque.
    if(window.top!==window)return;
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
   const htmlLanguage=await page.evaluate(()=>document.documentElement.lang);
   const expectedHtmlLanguage={csx:"cs",kr:"ko",zh:"zh-Hans","zh-tw":"zh-Hant"}[c.expected]||c.expected;
   assert.equal(htmlLanguage,expectedHtmlLanguage,
    "Atributo lang incorrecto para lectores de pantalla: "+c.expected);
   assert(current.headings.some(x=>x.includes(c.input)),
    "Submenú Entradas y fuentes sin traducir: "+c.expected);
   assert(current.headings.some(x=>x.includes(c.passive)),
    "Submenú Componentes pasivos sin traducir: "+c.expected);
   assert(current.headings.some(x=>x.includes(c.blocks)),
    "Submenú Bloques activos sin traducir: "+c.expected);
   assert(current.labels.some(x=>x.includes(c.element)),
    "Inversor sin traducir: "+c.expected);
   if(c.expected==="es"||c.expected==="ca-es-valencia"){
    const expected=c.expected==="es"
     ?["Fuente de tensión controlada (2 terminales)","Fuente de corriente controlada (2 terminales)",
       "Transformador","Punto de prueba","Vatímetro"]
     :["Font de tensió controlada (2 terminals)","Font d'intensitat controlada (2 terminals)",
       "Transformador","Punt de prova","Vatímetre"];
    for(const value of expected)
     assert(current.labels.some(x=>x===value),
      "Elemento del menú sin traducir: "+c.expected+"/"+value);
    const menuText=await page.evaluate(()=>{
     const doc=document.querySelector("#circuit-frame").contentDocument;
     return [...doc.querySelectorAll("li")].map(x=>x.textContent?.trim());
    });
    for(const english of ["Export As Image...","Export As SVG...","Find Component/Command..."]){
     assert(!menuText.some(x=>x===english),
      "Comando del menú aún en inglés: "+english);
    }
   }
   assert.deepEqual(errors,[],"Errores JS para "+c.expected);
  }finally{await context.close();}
 }
 console.log("OK: idiomas originales de CircuitJS; detección automática y selección manual");
}finally{await browser.close();}

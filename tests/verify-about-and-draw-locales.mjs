// Pruebas de la ventana «Acerca de» y de los nombres de Dibujo de CircuitJS.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {runInNewContext} from "node:vm";
import {labLanguageCodes,labTranslation} from "../scripts/LabTranslations.ts";
import {circuitJsDrawLabel} from "../scripts/CircuitJsDrawLabels.ts";
const dir=process.argv[2];
if(!dir)throw Error("Uso: verify-about-and-draw-locales.mjs <ts-dir>");
const menus=readFileSync(join(dir,"Menus.ts"),"utf8");
const aboutBox=readFileSync(join(dir,"AboutBox.ts"),"utf8");
const editDialog=readFileSync(join(dir,"EditDialog.ts"),"utf8");
const options=readFileSync(join(dir,"EditOptions.ts"),"utf8");
const aboutHtml=readFileSync(join(dir,"circuitjs/about.html"),"utf8");
for(const key of ["European number format","Anglo-American number format","Custom number format"])
 assert(editDialog.includes('Locale.LS("'+key+'")'),"Ejemplo numérico sin localizar: "+key);
for(const key of ["Decimal digits: integer from 0 to 10","Decimal and grouping separators must differ"])
 assert(options.includes('Locale.LS("'+key+'")'),"Error de formato sin localizar: "+key);

const script=readFileSync(new URL("../scripts/circuitjs-about-i18n.js",import.meta.url),"utf8");
const legalScript=readFileSync(new URL("../scripts/circuitjs-about-legal.js",import.meta.url),"utf8");
assert(menus.includes('import { circuitJsDrawLabel } from "./CircuitJsDrawLabels"'));
assert(menus.includes('circuitJsDrawLabel(items[i], Locale.LS(items[i]), Locale.activeLanguage)'));
assert(aboutBox.includes("encodeURIComponent(Locale.activeLanguage)"));
assert(aboutBox.includes('okButton.textContent = Locale.LS("OK")'));
assert(aboutHtml.includes('new URLSearchParams(location.search)'));
assert(aboutHtml.includes("Paul Falstad") && aboutHtml.includes("Iain Sharp"));
assert(aboutHtml.includes("GNU General Public License"));
assert(aboutHtml.includes("THE UNIVERSITY OF CALIFORNIA"));
// Catálogos originales: prefijo, sufijo y casos sin verbo de inserción.
for(const [key,translated,language,expected] of [
 ["Add Resistor","Add Resistor","en","Resistor"],
 ["Add Adder","Add Adder","en","Adder"],
 ["Add Resistor","Resistencia","es","Resistencia"],
 ["Add Resistor","Ajouter Résistance","fr","Résistance"],
 ["Add Resistor","Tilføj Resistor","da","Resistor"],
 ["Add Resistor","Widerstand einfügen","de","Widerstand"],
 ["Add Wire","Verbindung einfügen (wire)","de","Verbindung (wire)"],
 ["Add Resistor","Wstaw rezystor","pl","rezystor"],
 ["Add Resistor","Inserir Resistor","pt","Resistor"],
 ["Add Resistor","抵抗器を追加","ja","抵抗器"],
 ["Add Resistor","저항 추가","kr","저항"],
 ["Add Resistor","커패시터 추가 (극성)","kr","커패시터 (극성)"],
 ["Add Custom Logic","カスタムロジック追加","ja","カスタムロジック"],
 ["Add Resistor","加入電阻器","zh-tw","電阻器"],
 ["Add Resistor","添加电阻器","zh","电阻器"],
 ["Añadir impedancia Z (CA, RLC serie)","Añadir impedancia Z (CA, RLC serie)","es","impedancia Z (CA, RLC serie)"],
 ["Añadir impedancia Z (CA, RLC serie)","Afig impedància Z","ca-es-valencia","impedància Z"],
 ["Add Resistor","Добавить резистор","ru","резистор"],
 ["Add Resistor","Voeg toe weerstand","nl","weerstand"]
]){
 assert.equal(circuitJsDrawLabel(key,translated,language),expected,
  "El menú Dibujo conserva verbo de inserción: "+language+" "+translated);
}
assert.equal(circuitJsDrawLabel("Adder","Adder","en"),"Adder");
// Auditar los 147 componentes de Dibujo contra los catálogos oficiales,
// además de los elementos desarrollados para el laboratorio.
const menuKeys=[...new Set([...menus.matchAll(/"(Add [^"]+)"\s*,\s*"[^"]*Elm(?:[:][^"]*)?"/g)]
 .map(m=>m[1]))];
assert(menuKeys.length>=147,"Faltan comandos de los submenús de Dibujo");
const nativeCodes=["csx","da","de","es","fi","fr","it","ja","kr","nb","pl","pt","ru","zh","zh-tw"];
const verbs={
 csx:/^Přidat |^Vložit /i,da:/^Tilføj /i,de:/einfügen|^Hinzufügen /i,
 es:/^Añadir |^Agregar /i,fi:/^Lisää /i,fr:/^Ajouter /i,
 it:/^Aggiungi |^Inserisci /i,ja:/追加|を挿入/i,kr:/추가/i,
 nb:/^Legg til /i,pl:/^Wstaw |^Dodaj /i,pt:/^Inserir|^Adicionar /i,
 ru:/^Добавить /i,zh:/^添加|^加入/i,"zh-tw":/^新增|^加入|^添加/i
};
for(const code of nativeCodes){
 const filename=join(dir,"public/locale/locale_"+code+".txt");
 const official=Object.fromEntries([...readFileSync(filename,"utf8")
  .matchAll(/^"([^"]+)"="([^"]*)"$/gm)].map(m=>[m[1],m[2]]));
 for(const key of menuKeys){
  const localized=labTranslation(code,key)??official[key]??key;
  const name=circuitJsDrawLabel(key,localized,code);
  assert(name && !verbs[code].test(name),"Dibujo mantiene verbo en "+code+": "+key+" -> "+name);
 }
}
for(const language of labLanguageCodes){
 const custom="Añadir impedancia Z (CA, RLC serie)";
 const translated=labTranslation(language,custom)??custom;
 const name=circuitJsDrawLabel(custom,translated,language);
 assert(name.trim() && !/^Add |^Añadir |^Afig |^Afegir |^Engadir /i.test(name),
  "Impedancia con prefijo en "+language+": "+name);
}
assert.equal(labTranslation("es","European number format"),"formato europeo");
assert.equal(labTranslation("ca-es-valencia","European number format"),"format europeu");
assert.equal(labTranslation("ca","European Resistors"),"Símbols europeus per a resistències");
assert.equal(labTranslation("gl","European Resistors"),"Símbolos europeos para resistencias");
assert.equal(labTranslation("eu","European Resistors"),"Erresistentzien Europako sinboloak");
for(const code of labLanguageCodes){
 for(const key of ["European number format","Anglo-American number format","Custom number format",
  "Decimal digits: integer from 0 to 10","Decimal and grouping separators must differ"])
  assert(labTranslation(code,key)?.trim(),"Falta formato numérico "+code+" "+key);

 const labels=Array.from({length:16},(_,index)=>{
  const firstChild={nodeType:3,nodeValue:index===0?"Circuit Simulator version ":
   index===4?"Thanks to: Edward Calver for 15 new components": "Original by "};
  return {firstChild,childNodes:[firstChild],textContent:"",
   querySelector:()=>({textContent:"list of authors and licenses"})};
 });
 const dom={
  documentElement:{lang:"en"},
  querySelectorAll:()=>labels
 };
 runInNewContext(script,{
  location:{search:"?lang="+encodeURIComponent(code)},
  navigator:{language:"en",languages:["en"]},
  document:dom,
  Node:{TEXT_NODE:3},
  URLSearchParams
 });
 if(code!=="en"){
  runInNewContext(legalScript,{
   location:{search:"?lang="+encodeURIComponent(code)},
   navigator:{language:"en",languages:["en"]},
   document:dom,
   URLSearchParams
  });
  if(code!=="es"&&code!=="ca-es-valencia"){
   for(const index of [6,7,11,12,13,15])
    assert(labels[index].textContent.length>(["ja","kr","zh","zh-tw"].includes(code)?25:70),
     "Aviso legal sin traducir en "+code+" párrafo "+index);
   assert(labels[4].textContent.includes("Edward Calver")&&
    labels[4].textContent.includes("Colin Howell")&&
    labels[4].textContent.includes("Pablo Sanz Martin"),
    "Se han perdido las aportaciones del equipo en "+code);
   assert(!/for 15 new components|This program is free software|IN NO EVENT SHALL|THE SOFTWARE IS PROVIDED/.test(
    [labels[4],labels[6],labels[7],labels[11],labels[12],labels[13],labels[15]]
     .map(x=>x.textContent).join(" ")),
    "Créditos o licencia todavía en inglés: "+code);
  }
 }
 if(code==="en"){
  assert.equal(labels[0].childNodes[0].nodeValue,"Circuit Simulator version ");
 }else{
  if(code!=="es" && code!=="ca-es-valencia")
   assert(labels[4].firstChild.nodeValue.includes("Edward Calver"),
    "Se han perdido los créditos al traducir Acerca de: "+code);
  assert.notEqual(labels[0].childNodes[0].nodeValue,"Circuit Simulator version ",code+" About no traducido");
 }
 if(code==="es"||code==="ca-es-valencia"){
  assert(labels[4].textContent.includes("Edward Calver"),"Faltan los créditos: "+code);
  assert(labels[6].textContent.includes(code==="es"?"software libre":"programari lliure"));
  assert(labels[12].textContent.length>100,"Falta el aviso legal traducido: "+code);
 }
}
console.log("OK: ventana Acerca de y textos legales completos en 22 idiomas; créditos íntegros, Dibujo y formatos regionales.");

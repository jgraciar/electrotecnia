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
assert.equal(labTranslation("es","European number format"),"formato europeo");
assert.equal(labTranslation("ca-es-valencia","European number format"),"format europeu");
assert.equal(labTranslation("ca","European Resistors"),"Símbols europeus per a resistències");
assert.equal(labTranslation("gl","European Resistors"),"Símbolos europeos para resistencias");
assert.equal(labTranslation("eu","European Resistors"),"Erresistentzien Europako sinboloak");
for(const code of labLanguageCodes){
 for(const key of ["European number format","Anglo-American number format","Custom number format",
  "Decimal digits: integer from 0 to 10","Decimal and grouping separators must differ"])
  assert(labTranslation(code,key)?.trim(),"Falta formato numérico "+code+" "+key);

 const labels=Array.from({length:16},(_,index)=>({
  childNodes:[{nodeType:3,nodeValue:index===0?"Circuit Simulator version ":"Original by "}],
  textContent:"",querySelector:()=>({textContent:"list of authors and licenses"})
 }));
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
 if(code==="en"){
  assert.equal(labels[0].childNodes[0].nodeValue,"Circuit Simulator version ");
 }else{
  assert.notEqual(labels[0].childNodes[0].nodeValue,"Circuit Simulator version ",code+" About no traducido");
 }
 if(code==="es"||code==="ca-es-valencia"){
  assert(labels[4].textContent.includes("Edward Calver"),"Faltan los créditos: "+code);
  assert(labels[6].textContent.includes(code==="es"?"software libre":"programari lliure"));
  assert(labels[12].textContent.length>100,"Falta el aviso legal traducido: "+code);
 }
}
console.log("OK: ventana Acerca de, 22 códigos de idioma, créditos y licencias en español/valenciano; nombres de Dibujo sin prefijo y formatos regionales.");

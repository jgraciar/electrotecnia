// Cobertura real de los menús de la versión de CircuitJS compilada en Actions.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labTranslation} from "../scripts/LabTranslations.ts";

const tsDir=process.argv[2];
if(!tsDir)throw Error("Uso: verify-interface-menu-coverage.mjs <directorio ts de CircuitJS>");
const source=readFileSync(join(tsDir,"Menus.ts"),"utf8");
const locale=readFileSync(join(tsDir,"public/locale/locale_es.txt"),"utf8");
const catalogue=new Map([...locale.matchAll(/^"(.*?)"="(.*)"$/gm)]
 .map(m=>[m[1],m[2]]));
const components=[...new Set([...source.matchAll(
 /"([^"\n]+)"\s*,\s*"([^"\n]*Elm(?:[:][^"\n]*)?)"/g)].map(m=>m[1]))];
const simple=[
 ...[...source.matchAll(/Locale\.LS\(\s*"([^"]+)"\s*\)/g)].map(m=>m[1]),
 ...[...source.matchAll(/(?:iconHtml|shortcutHtml)\(\s*"[^"]+"\s*,\s*"([^"]+)"/g)].map(m=>m[1]),
 ...[...source.matchAll(/addCheckItem\([^,]+,\s*"([^"]+)"\)/g)].map(m=>m[1]),
 ...["Command Palette","Please select one or more subcircuits.","Are you sure you want to delete "]
];
const keys=[...new Set([...components,...simple])];
const missing=keys.filter(key=>labTranslation("es",key)==null&&!catalogue.has(key));
assert.deepEqual(missing,[],"Menús de CircuitJS sin traducción al español");
assert(components.length>=147,"Menú de componentes incompleto: "+components.length);
for(const key of components){
 const value=labTranslation("ca-es-valencia",key);
 assert(value&&value.trim(),"Falta traducción valenciana de: "+key);
}
for(const key of ["File","Edit","Draw","Options","New Blank Circuit",
 "Export As Image...","Export As SVG...","Find Component/Command...",
 "Command Palette","Show Current","Other Options..."]){
 assert(labTranslation("ca-es-valencia",key),
  "Falta traducción valenciana de menú: "+key);
}
// La traducción manual de CircuitJS debe cubrir los menús originales de cada
// idioma instalado sin degradar sus traducciones oficiales existentes.
const nativeCodes=["csx","da","de","es","fi","fr","it","ja","kr","nb","pl","pt","ru","zh-tw","zh"];
for(const lang of nativeCodes){
 const file=join(tsDir,"public/locale/locale_"+lang+".txt");
 const source=readFileSync(file,"utf8");
 const official=new Map([...source.matchAll(/^"(.*?)"="(.*)"$/gm)]
  .map(m=>[m[1],m[2]]));
 const uncovered=keys.filter(key=>labTranslation(lang,key)==null && !official.has(key));
 assert.deepEqual(uncovered,[],"Menús con textos ingleses al seleccionar "+lang);
 for(const essential of ["Add Controlled Voltage Source (2-terminal)",
    "Add Controlled Current Source (2-terminal)","Find Component/Command...",
    "Command Palette","Please select one or more subcircuits."]){
  const result=labTranslation(lang,essential)??official.get(essential);
  assert(result?.trim(),"Falta término técnico en "+lang+": "+essential);
  assert.notEqual(result,essential,"Etiqueta inglesa sin traducir en "+lang+": "+essential);
 }
}
// La relación de ejemplos llega de setuplist.txt. El archivo del circuito
// permanece en inglés, pero la etiqueta de las 12 fuentes CCS/CVS se traduce.
const exampleLines=readFileSync(join(tsDir,"public/setuplist.txt"),"utf8").split(/\r?\n/);
const expectedExamples=[
 ["cs-resistor.txt","CCS Resistor"],["cs-varyresistor.txt","CCS Varying Resistor"],
 ["cs-opamp.txt","CVS Op-Amp"],["cs-opamprail.txt","VCVS Op-Amp With Rails"],
 ["cs-multiplier.txt","VCVS Multiplier"],["cs-fullrectifier.txt","CVS Full Rectifier"],
 ["cs-ramp.txt","CVS Voltage Ramp"],["cs-currentadder.txt","CCS Current Adder"],
 ["cs-integrator.txt","CVS Integrator"],["cs-diff.txt","CVS Differentiator"],
 ["cs-varinduct.txt","CCS Variable Inductor"],["cs-varicap.txt","CCS Variable Capacitor"]
];
for(const [file,key] of expectedExamples){
 assert(exampleLines.includes(file+" "+key),"Cambia la clave del ejemplo: "+file);
 for(const lang of ["en","es","ca-es-valencia","ca","gl","eu","fr","de","ja","zh"]){
  const label=labTranslation(lang,key);
  assert(label&&label.trim()&& (lang==="en"||label!==key),
   "Ejemplo CCS/CVS sin localizar: "+lang+" "+key);
 }
}
// Auditar todas las entradas de Ejemplos de circuitos. Se usan las claves
// originales del índice: nunca los nombres de archivo traducidos.
const allExampleTitles=[...new Set(exampleLines.filter(line=>/^\S+\.txt /.test(line))
 .map(line=>line.slice(line.indexOf(" ")+1).trim()))];
assert(allExampleTitles.length>=350,
 "El índice de ejemplos está incompleto: "+allExampleTitles.length);
for(const lang of nativeCodes){
 const catalogSource=readFileSync(join(tsDir,"public/locale/locale_"+lang+".txt"),"utf8");
 const official=new Map([...catalogSource.matchAll(/^"(.*?)"="(.*)"$/gm)]
  .map(m=>[m[1],m[2]]));
 const missing=allExampleTitles.filter(key=>labTranslation(lang,key)==null&&!official.has(key));
 assert.deepEqual(missing,[],
  "Ejemplos sin traducción en "+lang+" (cambios en setuplist.txt o catálogos originales)");
}
for(const [lang,key,expected] of [
 ["es","LRC Circuit","Circuito RLC"],
 ["ca","LRC Circuit","Circuit RLC"],
 ["ca-es-valencia","LRC Circuit","Circuit RLC"],
 ["gl","LRC Circuit","Circuíto RLC"],
 ["eu","LRC Circuit","RLC zirkuitua"],
 ["da","Phase-Sequence Network","Fasefølgenetværk"],
 ["kr","Gray Code Counter","그레이 코드 카운터"]
]){
 assert.equal(labTranslation(lang,key),expected,
  "Ejemplo pendiente de localización: "+lang+" / "+key);
}
console.log("OK: "+keys.length+" claves de menús originales con español cubierto; "+
 components.length+" componentes con traducción valenciana y comandos principales comprobados.");

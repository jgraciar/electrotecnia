// Comprobación del catálogo catalán independiente respecto al valenciano.
// Impide que el selector "Català" vuelva a mostrar el respaldo castellano.
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join} from "node:path";
import {labTranslation} from "../scripts/LabTranslations.ts";

const dir=process.argv[2];
if(!dir)throw Error("Uso: verify-catalan-complete.mjs <directorio ts>");
const originalPath=join(dir,"public/locale/locale_ca-es-valencia.txt");
const catalanPath=join(dir,"public/locale/locale_ca.txt");
assert(existsSync(catalanPath),"El catálogo catalán no se ha generado");
function parse(file){
 const entries=[...readFileSync(file,"utf8").matchAll(/^"(.*?)"="(.*)"$/gm)];
 return new Map(entries.map(m=>[m[1],m[2]]));
}
const valencian=parse(originalPath),catalan=parse(catalanPath);
assert(valencian.size>=1700,"No se ha obtenido la base de traducciones técnicas");
assert.equal(catalan.size,valencian.size,"El catálogo catalán ha perdido identificadores");
for(const [key,value] of valencian){
 assert(catalan.has(key),"Falta traducción catalana para: "+key);
 assert(catalan.get(key)?.trim()||!value.trim(),
  "El valor catalán está vacío: "+key);
}
const expected={
 "Add Sliders":"Afegeix controls lliscants",
 "Add Analog Output":"Sortida analògica",
 "Add Logic Output":"Sortida lògica",
 "Add Audio Output":"Sortida d'àudio",
 "Add SPDT Switch":"Commutador unipolar de dues posicions (SPDT)",
 "Add DPDT Switch":"Commutador bipolar de dues posicions (DPDT)",
 "Show Current":"Mostra la intensitat",
 "Change Language":"Canvia l'idioma",
 "Other Options":"Altres opcions",
 "File too large!":"El fitxer és massa gran.",
 "Convergence failed!":"La simulació no convergeix. Comprova les connexions i els valors dels components."
};
for(const [key,text] of Object.entries(expected))
 assert.equal(catalan.get(key),text,"Revisar la traducción al catalán de: "+key);
const differences=[...catalan].filter(([k,v])=>valencian.get(k)!==v);
assert(differences.length>=35,"El catalán no se diferencia del catálogo valenciano");
for(const [key,value] of catalan){
 const words=["eixida","eixides","afig","este","esta","estos","estes","hui","ací","davall"];
 for(const word of words)
  assert(!new RegExp("(?<!\\p{L})"+word+"(?!\\p{L})","iu").test(value),
   "Forma valenciana por revisar en catalán: "+key+" = "+value);
}
for(const key of ["Add Switch","Add SPDT Switch","Add DPDT Switch"]){
 const original=valencian.get(key);
 const result=catalan.get(key);
 for(const symbol of ["SPST","SPDT","DPDT"])
  if(original?.includes(symbol))assert(result?.includes(symbol),
   "No se puede alterar la sigla técnica "+symbol+" de "+key);
}
assert(labTranslation("ca","LRC Circuit")==="Circuit RLC",
 "Se ha perdido la traducción del índice de ejemplos");
const patched=readFileSync(join(dir,"Locale.ts"),"utf8");
assert(patched.includes('const originalLang = ["gl","eu"].includes(lang)?"es":lang;'),
 "CircuitJS aún cargaría el fichero español al elegir catalán");
console.log("OK catalán: "+catalan.size+" entradas conservadas, "+
 differences.length+" adaptaciones específicas y carga autónoma.");

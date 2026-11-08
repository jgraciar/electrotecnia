import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {join} from "node:path";
const dir=process.argv[2];
if(!dir)throw Error("Falta directorio TypeScript de CircuitJS");
const es=join(dir,"public/locale/locale_es.txt");
const va=join(dir,"public/locale/locale_ca-es-valencia.txt");
assert(existsSync(va),"No se ha generado el catálogo valenciano completo");
function parse(file){
 const lines=readFileSync(file,"utf8").split(/\r?\n/);
 return new Map(lines.map(line=>line.match(/^"(.*?)"="(.*)"$/)).filter(Boolean)
  .map(m=>[m[1],m[2]]));
}
const original=parse(es),valencian=parse(va);
assert(original.size>=1600,"Catálogo original inesperadamente corto");
assert(valencian.size>=original.size,"El valenciano debe cubrir las claves originales y los componentes nuevos");
for(const [key,spanish] of original){
 assert(valencian.has(key),"Clave original sin traducción: "+key);
 const target=valencian.get(key);
 assert(target!==undefined&&(target.trim()||spanish.trim()===""),"Traducción vacía: "+key);
}
const essential={
 "Add Voltage Source (2-terminal)":"Font de tensió (2 terminals)",
 "Add Switch":"Interruptor unipolar (SPST)",
 "Add SPDT Switch":"Commutador unipolar de dos posicions (SPDT)",
 "Add DPDT Switch":"Commutador bipolar de dos posicions (DPDT)",
 "Add Analog Switch (SPST)":"Interruptor analògic unipolar (SPST)",
 "Add Analog Switch (SPDT)":"Commutador analògic unipolar de dos posicions (SPDT)",
 "Show Current":"Mostra la intensitat",
 "Change Language":"Canvia l'idioma",
 "Other Options":"Altres opcions",
 "Add Sliders":"Afig controls lliscants",
 "New Slider":"Control lliscant nou",
 "Save Subcircuits":"Guarda els subcircuits",
 "Audio data is not ready yet.  Increase simulation speed to make data ready sooner.":"Les dades d'àudio encara no estan preparades. Augmenta la velocitat de simulació."
};
for(const [key,expected] of Object.entries(essential))
 assert.equal(valencian.get(key),expected,"Revisar el text valencià: "+key);
const unchanged=[...original].filter(([key,spanish])=>spanish===valencian.get(key));
console.log("OK: "+valencian.size+" identificadores traducidos/completados para Valenciano.");
console.log("Entradas idénticas al catálogo castellano (símbolos, siglas, cognados o pendiente de revisión): "+unchanged.length);

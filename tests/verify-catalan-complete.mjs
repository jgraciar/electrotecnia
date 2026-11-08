import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
const dir=process.argv[2];if(!dir)throw Error("Falta directorio de CircuitJS");
const read=lang=>new Map([...readFileSync(join(dir,"public/locale/locale_"+lang+".txt"),"utf8")
 .matchAll(/^"(.*?)"="(.*)"$/gm)].map(m=>[m[1],m[2]]));
const valencian=read("ca-es-valencia"),catalan=read("ca");
assert(valencian.size>=1692);
assert.equal(catalan.size,valencian.size,"El catálogo catalán debe mantener las claves originales");
for(const [key,value] of valencian)
 assert(catalan.get(key)?.trim()||value.trim()==="","Falta etiqueta en catalán: "+key);
const reviewed={
 "Add SPDT Switch":"Commutador unipolar de dues posicions (SPDT)",
 "Outputs and Labels":"Sortides i etiquetes",
 "Add Switch":"Interruptor unipolar (SPST)"
};
for(const [key,value] of Object.entries(reviewed))
 assert.equal(catalan.get(key),value,"Variantes catalanas mal convertidas: "+key);
console.log("OK: catálogo catalán independiente con "+catalan.size+" claves de CircuitJS.");

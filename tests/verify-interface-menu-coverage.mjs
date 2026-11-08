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
console.log("OK: "+keys.length+" claves de menús originales con español cubierto; "+
 components.length+" componentes con traducción valenciana y comandos principales comprobados.");

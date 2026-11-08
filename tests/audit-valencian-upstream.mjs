// Audita todas las etiquetas localizables en los componentes TypeScript de CircuitJS.
import assert from "node:assert/strict";
import {readFileSync,readdirSync} from "node:fs";
import {join} from "node:path";
const dir=process.argv[2];if(!dir)throw Error("Falta el directorio TypeScript");
const locale=readFileSync(join(dir,"public/locale/locale_ca-es-valencia.txt"),"utf8");
const translated=new Map([...locale.matchAll(/^"(.*?)"="(.*)"$/gm)].map(m=>[m[1],m[2]]));
const intentional=new Set([
 "Čeština","Dansk","Deutsch","English","Español","Suomi","Français",
 "Italiano","Norsk bokmål","Polski","Português","Русский",
 "中文 (中国大陆)","中文 (台湾)","日本語","한국어",
 "Català","Valencià","Galego","Euskara","Nederlands","Svenska","export"
]);
const patterns=[
 /Locale\.LS\(\s*["']([^"'\n]+)["']\s*\)/g,
 /new EditInfo\(\s*["']([^"'\n]+)["']/g,
 /new Checkbox\(\s*["']([^"'\n]+)["']/g,
 /\.choice\.add\(\s*["']([^"'\n]+)["']/g,
];
function files(root){
 return readdirSync(root,{withFileTypes:true}).flatMap(x=>{
  const p=join(root,x.name);
  if(x.isDirectory()&& !["node_modules","dist","old",".git"].includes(x.name))return files(p);
  return x.isFile()&&x.name.endsWith(".ts")&&!x.name.endsWith(".test.ts")&&!x.name.startsWith("LabTranslations")?[p]:[];
 });
}
let scanned=0,seen=0;const missing=[];
for(const p of files(dir)){
 scanned++;
 const contents=readFileSync(p,"utf8");
 for(const re of patterns){
  re.lastIndex=0;
  for(const m of contents.matchAll(re)){
   const key=m[1];if(!key.trim()||key.length<3||/^[\d+\-\s.]+$/.test(key))continue;
   seen++;
   if(!translated.has(key)&&!intentional.has(key))
    missing.push({file:p.slice(dir.length+1),key});
  }
 }
}
const unique=[...new Map(missing.map(x=>[x.file+"/"+x.key,x])).values()];
assert.deepEqual(unique,[],"Nuevas etiquetas de CircuitJS sin valenciano");
assert(scanned>=240,"Solo se han podido comprobar "+scanned+" archivos TypeScript");
console.log("OK: "+scanned+" fuentes TypeScript, "+seen+
 " referencias a etiquetas verificadas; 0 textos estáticos pendientes de valenciano.");

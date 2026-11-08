import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labTranslation} from "../scripts/LabTranslations.ts";
const dir=process.argv[2];if(!dir)throw Error("Falta el directorio TypeScript de CircuitJS");
const text=readFileSync(join(dir,"ImportFromDropboxDialog.ts"),"utf8");
const english=[
 "This site, or your browser doesn't support the Dropbox chooser so you can't pick a file from your dropbox account.",
 "You can open a shared Dropbox file if you have a link. Paste the Dropbox link below..."
];
const localeCodes=["csx","da","de","es","fi","fr","it","ja","kr","nb","pl","pt","ru","zh-tw","zh"];
for(const key of english){
 assert(text.includes("Locale.LS("+JSON.stringify(key)+")"),"Importador Dropbox con texto literal en inglés: "+key);
 for(const lang of localeCodes){
  const own=labTranslation(lang,key);
  const loc=readFileSync(join(dir,"public/locale/locale_"+lang+".txt"),"utf8");
  const official=loc.split(/\r?\n/).find(line=>line.startsWith(JSON.stringify(key)+"="));
  assert(own||official,"Sin traducción Dropbox en "+lang+": "+key);
 }
}
// El castellano es una capa de menús; el valenciano carga su catálogo propio.
const valencian=readFileSync(join(dir,"public/locale/locale_ca-es-valencia.txt"),"utf8");
for(const key of english){
 assert(labTranslation("es",key),"Falta corrección castellana de: "+key);
 assert(valencian.split(/\r?\n/).some(line=>line.startsWith(JSON.stringify(key)+"=")),
  "El catálogo valenciano no incluye el aviso de Dropbox: "+key);
}
console.log("OK: avisos de Dropbox localizados en 15 catálogos originales y valenciano.");

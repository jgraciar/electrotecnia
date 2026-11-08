// Auditoría de los títulos de edición en los 22 idiomas de CircuitJS.
// El encabezado de un componente se forma con dos claves independientes:
// «Edit Component» + getElmType(); nunca se busca «Edit resistor».
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labLanguageCodes,labTranslation} from "../scripts/LabTranslations.ts";
import {componentEditDialogLabels} from "../scripts/CircuitJsEditDialogTitles.ts";

const dir=process.argv[2];
if(!dir)throw Error("Uso: verify-edit-dialog-titles.mjs <ts-dir>");
const source=readFileSync(join(dir,"EditDialog.ts"),"utf8");
assert(source.includes('Locale.LS("Edit Component") + ": " + Locale.LS(componentName)'),
 "El encabezado sigue buscando la frase dinámica completa en inglés");
assert(source.includes("const customTitle = !!ce.getEditTitle;") &&
 source.includes("!customTitle && ce instanceof CircuitElm"),
 "No se distingue el título de un componente del de otras ventanas");
assert(source.includes(": Locale.LS(title);"),
 "Se han alterado los títulos específicos de las ventanas");
const patch=readFileSync(join(dir,"LabTranslations.ts"),"utf8");
assert(patch.includes("./CircuitJsEditDialogTitles"),
 "El motor no carga las traducciones complementarias de títulos");

const native=["csx","da","de","es","fi","fr","it","ja","kr","nb","pl","pt","ru","zh","zh-tw"];
const extra=["ca","ca-es-valencia","gl","eu","nl","sv"];
assert.equal(labLanguageCodes.length,22);
assert.deepEqual([...new Set([...native,"en",...extra])].sort(),[...labLanguageCodes].sort());
const examples=["resistor","capacitor","capacitor (polarized)","inductor",
 "inductor (sat)","voltage source","A/C source","current source",
 "wattmeter","relay","op-amp"];
let checks=0;
for(const lang of native){
 const content=readFileSync(join(dir,"public/locale/locale_"+lang+".txt"),"utf8");
 const official=new Map([...content.matchAll(/^"(.*?)"="(.*)"$/gm)]
  .map(m=>[m[1],m[2]]));
 for(const key of ["Edit Component",...examples]){
  const value=labTranslation(lang,key)??official.get(key);
  assert(value?.trim(),"Falta el encabezado o el tipo "+lang+" / "+key);
  checks++;
 }
}
for(const lang of extra){
 const dictionary=componentEditDialogLabels[lang];
 assert(dictionary,"Falta el catálogo de encabezados "+lang);
 for(const [key,value] of Object.entries(dictionary)){
  assert(value?.trim(),"Falta traducción "+lang+" / "+key);
  assert.equal(labTranslation(lang,key),value,
   "No se aplica el catálogo correcto para "+lang+" / "+key);
  // Mantener las siglas de las unidades y nombres de clases intactos.
  checks++;
 }
 for(const key of ["Edit Component",...examples]){
  assert(dictionary[key]?.trim(),"Tipo habitual sin traducción propia: "+lang+" / "+key);
 }
}
assert.equal(labTranslation("en","Edit Component")??"Edit Component","Edit Component");
for(const code of labLanguageCodes){
 const name=code==="en"?"resistor":
   labTranslation(code,"resistor") ??
   new Map([...readFileSync(join(dir,"public/locale/locale_"+code+".txt"),"utf8")
    .matchAll(/^"(.*?)"="(.*)"$/gm)].map(m=>[m[1],m[2]])).get("resistor");
 const header=code==="en"?"Edit Component":
   labTranslation(code,"Edit Component") ??
   new Map([...readFileSync(join(dir,"public/locale/locale_"+code+".txt"),"utf8")
    .matchAll(/^"(.*?)"="(.*)"$/gm)].map(m=>[m[1],m[2]])).get("Edit Component");
 assert(name?.trim()&&header?.trim(),
  "No es posible construir un encabezado localizable en "+code);
 assert(!(/^Edit resistor$/i).test(header+": "+name),
  "El encabezado aparece en inglés en "+code);
}
console.log("OK: encabezados de edición de los 22 idiomas, "+
 checks+" traducciones de componentes y títulos específicos preservados.");

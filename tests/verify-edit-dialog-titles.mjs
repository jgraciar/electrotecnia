// Auditoría de los títulos de edición en los 22 idiomas de CircuitJS.
// El encabezado se genera con el nombre traducido del componente y una
// plantilla sintáctica propia del idioma; nunca se busca «Edit resistor».
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labLanguageCodes,labTranslation} from "../scripts/LabTranslations.ts";
import {componentEditDialogLabels, componentEditTitleTemplates, localizedComponentEditTitle} from "../scripts/CircuitJsEditDialogTitles.ts";

const dir=process.argv[2];
if(!dir)throw Error("Uso: verify-edit-dialog-titles.mjs <ts-dir>");
const source=readFileSync(join(dir,"EditDialog.ts"),"utf8");
assert(source.includes('localizedComponentEditTitle(Locale.activeLanguage, Locale.LS(componentName))'),
 "El encabezado del componente no utiliza la plantilla del idioma activo");
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
assert.deepEqual(Object.keys(componentEditTitleTemplates).sort(), [...labLanguageCodes].sort(),
 "No existe una plantilla de encabezado por cada idioma");
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
// Comprobar el título final, no solo la presencia de palabras aisladas.
const sampleNames=["resistor",...examples.filter(name=>name!=="resistor")];
let checkedTitles=0;
for(const code of labLanguageCodes){
 const nativeDictionary=native.includes(code)
  ? new Map([...readFileSync(join(dir,"public/locale/locale_"+code+".txt"),"utf8")
    .matchAll(/^"(.*?)"="(.*)"$/gm)].map(m=>[m[1],m[2]]))
  : new Map();
 const names=extra.includes(code)?Object.keys(componentEditDialogLabels[code])
  .filter(key=>key!=="Edit Component"):sampleNames;
 assert(componentEditTitleTemplates[code].includes("{component}"),
  "Plantilla sin marcador de componente: "+code);
 for(const key of names){
  const name=code==="en"?key:labTranslation(code,key)??nativeDictionary.get(key);
  assert(name?.trim(),"Componente sin traducir: "+code+" / "+key);
  const title=localizedComponentEditTitle(code,name);
  assert(title.includes(name) && !title.includes("{component}") && title!==name,
   "Título de edición incompleto: "+code+" / "+key+" = "+title);
  if(code!=="en" && key==="resistor")
   assert(title!=="Edit resistor","Título de resistencia en inglés: "+code);
  checkedTitles++;
 }
}
assert.equal(localizedComponentEditTitle("es","resistencia"), "Editar resistencia");
assert.equal(localizedComponentEditTitle("ca","resistència"), "Editar resistència");
assert.equal(localizedComponentEditTitle("ca-es-valencia","resistència"), "Editar resistència");
assert.equal(localizedComponentEditTitle("en","resistor"), "Edit resistor");
console.log("OK: encabezados de edición de los 22 idiomas, "+
 checks+" traducciones de componentes y "+checkedTitles+" títulos finales verificados.");

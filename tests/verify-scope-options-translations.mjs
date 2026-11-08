// Cobertura de las opciones generales, las propiedades y menús del osciloscopio.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labLanguageCodes,labTranslation} from "../scripts/LabTranslations.ts";
import {scopeOptionKeys,scopeOptionTranslations} from "../scripts/CircuitJsScopeOptions.ts";
import {generalOptionKeys,generalOptionTranslations} from "../scripts/CircuitJsGeneralOptions.ts";
import {circuitJsUiCompletenessKeys} from "../scripts/CircuitJsUiCompleteness.ts";
const dir=process.argv[2];
if(!dir)throw Error("Uso: verify-scope-options-translations.mjs <ts-dir>");
const sources={
 overlay:readFileSync(join(dir,"ScopeOverlays.ts"),"utf8"),
 properties:readFileSync(join(dir,"ScopePropertiesDialog.ts"),"utf8"),
 options:readFileSync(join(dir,"EditOptions.ts"),"utf8"),
 ui:readFileSync(join(dir,"UIManager.ts"),"utf8")
};
for(const key of ["Plot ","Max=","Min=","P-P="])
 assert(sources.overlay.includes('Locale.LS("'+key+'")'),
  "Texto de osciloscopio sin localización: "+key);
assert(sources.properties.includes("Locale.LS('Plot ')"));
assert.equal([...sources.properties.matchAll(/Locale\.LS\('CH '\)/g)].length,2,
 "Los dos rótulos de canal deben traducirse");
assert(sources.ui.includes('titleLabel.textContent = Locale.LS("Label")'));
for(const code of labLanguageCodes){
 for(const key of circuitJsUiCompletenessKeys)
  assert(labTranslation(code,key)?.trim(),
   "Falta control en "+code+": "+key);
}
const extraCodes=["ca","ca-es-valencia","gl","eu","nl","sv"];
for(const code of extraCodes){
 assert.equal(scopeOptionTranslations[code]?.length,scopeOptionKeys.length);
 assert.equal(generalOptionTranslations[code]?.length,generalOptionKeys.length);
 for(const key of [...scopeOptionKeys,...generalOptionKeys])
  assert(labTranslation(code,key)?.trim(),
   "Opciones u osciloscopio mezclados con español en "+code+": "+key);
}
const nativeCodes=["csx","da","de","es","fi","fr","it","ja","kr","nb","pl","pt","ru","zh-tw","zh"];
for(const code of nativeCodes){
 const source=readFileSync(join(dir,"public/locale/locale_"+code+".txt"),"utf8");
 const official=new Map([...source.matchAll(/^"(.*?)"="(.*)"$/gm)]
  .map(m=>[m[1],m[2]]));
 const missing=[...scopeOptionKeys,...generalOptionKeys].filter(key=>
  key!=="/div"&&key!=="OK"&&labTranslation(code,key)==null&&!official.has(key));
 assert.deepEqual(missing,[],
  "Etiquetas de osciloscopio u Opciones no traducidas en "+code);
}
console.log("OK: 22 idiomas; "+scopeOptionKeys.length+
 " etiquetas de osciloscopio, "+generalOptionKeys.length+
 " de Opciones y controles adicionales verificados.");

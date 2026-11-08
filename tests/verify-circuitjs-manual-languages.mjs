import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labLanguageCodes} from "../scripts/LabTranslations.ts";
const dir=process.argv[2];if(!dir)throw Error("Falta el directorio TypeScript");
const options=readFileSync(join(dir,"EditOptions.ts"),"utf8");
const start=options.indexOf('ei.choice.add("Čeština")');
const end=options.indexOf("return ei;",start);
assert(start>=0 && end>start,"No se ha encontrado el selector de idioma de CircuitJS");
const languages=[...options.slice(start,end).matchAll(/ei\.choice\.add\("([^"]+)"\)/g)]
 .map(m=>m[1]);
assert.equal(languages.length,22,"CircuitJS no muestra los 22 idiomas en su selector manual");
const added=["Català","Valencià","Galego","Euskara","Nederlands","Svenska"];
assert.deepEqual(languages.slice(-6),added,
 "Las seis opciones nuevas deben conservar el orden y los nombres originales");
assert.equal(labLanguageCodes.length,languages.length);
for(const [index,code] of ["ca","ca-es-valencia","gl","eu","nl","sv"].entries())
 assert(options.includes('case '+(17+index)+': langString = "'+code+'";'),
  "La elección manual no carga el código "+code);
assert(options.includes('stor.setItem("labLanguageMode", "manual");'),
 "El selector CircuitJS debe guardar la elección manual");
console.log("OK: los 22 idiomas se pueden seleccionar manualmente en CircuitJS.");

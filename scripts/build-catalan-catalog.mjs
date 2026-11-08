// Catálogo catalán: parte de las traducciones técnicas revisadas en valenciano,
// pero utiliza un fichero independiente y formas propias del catalán general.
// Las claves inglesas, siglas, unidades, clases y nombres de usuario NO se alteran.
import {readFileSync,writeFileSync} from "node:fs";
import {join} from "node:path";

const tsDir=process.argv[2];
if(!tsDir)throw Error("Uso: build-catalan-catalog.mjs <directorio ts>");
const path=join(tsDir,"public/locale/locale_ca-es-valencia.txt");
const original=readFileSync(path,"utf8");
const substitutions=[
 ["eixides","sortides"],["eixida","sortida"],
 ["afig","afegeix"],["afegix","afegeix"],
 ["estos","aquests"],["estes","aquestes"],
 ["este","aquest"],["esta","aquesta"],
 ["eixos","aquells"],["eixes","aquelles"],
 ["eixe","aquell"],["eixa","aquella"],
 ["ací","aquí"],["hui","avui"],["prompte","aviat"],
 ["menuts","petits"],["menudes","petites"],
 ["menut","petit"],["menuda","petita"],
 ["xicotets","petits"],["xicotetes","petites"],
 ["xicotet","petit"],["xicoteta","petita"],
 ["espill","mirall"],["espills","miralls"],
 ["davall","sota"],["ferramentes","eines"],["ferramenta","eina"],
 ["apegues","enganxis"],["apega","enganxa"],["apegar","enganxar"],
 ["repetix","repeteix"],["restablix","restableix"],
 ["servix","serveix"],["oferix","ofereix"],["definix","defineix"],
 ["siga","sigui"],["siguen","siguin"],["haja","hagi"],
 ["puga","pugui"],["pugues","puguis"],["tinga","tingui"],
 ["tingues","tinguis"],["vore","veure"],
 ["polsa","prem"],["polsar","prémer"]
];
const reviewed={
 "Add Sliders":"Afegeix controls lliscants",
 "New Slider":"Control lliscant nou",
 "Add Analog Output":"Sortida analògica",
 "Add Logic Output":"Sortida lògica",
 "Add Audio Output":"Sortida d'àudio",
 "Add Data Export":"Exportació de dades",
 "Add SPDT Switch":"Commutador unipolar de dues posicions (SPDT)",
 "Add DPDT Switch":"Commutador bipolar de dues posicions (DPDT)",
 "Add Analog Switch (SPDT)":"Commutador analògic unipolar de dues posicions (SPDT)",
 "Show Current":"Mostra la intensitat",
 "Change Language":"Canvia l'idioma",
 "Other Options":"Altres opcions",
 "Please select one or more subcircuits.":"Selecciona un subcircuit o més.",
 "To open a shared Dropbox file from a Dropbox link paste the link below...":"Per obrir un fitxer compartit de Dropbox, enganxa l'enllaç a continuació...",
 "File too large!":"El fitxer és massa gran.",
 "Convergence failed!":"La simulació no convergeix. Comprova les connexions i els valors dels components.",
 "Singular matrix!":"La matriu del circuit és singular. Revisa els nodes desconnectats, l'absència de terra i les connexions incorrectes."
};
function adapt(value){
 let text=value;
 for(const [before,after] of substitutions){
  const match=new RegExp("(?<!\\p{L})"+before+"(?!\\p{L})","giu");
  text=text.replace(match,m=>
   m===m.toLocaleUpperCase("ca")?after.toLocaleUpperCase("ca"):
   m[0]===m[0].toLocaleUpperCase("ca")?
    after[0].toLocaleUpperCase("ca")+after.slice(1):after);
 }
 return text;
}
const seen=new Set();const out=[];
let changed=0;
for(const line of original.split(/\r?\n/)){
 const m=line.match(/^"(.*?)"="(.*)"$/);
 if(!m){if(line.trim())out.push(line);continue;}
 // El catálogo valenciano heredado puede repetir claves: conservar el orden
 // y todas sus líneas; el lector de CircuitJS aplica la última aparición.
 const key=m[1];
 seen.add(key);
 const value=reviewed[key]??adapt(m[2]);
 if(!value.trim()&&m[2].trim())throw Error("Traducción vacía: "+key);
 if(value!==m[2])changed++;
 out.push('"'+key+'"="'+value+'"');
}
if(seen.size<1700||changed<35)
 throw Error("Catálogo catalán incompleto o sin adaptación lingüística: "+
  seen.size+" claves, "+changed+" cambios");
writeFileSync(join(tsDir,"public/locale/locale_ca.txt"),out.join("\n")+"\n");
console.log("Catálogo catalán independiente: "+seen.size+
 " entradas; "+changed+" adaptaciones respecto al valenciano.");

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
// Revisión editorial: frases completas y magnitudes que no admiten traducción palabra a palabra.
const polished={
  "Y Voltage": "Tensió de l'eix Y",
  "Plate Voltage": "Tensió de placa",
  "Show Info": "Mostra la informació",
  "Show Duty Cycle": "Mostra el cicle de treball",
  "Show Bulk": "Mostra el substrat",
  "Show Body Diode": "Mostra el díode intrínsec",
  "Current At Above Voltage (A)": "Intensitat a la tensió superior (A)",
  "Convergence failed!": "La simulació no convergeix. Comprova les connexions i els valors dels components.",
  "Singular matrix!": "La matriu del circuit és singular. Revisa els nodes desconnectats, l'absència de terra i les connexions incorrectes.",
  "File too large!": "El fitxer és massa gran.",
  "Model not found: ": "No s'ha trobat el model: ",
  "Drag the pins to the desired position": "Arrossega els terminals fins a la posició desitjada.",
  "Checkerboard": "Tauler d'escacs",
  "To open a shared Dropbox file from a Dropbox link paste the link below...": "Per a obrir un fitxer compartit de Dropbox, apega l'enllaç a continuació...",
  "This model cannot be modified.  Change the model name to allow customization.": "Este model no es pot modificar. Canvia-li el nom per a poder personalitzar-lo.",
  "Switch in lower position - configuration used on LM13700 data sheet": "Commutador en la posició inferior: configuració indicada en el full de característiques del LM13700.",
  "File Error Response": "Error en la resposta del fitxer.",
  "Show State of Charge": "Mostra l'estat de càrrega",
  "Show Bus Value (Hex)": "Mostra el valor del bus en hexadecimal",
  "Add SPDT Switch": "Commutador unipolar de dos posicions (SPDT)",
  "Add DPDT Switch": "Commutador bipolar de dos posicions (DPDT)",
  "Volume Control": "Control de volum",
  "Audio data is not ready yet.  Increase simulation speed to make data ready sooner.": "Les dades d'àudio encara no estan preparades. Augmenta la velocitat de simulació."
};
for(const [key,expected] of Object.entries(polished)){
 assert.equal(valencian.get(key),expected,"Fallo de revisión lingüística: "+key);
}
const unchanged=[...original].filter(([key,spanish])=>spanish===valencian.get(key));
console.log("OK: "+valencian.size+" identificadores traducidos/completados para Valenciano.");
console.log("Entradas idénticas al catálogo castellano (símbolos, siglas, cognados o pendiente de revisión): "+unchanged.length);

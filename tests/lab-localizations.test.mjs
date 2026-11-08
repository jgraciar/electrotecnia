import assert from "node:assert/strict";
import {labKeys,labLanguageCodes,labTranslation}
 from "../scripts/LabTranslations.ts";

assert.deepEqual([...labLanguageCodes],["csx","da","de","en","es","fi","fr","it","nb","pl","pt","ru","zh","zh-tw","ja","kr","ca","ca-es-valencia","gl","eu","nl","sv"]);
const keys=labKeys();
assert(keys.length>=92,"Las etiquetas añadidas no deben quedar sin traducir");
assert.equal(new Set(keys).size,keys.length,"No repetir claves de traducción");
const important=[
 "Inversor fotovoltaico FV (CA)","Añadir impedancia Z (CA, RLC serie)",
 "Carga no lineal: puente rectificador con filtro C","Tipo de inversor",
 "Potencia activa nominal Pn (W)","Potencia aparente máxima Smax (VA)",
 "Regulación avanzada de cos φ (por defecto 1)","Lectura de intensidad",
 "Eficaz RMS (por defecto)","Instantánea i(t)",
 "Impedancia Z · solo CA · conexión en serie",
 "Tipo de corriente","Automatica (detectar)","Alterna (CA)",
 "Potencia activa P (W)","Potencia reactiva Q (VAr) - fundamental",
 "Potencia aparente S (VA)","Mostrar cos φ (fundamental)",
 "Mostrar THD corriente (%)","Decimales generales (0 a 10)",
 "Separador decimal","Separador de miles",
 "Conexión a red (U/f automáticas)","Fotovoltaica aislada",
 "Puente rectificador monofásico con filtro capacitivo"
];
for(const key of important){
 assert(keys.includes(key),"Falta texto añadido al catálogo: "+key);
 for(const language of labLanguageCodes){
  const translation=labTranslation(language,key);
  assert(typeof translation==="string" && translation.length>0,
   "Falta "+language+" para "+key);
  // Algunas etiquetas técnicas coinciden literalmente entre idiomas
  // (p. ej. «Separador decimal»); eso no indica falta de traducción.
 }
}
for(const language of labLanguageCodes){
 for(const key of keys){
  const value=labTranslation(language,key);
  assert(value&&value.trim().length>0,language+": traducción vacía para "+key);
 }
 for(const menu of ["Inputs and Sources","Passive Components","Outputs and Labels","Show Ω Unit"]){
  assert(labTranslation(language,menu),"Submenú sin traducir: "+language+"/"+menu);
 }
}
assert.equal(labTranslation("es-ES","Tipo de inversor"),"Tipo de inversor");
assert.equal(labTranslation("en-US","Tipo de inversor"),"Inverter type");
assert.equal(labTranslation("fr-FR","Tipo de inversor"),"Type d’onduleur");
assert.equal(labTranslation("cs-CZ","Tipo de inversor"),"Typ střídače");
assert.equal(labTranslation("da-DK","Tipo de inversor"),"Invertertype");
assert.equal(labTranslation("fi-FI","Tipo de inversor"),"Invertterin tyyppi");
assert.equal(labTranslation("nb-NO","Tipo de inversor"),"Type vekselretter");
assert.equal(labTranslation("ru-RU","Tipo de inversor"),"Тип инвертора");
assert.equal(labTranslation("zh-CN","Tipo de inversor"),"逆变器类型");
assert.equal(labTranslation("zh-TW","Tipo de inversor"),"逆變器類型");
assert.equal(labTranslation("ja-JP","Tipo de inversor"),"インバーターの種類");
assert.equal(labTranslation("ko-KR","Tipo de inversor"),"인버터 종류");
assert.equal(labTranslation("ca-ES","Tipo de inversor"),"Tipus d'inversor");
assert.equal(labTranslation("ca-ES-valencia","Tensión de salida U RMS (V, fase-N)"),"Tensió d'eixida U RMS (V, fase-N)");
assert.equal(labTranslation("gl-ES","Tipo de inversor"),"Tipo de inversor");
assert.equal(labTranslation("nl-NL","Tipo de inversor"),"Omvormertype");
assert.equal(labTranslation("sv-SE","Tipo de inversor"),"Typ av växelriktare");
assert.equal(labTranslation("sv-SE","Inputs and Sources"),"Ingångar och källor");
assert.equal(labTranslation("eu-ES","Tipo de inversor"),"Inbertsore mota");

for(const [key,spanish,valencian] of [
 ["Export As Image...","Exportar como imagen...","Exporta com a imatge..."],
 ["Export As SVG...","Exportar como SVG...","Exporta com a SVG..."],
 ["Find Component/Command...","Buscar componente o comando...","Busca un component o una ordre..."],
 ["Add Controlled Voltage Source (2-terminal)","Fuente de tensión controlada (2 terminales)","Font de tensió controlada (2 terminals)"],
 ["Add Controlled Current Source (2-terminal)","Fuente de corriente controlada (2 terminales)","Font d'intensitat controlada (2 terminals)"],
 ["Add Transformer","Transformador","Transformador"],
 ["Add Test Point","Punto de prueba","Punt de prova"],
 ["Add Wattmeter","Vatímetro","Vatímetre"],
 ["Command Palette","Paleta de comandos","Paleta d'ordres"]
]){
 assert.equal(labTranslation("es-ES",key),spanish,"Error español: "+key);
 assert.equal(labTranslation("ca-ES-valencia",key),valencian,"Error valenciano: "+key);
}
assert.equal(labTranslation("es-ES","Show Cursor Cross Hairs"),"Mostrar la cruz del cursor");
for(const [key,value] of [
 ["Other Options","Altres opcions"],
 ["Change Language","Canvia l'idioma"],
 ["Show Properties on Create","Mostra les propietats en crear"],
 ["# of Decimal Digits (long format)","Nombre de decimals (format llarg)"],
 ["Matrix Solver","Resolutor matricial"],
 ["Apply","Aplica"],
 ["Voltage","Tensió"],
 ["Current","Intensitat"]
]){
 assert.equal(labTranslation("ca-ES-valencia",key),value,
  "Falta traducción de controles valencianos: "+key);
}
// Las siglas normalizadas se conservan en castellano y valenciano.
for(const [key,spanish,valencian] of [
 ["Add Switch","Interruptor unipolar (SPST)","Interruptor unipolar (SPST)"],
 ["Add Push Switch","Pulsador unipolar (SPST)","Polsador unipolar (SPST)"],
 ["Add SPDT Switch","Conmutador unipolar de dos posiciones (SPDT)","Commutador unipolar de dos posicions (SPDT)"],
 ["Add DPDT Switch","Conmutador bipolar de dos posiciones (DPDT)","Commutador bipolar de dos posicions (DPDT)"],
 ["Add Analog Switch (SPST)","Interruptor analógico unipolar (SPST)","Interruptor analògic unipolar (SPST)"],
 ["Add Analog Switch (SPDT)","Conmutador analógico unipolar de dos posiciones (SPDT)","Commutador analògic unipolar de dos posicions (SPDT)"]
]){
 assert.equal(labTranslation("es-ES",key),spanish,"Nomenclatura incorrecta en español: "+key);
 assert.equal(labTranslation("ca-ES-valencia",key),valencian,"Nomenclatura incorrecta en valenciano: "+key);
}
for(const [key,spanish,valencian] of [
 ["Add Sliders","Añadir controles deslizantes","Afig controls lliscants"],
 ["New Slider","Nuevo control deslizante","Control lliscant nou"],
 ["Share Slider: ","Compartir control deslizante: ","Compartix el control lliscant: "],
 ["Make Local","Hacer local","Fes local"],
 ["Make Global","Hacer global","Fes global"],
 ["Make Persistent","Hacer persistente","Fes persistent"],
 ["Save Subcircuits","Guardar subcircuitos","Guarda els subcircuits"]
]){
 assert.equal(labTranslation("es-ES",key),spanish,"Deslizadores o subcircuitos sin traducir al español: "+key);
 assert.equal(labTranslation("ca-ES-valencia",key),valencian,"Deslizadores o subcircuitos sin traducir al valenciano: "+key);
}
// Ejemplos de Fuentes controladas: CCS/CVS son etiquetas de circuitos
// originales y deben localizarse sin cambiar archivos ni siglas técnicas.
const exampleTitles=[
 "CCS Resistor","CCS Varying Resistor","CVS Op-Amp",
 "VCVS Op-Amp With Rails","VCVS Multiplier","CVS Full Rectifier",
 "CVS Voltage Ramp","CCS Current Adder","CVS Integrator",
 "CVS Differentiator","CCS Variable Inductor","CCS Variable Capacitor"
];
for(const code of labLanguageCodes){
 for(const key of [...exampleTitles,"Run","Stop"]){
  const translated=labTranslation(code,key);
  assert(translated?.trim(),code+" sin traducción de "+key);
  if(code!=="en")assert.notEqual(translated,key,code+" conserva inglés: "+key);
 }
 assert.notEqual(labTranslation(code,"Run"),labTranslation(code,"Stop"),
  "Marcha y parada deben tener etiquetas distintas: "+code);
}
for(const [language,key,expected] of [
 ["es-ES","CCS Resistor","Resistencia (CCS)"],
 ["es-ES","CVS Op-Amp","Amplificador operacional (CVS)"],
 ["es-ES","CCS Current Adder","Sumador de corrientes (CCS)"],
 ["ca-ES-valencia","CCS Resistor","Resistència (CCS)"],
 ["ca-ES-valencia","CVS Op-Amp","Amplificador operacional (CVS)"],
 ["ca-ES-valencia","CCS Current Adder","Sumador d'intensitats (CCS)"],
 ["es-ES","Run","Iniciar"],
 ["es-ES","Stop","Detener"],
 ["ca-ES-valencia","Run","Iniciar"],
 ["ca-ES-valencia","Stop","Detindre"]
]){
 assert.equal(labTranslation(language,key),expected,
 "Error de fuente CCS/CVS o marcha/parada: "+language+"/"+key);
}
assert.equal(labTranslation("zz","Tipo de inversor"),null);
console.log("OK: "+keys.length+" etiquetas añadidas en "+labLanguageCodes.length+
 " idiomas, menús e información incluidos");

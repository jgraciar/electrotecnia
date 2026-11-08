import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {getCircuitEditFormat,formatCircuitEditValue,normalizeCircuitEditInput,
 circuitEditNumberError} from "../scripts/CircuitJsEditNumbers.ts";
import {labLanguageCodes} from "../scripts/LabTranslations.ts";

const dir=process.argv[2];
if(!dir)throw Error("Uso: verify-edit-regional-numbers.mjs <ts-dir>");
const source=readFileSync(join(dir,"EditDialog.ts"),"utf8");
const formatter=readFileSync(join(dir,"CircuitJsEditNumbers.ts"),"utf8");
for(const fragment of [
 "formatCircuitEditValue(this.unitString(ei), Locale.activeLanguage)",
 "formatCircuitEditValue(EditDialog.unitStringVal(ei, next), Locale.activeLanguage)",
 "normalizeCircuitEditInput((ei.textf as HTMLInputElement).value, Locale.activeLanguage)",
 "ei.setError(circuitEditNumberError(Locale.activeLanguage))",
 "const field = Locale.LS(ei.errorFieldName ?? ei.name)",
 "inp.addEventListener(\"input\"",
 'this.errorLabel.style.display = "none"'
])assert(source.includes(fragment),"El editor no utiliza la conversión regional: "+fragment);
assert(formatter.includes("labRegionalFormat")&&formatter.includes("labGroupingSeparator"));

const storage=values=>({getItem:key=>values[key]??null});
const eu={decimal:",",group:"."};
const uk={decimal:".",group:","};
const custom={decimal:",",group:""};
const custom2={decimal:".",group:""};

assert.deepEqual(getCircuitEditFormat("es",storage({labRegionalFormat:"eu"})),eu);
assert.deepEqual(getCircuitEditFormat("en",storage({labRegionalFormat:"eu"})),eu);
assert.deepEqual(getCircuitEditFormat("es",storage({labRegionalFormat:"uk"})),uk);
assert.deepEqual(getCircuitEditFormat("ca-es-valencia",storage({
 labRegionalFormat:"custom",labDecimalSeparator:",",labGroupingSeparator:""
})),custom);
assert.deepEqual(getCircuitEditFormat("es",storage({
 labRegionalFormat:"custom",labDecimalSeparator:".",labGroupingSeparator:","
})),uk);
assert.deepEqual(getCircuitEditFormat("es",storage({
 labRegionalFormat:"custom",labDecimalSeparator:",",labGroupingSeparator:","
})),custom);

for(const [source,expected] of [
 ["1234567.89","1.234.567,89"],["1.25k","1,25k"],
 ["0.000125","0,000125"],["-1234.56","-1.234,56"],
 ["1e-3","1e-3"],["2.4rms","2,4rms"],
 ["1.23456789012","1,23456789012"],["2.2u","2,2u"]
])assert.equal(formatCircuitEditValue(source,"es",eu),expected,"Visualización EU "+source);
// Reproducción del umbral de salida lógica mostrado en la captura.
assert.equal(formatCircuitEditValue("2.5","es",eu),"2,5");
assert.equal(normalizeCircuitEditInput("2,5","es",eu),"2.5");
assert.equal(Number(normalizeCircuitEditInput("2,5","es",eu)),2.5);
assert.equal(formatCircuitEditValue("1234567.89","es",uk),"1,234,567.89");
assert.equal(formatCircuitEditValue("1234567.89","es",custom),"1234567,89");
assert.equal(formatCircuitEditValue("1234567.89","es",custom2),"1234567.89");

for(const [value,expected] of [
 ["1.234.567,89","1234567.89"],["1.234,56","1234.56"],
 ["12.345","12345"],["0,125","0.125"],[",5","0.5"],
 ["-0,25","-0.25"],["1,5k","1.5k"],["2k2","2.2k"],
 ["1,5e-3","1.5e-3"],["2,3Mrms","2.3Mrms"],
 ["230rms","230rms"],["1meg","1meg"],["1,25u","1.25u"]
])assert.equal(normalizeCircuitEditInput(value,"es",eu),expected,"Lectura EU "+value);

for(const [value,expected] of [
 ["1,234,567.89","1234567.89"],["1,234.56","1234.56"],
 ["0.125","0.125"],["2.2k","2.2k"],["2k2","2.2k"]
])assert.equal(normalizeCircuitEditInput(value,"en",uk),expected,"Lectura UK "+value);

assert.equal(normalizeCircuitEditInput("12345,67","es",custom),"12345.67");
assert.equal(normalizeCircuitEditInput("12345.67","es",custom2),"12345.67");
for(const value of ["1.5","12.34,5","1,23,45","1.234.56","abc","1,2k3",
 "1,2.3","1.23e-3","","1,5e--3","NaN"]){
 assert.throws(()=>normalizeCircuitEditInput(value,"es",eu),Error,
  "Debe rechazarse una entrada europea ambigua o inválida: "+value);
}
for(const value of ["1,5","1,2,3","1,234.5.6"])
 assert.throws(()=>normalizeCircuitEditInput(value,"en",uk));
assert.throws(()=>normalizeCircuitEditInput("1.234,56","es",custom));
for(const code of labLanguageCodes)
 assert(circuitEditNumberError(code).trim(),"Mensaje sin traducir: "+code);
console.log("OK: entradas numéricas de CircuitJS, EU/anglosajón/personalizado; "+
 "notación científica, prefijos eléctricos, RMS, validación y 22 mensajes de error.");

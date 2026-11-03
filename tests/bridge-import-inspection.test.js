// Prueba de formatos de entrada sin navegador: usa el mismo analizador
// inspectCircuitFile() que invoca el puente del laboratorio.
const assert=require("node:assert/strict");
const fs=require("node:fs");
const {parse}=require("../wulflemm-xml.js");
const code=fs.readFileSync(__dirname+"/../bridge.js","utf8");
const start=code.indexOf("  function inspectCircuitFile(raw){");
const end=code.indexOf("  function importModel(filename,raw){",start);
assert(start>=0&&end>start,"El importador ha cambiado de ubicación");
class FakeDOMParser{
  parseFromString(source){
    const nodes=parse(source);
    return {querySelector:()=>null,documentElement:{
      tagName:nodes[0].name,
      children:nodes.filter(n=>n.depth===1).map(n=>({
        tagName:n.name,
        getAttribute:k=>Object.hasOwn(n.attrs,k)?n.attrs[k]:null
      }))
    }};
  }
}
const inspect=new Function("DOMParser",code.slice(start,end)+"return inspectCircuitFile;")(FakeDOMParser);
const original=fs.readFileSync(__dirname+"/fixtures/wulflemm-aron.xml","utf8");
const classic=[
 "$ 1 0.000005 10 50 5 50",
 "v 32 128 32 64 0 0 40 5 0 0 0.5",
 "g 32 128 32 144 0",
 "r 32 64 160 64 0 100",
 "w 160 64 160 128 0",
 "w 160 128 32 128 0",
 ""].join("\n");
assert.equal(inspect(original).elements,27,"Wulflemm Aron: componentes");
assert.equal(inspect(original).format,"circuitjs-xml");
assert.equal(inspect("\uFEFF<?xml version=\"1.0\"?>\n"+original).elements,27,"BOM y declaración XML");
assert.equal(inspect(classic).elements,5,"Falstad texto: componentes");
assert.equal(inspect(classic.replace("r 32 64","-")).elements,4,
 "Al reemplazar un componente por una directiva, no debe contarse");
// Directivas del importador textual original (no son elementos del circuito).
assert.equal(inspect(classic+".submodelo A\n!logic\n").elements,5,"Metadatos de modelos");
assert.throws(()=>inspect(original.replace("</cir>",
  '<ElementoSinPosicion/>\n</cir>')),/Etiqueta XML no reconocida/);
assert.throws(()=>inspect(original.replace("</cir>",
  '<ElementoInvalido x="0 0 N 40"/>\n</cir>')),/Coordenadas eléctricas inválidas/);
assert.throws(()=>inspect(classic+"componente mal construido\n"),/Línea de componente no reconocida/);
assert.throws(()=>inspect("esto no es CircuitJS"),/Formato no reconocido/);
console.log("OK: XML Wulflemm, TXT Falstad, BOM, metadatos y errores de importación.");

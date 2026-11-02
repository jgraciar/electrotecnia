const assert=require("node:assert/strict");
const fs=require("node:fs");
const {parse,serialize}=require("../wulflemm-xml.js");
const xml=fs.readFileSync(__dirname+"/fixtures/wulflemm-aron.xml","utf8");
const original=parse(xml),roundTrip=parse(serialize(original));
assert.deepEqual(roundTrip,original,"XML -> árbol -> XML pierde información");
const meters=roundTrip.filter(n=>n.name==="WattmeterTrue");
assert.equal(meters.length,2);
assert.deepEqual(meters.map(m=>m.attrs.x),["336 304 448 304","336 592 448 592"]);
assert.deepEqual(roundTrip.filter(n=>n.name==="v").map(n=>n.attrs.phaseShift||"0"),
  ["0","2.0943951023931953","-2.0943951023931953"]);
assert.throws(()=>parse("$ 1 0.000005 10 50 5 50"),/No es un circuito/);
const changed=require("../wulflemm-xml.js").updateAttribute(original,original.findIndex(n=>n.name==="r"),"r","470");
assert.equal(original.find(n=>n.name==="r").attrs.r,"1000","La edición ha modificado el original");
const editedRoundTrip=parse(serialize(changed));
assert.equal(editedRoundTrip.find(n=>n.name==="r").attrs.r,"470");
assert.equal(editedRoundTrip.filter(n=>n.name==="WattmeterTrue").length,2);
assert.deepEqual(editedRoundTrip.map(n=>n.name),original.map(n=>n.name));
assert.deepEqual(editedRoundTrip.filter(n=>n.name==="v").map(n=>n.attrs.phaseShift||"0"),
  original.filter(n=>n.name==="v").map(n=>n.attrs.phaseShift||"0"));
const {updateAttribute,getComponents}=require("../wulflemm-xml.js");
assert.equal(getComponents(original).filter(n=>n.name==="WattmeterTrue").length,2);
assert.throws(()=>updateAttribute(original,0,"r","10"),/Índice/);
assert.throws(()=>updateAttribute(original,1,"bad key","10"),/Nombre/);
const changedFrequency=updateAttribute(original,original.findIndex(n=>n.name==="v"),"fr","50");
assert.equal(parse(serialize(changedFrequency)).find(n=>n.name==="v").attrs.fr,"50");
assert.equal(original.find(n=>n.name==="v").attrs.fr,"60");
console.log("OK: lectura y escritura XML conservan estructura, atributos, vatímetros y fases.");
console.log("AVISO: no acredita la compatibilidad con el motor eléctrico de CircuitJS.");

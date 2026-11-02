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
console.log("OK: lectura y escritura XML conservan estructura, atributos, vatímetros y fases.");
console.log("AVISO: no acredita la compatibilidad con el motor eléctrico de CircuitJS.");

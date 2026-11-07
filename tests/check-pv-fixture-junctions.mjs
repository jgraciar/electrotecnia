import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join, dirname} from "node:path";
import {fileURLToPath} from "node:url";

// Evita que un condensador termine en el interior de un cable sin nodo:
// CircuitJS exige extremos coincidentes. Comprueba también las derivaciones
// de N en las redes trifásicas de cuatro hilos, y conserva vatímetros P/Q/S.
const folder=join(dirname(fileURLToPath(import.meta.url)),"fixtures");
const ids=["V01","V02","C01","C02","M01","M02","M03",
 "T01","T02","I01","I02","D01","D02","N01"];
const fixtures=[
 "autoconsumo-galeria-vatimetros.xml",
 "autoconsumo-monofasica-vatimetros.xml",
 "autoconsumo-trifasica-vatimetros.xml",
 ...ids.map(id=>"autoconsumo-casos/"+id+".xml")
];
const containsInterior=(p,w)=>
 (w[0]===w[2]&&p[0]===w[0]&&
  p[1]>Math.min(w[1],w[3])&&p[1]<Math.max(w[1],w[3]))||
 (w[1]===w[3]&&p[1]===w[1]&&
  p[0]>Math.min(w[0],w[2])&&p[0]<Math.max(w[0],w[2]));
for(const filename of fixtures){
 const circuit=readFileSync(join(folder,filename),"utf8");
 assert(circuit.startsWith("<cir "),filename+" no es XML de CircuitJS");
 const wireSegments=[...circuit.matchAll(
  /<w x="(-?\d+) (-?\d+) (-?\d+) (-?\d+)"/g)]
   .map(m=>m.slice(1).map(Number));
 const wireEnds=new Set(wireSegments.flatMap(w=>[
  w.slice(0,2).join(","),w.slice(2,4).join(",")]));
 const capacitorNodes=[...circuit.matchAll(
  /<c x="(-?\d+) (-?\d+) (-?\d+) (-?\d+)"/g)]
  .map(m=>m.slice(1).map(Number));
 for(const q of capacitorNodes){
  for(const point of [q.slice(0,2),q.slice(2,4)]){
   assert(wireEnds.has(point.join(",")),
    filename+": condensador sin nodo de conexión explícito: "+point);
  }
 }
 for(const wire of wireSegments){
  for(const point of [wire.slice(0,2),wire.slice(2,4)]){
   assert(!wireSegments.some(v=>containsInterior(point,v)),
    filename+": derivación en T no terminada en nodo: "+point);
  }
 }
 const meters=[...circuit.matchAll(/<WattmeterTrue\b[^>]*>/g)].map(m=>m[0]);
 const inverters=[...circuit.matchAll(/<PVInverter\b[^>]*>/g)];
 const expected=filename.includes("galeria")?28:
  filename.includes("monofasica")?7:
  filename.includes("trifasica")?21:
  /autoconsumo-casos\/[TIDN]/.test(filename)?3:1;
 assert.equal(meters.length,expected,filename+": falta vatímetro");
 assert.equal(inverters.length,expected,filename+": falta inversor");
 assert(meters.every(m=>m.includes('labPowerMask="7"')),
  filename+": no están activas P, Q y S");
 assert(!/NaN|Infinity/.test(circuit),filename+": parámetro no finito");
}
console.log("OK: 17 XML con todos los terminales de condensador y neutro conectados; 28 vatímetros P/Q/S en galería");

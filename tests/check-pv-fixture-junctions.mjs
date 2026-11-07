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
 const capTags=[...circuit.matchAll(/<c\b[^>]*\/>/g)].map(m=>m[0]);
 assert.equal(capTags.length,capacitorNodes.length);
 for(const tag of capTags){
  const sr=Number(tag.match(/\bsr="([^"]+)"/)?.[1]);
  assert(Number.isFinite(sr)&&sr>0&&sr<=0.1,
   filename+": condensador sin resistencia serie de amortiguación");
 }
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
 // Comprobación eléctrica de nodos: un extremo de componente que aparece
 // dibujado sobre otro conductor debe pertenecer de verdad a esa misma red.
 const connected=new Map();
 const root=(name)=>{
  if(!connected.has(name))connected.set(name,name);
  let value=connected.get(name);
  if(value!==name){value=root(value);connected.set(name,value);}
  return value;
 };
 const link=(a,b)=>{
  a=root(a);b=root(b);
  if(a!==b)connected.set(a,b);
 };
 const point=(x,y)=>x+","+y;
 for(const [x1,y1,x2,y2] of wireSegments)
  link(point(x1,y1),point(x2,y2));
 const posts=[...circuit.matchAll(
  /<(v|r|l|c|PVInverter|WattmeterTrue)\b[^>]*>/g)];
 const countByPost=new Map();
 const allPosts=[];
 for(const [tag,kind] of posts.map(x=>[x[0],x[1]])){
  const values=tag.match(/\bx="(-?\d+) (-?\d+) (-?\d+) (-?\d+)"/);
  assert(values,filename+": faltan coordenadas de "+kind);
  const [x1,y1,x2,y2]=values.slice(1).map(Number);
  const endpoints=[[x1,y1],[x2,y2]];
  if(kind==="WattmeterTrue"){
   const width=Number(tag.match(/\bw="(\d+)"/)?.[1]??32);
   endpoints.push([x1,y1+width],[x2,y2+width]);
  }
  for(const [x,y] of endpoints){
   const label=point(x,y);
   allPosts.push({kind,label});
   countByPost.set(label,(countByPost.get(label)??0)+1);
  }
 }
 const grounds=new Set([...circuit.matchAll(
  /<g x="(-?\d+) (-?\d+) -?\d+ -?\d+"/g)]
  .map(m=>point(Number(m[1]),Number(m[2]))));
 for(const {kind,label} of allPosts)
  assert(wireEnds.has(label)||grounds.has(label)||(countByPost.get(label)??0)>=2,
   filename+": borne abierto "+kind+" en "+label);
 // Vatímetro de cuatro bornes: bobina de intensidad EN SERIE con la red,
 // bobina de tensión ENTRE L y N, sin puentear el instrumento.
 const sources=[...circuit.matchAll(
  /<v x="(-?\d+) (-?\d+) (-?\d+) (-?\d+)"/g)]
  .map(m=>m.slice(1).map(Number));
 const measuredMeters=[...circuit.matchAll(
  /<WattmeterTrue\b[^>]*\bx="(-?\d+) (-?\d+) (-?\d+) (-?\d+)"[^>]*\bw="(\d+)"/g)]
  .map(m=>m.slice(1).map(Number));
 for(const [x,y,x2,y2,width] of measuredMeters){
  const upstream=sources.filter(s=>s[1]===y&&s[0]<x)
   .sort((a,b)=>b[0]-a[0])[0];
  assert(upstream,filename+": vatímetro sin fuente L a su izquierda "+x+","+y);
  const l=point(upstream[0],upstream[1]),n=point(upstream[2],upstream[3]);
  assert.equal(root(point(x,y)),root(l),
   filename+": bobina I sin conexión a fase");
  assert.equal(root(point(x,y+width)),root(l),
   filename+": terminal C del vatímetro sin fase");
  assert.equal(root(point(x2,y2+width)),root(n),
   filename+": terminal V del vatímetro sin neutro");
  assert.notEqual(root(point(x2,y2)),root(l),
   filename+": bobina de corriente puenteada");
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

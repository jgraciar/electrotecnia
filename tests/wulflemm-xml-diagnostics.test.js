const assert=require('node:assert/strict');
const fs=require('node:fs');
const xml=fs.readFileSync(__dirname+'/fixtures/wulflemm-aron.xml','utf8');
const elements=[...xml.matchAll(/<([A-Za-z][\w-]*)\b([^<>]*?)\s*\/>/g)].map(([,type,raw])=>({type,attrs:Object.fromEntries([...raw.matchAll(/([\w-]+)="([^"]*)"/g)].map(([,k,v])=>[k,v]))}));
const count=t=>elements.filter(e=>e.type===t).length;
for(const [type,n] of Object.entries({WattmeterTrue:2,v:3,r:3,l:3,c:3,w:12}))assert.equal(count(type),n,type);
const sources=elements.filter(e=>e.type==='v');
assert.ok(sources.every(s=>Number(s.attrs.fr)===60),'Las fuentes no comparten 60 Hz');
const shifts=sources.map(s=>Number(s.attrs.phaseShift||0)).sort((a,b)=>a-b);
[-2*Math.PI/3,0,2*Math.PI/3].forEach((x,i)=>assert.ok(Math.abs(shifts[i]-x)<1e-10,'Desfase incorrecto'));
for(const meter of elements.filter(e=>e.type==='WattmeterTrue')){
  assert.equal(meter.attrs.meter,'1');
  assert.equal(meter.attrs.w,'32');
  assert.match(meter.attrs.x,/^\d+ \d+ \d+ \d+$/);
}
console.log('OK: XML de referencia preservado, dos vatímetros, tres fuentes a 60 Hz y ±120 grados.');
console.log('AVISO: esta prueba no comprueba simulación ni importación al motor.');

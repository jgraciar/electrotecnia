import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const src=readFileSync(new URL("../textbook-exercises.js",import.meta.url),"utf8");
const sandbox=vm.createContext({window:{},Math});
vm.runInContext(src,sandbox);
const lab=sandbox.window.LabTextbookExercises;
const cases=[
  [2,1,[1.2],[12,10]],
  [2,2,[1150],[230,1150]],
  [3,3,[4.6,1058],[230,50]],
  [3,5,[125,31.25],[125,31.25]],
  [3,6,[Math.sqrt(700*75.6)],[230,75.6]],
  [3,9,[4,14400000],null],
  [3,10,[120,10.8],null],
  [4,1,[600000,144000],null],
  [4,4,[2400000,10000000/3600,230**2/(10000000/3600)],[230,230**2/(10000000/3600)]],
  [4,5,[2.8,.25],[230,230**2/(10000000/3600)]],
  [4,6,[12.5,225000,168750/(7000*.11)],[125,10]]
];
assert.equal(lab.totalCatalogued,cases.length+6);
for(const [unit,number,expected,elec] of cases){
  const entry={unit,kind:"resuelta",number,id:"Actividad resuelta "+unit+"."+number};
  assert(lab.has(entry)&&lab.validate(entry));
  const x=lab.build(entry);
  assert(x.statement.length>20 && x.bookPage>0 && x.pdfPage===x.bookPage+26);
  assert.equal(x.questions.length,expected.length);
  expected.forEach((v,i)=>assert(Math.abs(x.questions[i].value-v)<=1e-8*Math.max(1,Math.abs(v))));
  if(elec){
    assert(x.circuit && x.measured.length===3);
    const parts=x.circuit.trim().split("\n");
    const R=parts.find(s=>s.startsWith("r ")).split(" ");
    const V=parts.find(s=>s.startsWith("v ")).split(" ");
    assert(Math.abs(Number(R[6])-elec[1])<1e-8);
    assert(Math.abs(Number(V[8])-elec[0])<1e-8);
    const ammeter=parts.find(s=>s.startsWith("370 ")).split(" ");
    const voltmeter=parts.find(s=>s.startsWith("p ")).split(" ");
    const wattmeter=parts.find(s=>s.startsWith("420 ")).split(" ");
    assert(ammeter.length>=8 && voltmeter.length>=9 && wattmeter.length>=8);
    // Comprobar escala explícita contra corriente y tensión del ejercicio.
    const expectedIScale=Math.abs(elec[0]/elec[1])>=1?1:Math.abs(elec[0]/elec[1])>=.001?2:3;
    const expectedVScale=Math.abs(elec[0])>=1?1:Math.abs(elec[0])>=.001?2:3;
    assert.equal(Number(ammeter[7]),expectedIScale,"Escala amperímetro");
    assert.equal(Number(voltmeter[7]),expectedVScale,"Escala voltímetro");
    assert.equal(x.meterScales.current,expectedIScale===1?"A":expectedIScale===2?"mA":"µA");
    assert.equal(x.meterScales.voltage,expectedVScale===1?"V":expectedVScale===2?"mV":"µV");
    assert.equal(x.meterScales.power,elec[0]**2/elec[1]>=1000?"kW":"W");
    assert(Math.abs(x.measured[0].value-elec[0]/elec[1])<1e-8);
    assert(Math.abs(x.measured[2].value-elec[0]*elec[0]/elec[1])<1e-8);
  }else assert.equal(x.circuit,null);
  console.log("Comprobación matemática y esquema: AR "+unit+"."+number+" OK");
}
assert(lab.has({unit:6,kind:"resuelta",number:1}));
console.log("Actividades originales:",lab.totalCatalogued);

const series=lab.build({unit:6,kind:"resuelta",number:1});
assert(series&&series.circuit&&series.questions.length===7);
assert.equal(series.questions[1].value,0.8);
assert.equal(series.questions[6].value,19.2);

for(const [n,answers] of [[2,[10,200,100,300,600,2000,1000,3000,6000]],[3,[2,80/230,80,330.625,661.25]]]){
 const x=lab.build({unit:6,kind:"resuelta",number:n});
 assert(x&&x.circuit&&x.questions.length===answers.length);
 answers.forEach((v,i)=>assert(Math.abs(x.questions[i].value-v)<1e-7));
 assert(x.circuit.includes("370 "));
}

const limiter=lab.build({unit:6,kind:"resuelta",number:4});
assert(limiter&&limiter.circuit&&limiter.questions.length===4);
assert.equal(limiter.questions[2].value,330);
assert(Math.abs(limiter.questions[3].value-43.63636363636)<1e-7);

const parallel=lab.build({unit:6,kind:"resuelta",number:6});
assert(parallel&&parallel.circuit&&parallel.questions.length===7);
[1.5,1.5,4.5,6,13.5,40.5,54].forEach((v,i)=>assert.equal(parallel.questions[i].value,v));
assert(parallel.circuit.includes("r 304 96 304 352 0 6"));
assert(parallel.circuit.includes("r 496 96 496 352 0 2"));

const three=lab.build({unit:6,kind:"resuelta",number:7});
assert(three&&three.circuit&&three.questions.length===5);
[100,2.5,2,10,14.5].forEach((v,i)=>assert.equal(three.questions[i].value,v));
assert(three.circuit.includes("r 688 96 688 352 0 10"));

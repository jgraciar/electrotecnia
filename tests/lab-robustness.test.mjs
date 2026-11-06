import assert from "node:assert/strict";
import {filteredBridgeStep} from "../scripts/LabFilteredBridge.ts";
import {currentHarmonics} from "../scripts/LabHarmonics.ts";

// Pruebas deterministas de límites y propiedades físicas del modelo de referencia.
const near=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t,`${a} != ${b}`);
const base={capacitorVoltage:0};
for(const bad of [NaN,Infinity,-Infinity]){
 assert.throws(()=>filteredBridgeStep(bad,2,200,.002,.00002,base),/Parámetros/);
 assert.throws(()=>filteredBridgeStep(10,2,200,.002,.00002,{capacitorVoltage:bad}),/Parámetros/);
 assert.throws(()=>currentHarmonics([1,2,3,4,5,6,7,bad],2),/Muestras/);
}
for(const bad of [0,-1,NaN,Infinity]){
 for(let j=1;j<=4;j++){
  const p=[10,2,200,.002,.00002,base];
  p[j]=bad;
  assert.throws(()=>filteredBridgeStep(...p),/Parámetros/);
 }
}
for(const n of [0,1,2,7,8,9,16]){
 const a=Array.from({length:n},()=>0);
 assert.throws(()=>currentHarmonics(a,Math.floor(n/2)),/Muestras/);
}
for(const order of [0,-1,1.5,NaN,Infinity]){
 assert.throws(()=>currentHarmonics(Array(32).fill(0),order),/Muestras/);
}
for(const voltage of [-325,-10,0,10,325]){
 const r=filteredBridgeStep(voltage,2,200,.002,.00002,base);
 assert(Number.isFinite(r.state.capacitorVoltage));
 assert(voltage*r.inputCurrent>=0);
}
const n=512;
const zero=currentHarmonics(Array(n).fill(0),20);
near(zero.totalRms,0);near(zero.dc,0);assert.equal(zero.thd,null);
const constant=currentHarmonics(Array(n).fill(5),20);
near(constant.dc,5);near(constant.totalRms,5);assert.equal(constant.thd,null);
for(const amplitude of [0.01,1,100]){
 const a=Array.from({length:n},(_,k)=>amplitude*Math.SQRT2*Math.sin(2*Math.PI*k/n));
 const spectrum=currentHarmonics(a,20);
 near(spectrum.totalRms,amplitude,1e-7);
 near(spectrum.fundamentalRms,amplitude,1e-7);
 assert(spectrum.thd<1e-6);
}
console.log("OK: robustez numérica, entradas inválidas, CC, corriente nula y THD.");

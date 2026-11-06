import assert from "node:assert/strict";
import {currentHarmonics} from "../scripts/LabHarmonics.ts";
import {filteredBridgeStep} from "../scripts/LabFilteredBridge.ts";
const near=(a,b,t=1e-7)=>assert(Math.abs(a-b)<t,`${a} != ${b}`);
const n=10000;
const sine=Array.from({length:n},(_,k)=>Math.SQRT2*5*Math.sin(2*Math.PI*k/n));
const pure=currentHarmonics(sine,15);
near(pure.fundamentalRms,5);near(pure.totalRms,5);
assert(pure.thd<1e-6);
const distorted=sine.map((x,k)=>x+Math.SQRT2*2*Math.sin(6*Math.PI*k/n)+3);
const spectrum=currentHarmonics(distorted,15);
near(spectrum.dc,3);near(spectrum.harmonics[2],2);
near(spectrum.thd,0.4);
const half=sine.map(x=>Math.max(0,x));
const rectified=currentHarmonics(half,20);
assert(rectified.dc>0&&rectified.thd>0.4);
const dt=1/(50*n),rs=2,r=200,c=0.002;
let state={capacitorVoltage:0},samples=[];
for(let k=0;k<20*n;k++){
 const source=230*Math.SQRT2*Math.sin(2*Math.PI*k/n);
 const step=filteredBridgeStep(source,rs,r,c,dt,state);
 state=step.state;
 if(k>=19*n)samples.push(step.inputCurrent);
}
const filtered=currentHarmonics(samples,25);
assert(filtered.thd>0.1,"La corriente del puente filtrado debe ser no sinusoidal");
assert(filtered.harmonics[2]>0,"Debe existir tercer armónico");
assert(Math.abs(filtered.dc)<filtered.fundamentalRms*0.01,"El puente simétrico no introduce CC apreciable");
console.log("OK: FFT discreta, THD, CC y rectificador filtrado.");

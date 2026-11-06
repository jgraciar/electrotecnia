import assert from "node:assert/strict";
import {filteredBridgeStep} from "../scripts/LabFilteredBridge.ts";

// Comprobar convergencia temporal y régimen periódico del modelo de referencia.
// Fuente de 10 V RMS para poder contrastar después con el circuito de navegador.
function run(stepsPerPeriod){
 const f=50,U=10,Rs=2,R=200,C=.002,cycles=80,dt=1/(f*stepsPerPeriod);
 let state={capacitorVoltage:0},last=[];
 const periodResults=[];
 for(let cycle=0;cycle<cycles;cycle++){
  let p=0,i2=0,u2=0,dc=0;
  for(let k=0;k<stepsPerPeriod;k++){
   const t=(cycle*stepsPerPeriod+k)*dt;
   const u=Math.SQRT2*U*Math.sin(2*Math.PI*f*t);
   const result=filteredBridgeStep(u,Rs,R,C,dt,state);
   state=result.state;
   p+=u*result.inputCurrent/stepsPerPeriod;
   i2+=result.inputCurrent**2/stepsPerPeriod;
   u2+=u*u/stepsPerPeriod;
   dc+=state.capacitorVoltage/stepsPerPeriod;
  }
  periodResults.push({P:p,S:Math.sqrt(i2*u2),vdc:dc});
 }
 last=periodResults.slice(-2);
 const a=last[0],b=last[1];
 for(const key of ["P","S","vdc"]){
  assert(Math.abs(a[key]-b[key])<Math.max(1e-4,Math.abs(b[key])*0.001),
   `Sin régimen permanente para ${key}: ${a[key]} / ${b[key]}`);
 }
 return b;
}
const coarse=run(1000),fine=run(2000);
for(const key of ["P","S","vdc"]){
 const relative=Math.abs(coarse[key]-fine[key])/Math.max(1e-12,Math.abs(fine[key]));
 assert(relative<0.03,`No converge ${key} al reducir el paso: ${relative}`);
}
assert(fine.P>0&&fine.S>=fine.P);
console.log("OK: régimen periódico y convergencia temporal de la referencia a 10 V:",{coarse,fine});

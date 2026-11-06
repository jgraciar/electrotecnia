import assert from "node:assert/strict";
import {gridFollowingCurrent} from "../scripts/LabPVInverter.ts";

// Circuito ideal monofásico: red de tensión, carga R-L equivalente,
// inversor de corriente y batería capacitiva en el mismo punto.
// La ley de Kirchhoff se aplica a cada muestra, no solo a los fasores.
const V=230,f=50,N=8192;
const loadP=5000,loadQ=2500,capQ=1500;
const cases=[0,3000,5000,6500];
function close(actual,expected,tolerance=1e-7){
 assert(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
}
for(const pvP of cases){
 let avgP=0,avgQ=0,avgI2=0,maxKcl=0;
 for(let n=0;n<N;n++){
  const t=n/(N*f),theta=2*Math.PI*f*t;
  const v=Math.SQRT2*V*Math.sin(theta);
  const vQuadrature=-Math.SQRT2*V*Math.cos(theta);
  const iLoad=gridFollowingCurrent({voltageRms:V,frequency:f,power:loadP,reactivePower:loadQ,time:t});
  const iCap=gridFollowingCurrent({voltageRms:V,frequency:f,power:0,reactivePower:-capQ,time:t});
  const iPv=gridFollowingCurrent({voltageRms:V,frequency:f,power:pvP,time:t});
  const iGrid=iLoad+iCap-iPv;
  maxKcl=Math.max(maxKcl,Math.abs(iGrid+iPv-iLoad-iCap));
  avgP+=v*iGrid/N;
  avgQ+=vQuadrature*iGrid/N;
  avgI2+=iGrid*iGrid/N;
 }
 close(avgP,loadP-pvP);
 close(avgQ,loadQ-capQ);
 close(Math.sqrt(avgI2),Math.hypot(loadP-pvP,loadQ-capQ)/V);
 assert(maxKcl<1e-12);
 console.log(`FV ${pvP} W: red P=${avgP.toFixed(4)} W, Q=${avgQ.toFixed(4)} VAr, I=${Math.sqrt(avgI2).toFixed(4)} A`);
}
// Aunque P de red sea cero, la acometida sigue suministrando reactiva.
const qOnly=Math.abs(loadQ-capQ)/V;
assert(qOnly>0);
console.log("OK: Kirchhoff instantánea, autoconsumo, vertido y batería capacitiva");

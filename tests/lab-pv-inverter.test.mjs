import assert from "node:assert/strict";
import {gridFollowingSample,gridFollowingCurrent} from "../scripts/LabPVInverter.ts";
function close(actual,expected,tolerance=1e-8){
 assert(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
}
function integrate(power,reactivePower){
 const N=4096,settings={voltageRms:230,frequency:50,power,reactivePower};
 let sumP=0,sumQ=0,sumI2=0;
 for(let n=0;n<N;n++){
  const time=n/(N*settings.frequency),phase=2*Math.PI*n/N;
  const {voltage,current}=gridFollowingSample({...settings,time});
  sumP+=voltage*current/N;
  sumQ+=(-Math.SQRT2*settings.voltageRms*Math.cos(phase))*current/N;
  sumI2+=current*current/N;
 }
 close(sumP,power,1e-7);
 close(sumQ,reactivePower,1e-7);
 close(Math.sqrt(sumI2),Math.hypot(power,reactivePower)/230,1e-7);
}
integrate(3000,0);
integrate(3000,1200);
integrate(0,-1500);
integrate(-500,0);
const p={voltageRms:230,frequency:50,power:3000,time:0.005};
close(gridFollowingCurrent(p),Math.SQRT2*3000/230);
assert.throws(()=>gridFollowingCurrent({...p,voltageRms:0}));
console.log("OK: corriente sincronizada, potencia P/Q y corriente RMS");

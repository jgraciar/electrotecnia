import assert from "node:assert/strict";
import {filteredBridgeStep} from "../scripts/LabFilteredBridge.ts";
import {currentHarmonics} from "../scripts/LabHarmonics.ts";

// Referencia ideal: potencia y distorsión de un puente monofásico con filtro C.
// Este ensayo no sustituye la medición del elemento eléctrico en CircuitJS.
const f=50,urms=230,rs=2,load=200,c=0.002;
const perCycle=2000,cycles=30,dt=1/(f*perCycle);
let state={capacitorVoltage:0};
const u=[],i=[],loadP=[],lossP=[];
for(let k=0;k<perCycle*cycles;k++){
 const voltage=Math.SQRT2*urms*Math.sin(2*Math.PI*k/perCycle);
 const result=filteredBridgeStep(voltage,rs,load,c,dt,state);
 state=result.state;
 if(k>=perCycle*(cycles-1)){
  u.push(voltage);
  i.push(result.inputCurrent);
  loadP.push(state.capacitorVoltage**2/load);
  lossP.push(result.inputCurrent**2*rs);
 }
}
const average=a=>a.reduce((sum,v)=>sum+v,0)/a.length;
const rms=a=>Math.sqrt(average(a.map(x=>x*x)));
const P=average(u.map((v,k)=>v*i[k]));
const S=rms(u)*rms(i);
const pf=P/S;
const spec=currentHarmonics(i,35);
const cosPhi1=(()=>{
 const a=average(i.map((v,k)=>v*Math.sin(2*Math.PI*k/perCycle)));
 const b=average(i.map((v,k)=>v*Math.cos(2*Math.PI*k/perCycle)));
 return a/Math.hypot(a,b);
})();
assert(P>0&&S>=P&&pf>0&&pf<1);
assert(spec.thd>0.05,"El condensador debe producir distorsión de corriente");
assert(Math.abs(cosPhi1)<=1+1e-8);
assert(Math.abs(pf-cosPhi1/Math.sqrt(1+spec.thd**2))<0.015,
 "Para tensión sinusoidal sin CC: FP = cosφ1 / √(1+THD²)");
assert(P>=average(loadP)+average(lossP)-1,
 "La potencia de entrada no debe ser menor que la carga y las pérdidas");
assert(P<=average(loadP)+average(lossP)+2,
 "Balance energético de régimen permanente fuera de tolerancia");
console.log("OK referencia puente filtrado:",{P,S,pf,cosPhi1,thd:spec.thd,
 loadPower:average(loadP),seriesLoss:average(lossP)});

import assert from "node:assert/strict";
import {pvThreePhaseBalance} from "../scripts/LabPVThreePhaseBalance.ts";
import {pvGridBalance} from "../scripts/LabPVGridBalance.ts";

// U_LL=400 V y U_FN=400/sqrt(3) V, aproximado a 230 V.
const close=(actual,expected,eps=1e-8)=>{
 assert(Number.isFinite(actual), "Magnitud no finita");
 assert(Math.abs(actual-expected)<eps,`${actual} != ${expected}`);
};
const balanced=pvThreePhaseBalance({
 lineVoltage:400,loadP:[12,12,12],loadQ:[8,8,8],
 pvP:[2,2,2],capacitorQ:[4,4,4]
});
const reference=pvGridBalance({
 loadP:36,loadQ:24,pvP:6,capacitorQ:12,voltage:400,phases:3
});
close(balanced.totalGridP,reference.gridP);
close(balanced.totalGridQ,reference.gridQ);
close(balanced.balancedReferenceLineCurrent,reference.gridCurrent);
for(const phase of balanced.phases)
 close(phase.gridCurrent,reference.gridCurrent);
close(balanced.neutralCurrent,0);
close(balanced.maxLineCurrent,reference.gridCurrent);

// FV trifásica equilibrada de 6 kW, demanda desequilibrada.
// El balance neto en el PCC es P=0 aunque L1 exporta 1,3 kW.
const unbalanced=pvThreePhaseBalance({
 lineVoltage:400,
 loadP:[0.7,2,3.3],loadQ:[0.2,0.6,1],
 pvP:[2,2,2]
});
close(unbalanced.totalGridP,0);
close(unbalanced.totalGridQ,1.8);
close(unbalanced.phases[0].gridP,-1.3);
close(unbalanced.phases[1].gridP,0);
close(unbalanced.phases[2].gridP,1.3);
close(unbalanced.simultaneousPhaseImportP,1.3);
close(unbalanced.simultaneousPhaseExportP,1.3);
assert(unbalanced.maxLineCurrent>unbalanced.balancedReferenceLineCurrent*2);
assert(unbalanced.neutralCurrent>10);
assert(unbalanced.neutralCurrent<10.3);
assert(unbalanced.phases[0].gridCurrent>0);
// P_total=0 no implica P_por_fase>=0, ni I_neutro=0.
// No se infiere cumplimiento regulatorio de un control antivertido.

// Industria: FV equilibrada 10 kW y escalón trifásico comercial 12,5 kVAr.
// El banco compensa Q global, pero dos fases quedan capacitivas.
const step=12.5/3;
const industrial=pvThreePhaseBalance({
 lineVoltage:400,
 loadP:[10,20,30],loadQ:[1,3,12],
 pvP:[10/3,10/3,10/3],capacitorQ:[step,step,step]
});
close(industrial.totalGridP,50);
close(industrial.totalGridQ,3.5);
assert(industrial.phases[0].gridQ<0);
assert(industrial.phases[1].gridQ<0);
assert(industrial.phases[2].gridQ>0);
close(industrial.phases.reduce((sum,p)=>sum+p.gridQ,0),3.5);
assert(industrial.neutralCurrent>0);
assert(industrial.maxLineCurrent>industrial.balancedReferenceLineCurrent);
assert(industrial.phases[2].gridCurrent>industrial.phases[0].gridCurrent);

// Potencia reactiva aportada por un inversor trifásico equilibrado.
const reactive=pvThreePhaseBalance({
 lineVoltage:400,loadP:[4,4,4],loadQ:[3,3,3],
 pvP:[2,2,2],pvQ:[1,1,1],capacitorQ:[1,1,1]
});
close(reactive.totalGridP,6);
close(reactive.totalGridQ,3);
close(reactive.neutralCurrent,0);
for(const phase of reactive.phases)
 close(phase.gridCurrent,Math.hypot(2,1)*1000/(400/Math.sqrt(3)));

// Rechazar vectores incompletos, magnitudes no finitas y potencias negativas.
const input={lineVoltage:400,loadP:[1,1,1],loadQ:[0,0,0],pvP:[0,0,0]};
assert.throws(()=>pvThreePhaseBalance({...input,lineVoltage:0}));
assert.throws(()=>pvThreePhaseBalance({...input,loadP:[1,2]}));
assert.throws(()=>pvThreePhaseBalance({...input,pvP:[-1,0,0]}));
assert.throws(()=>pvThreePhaseBalance({...input,pvQ:[0,Infinity,0]}));
console.log("OK: 400 V trifásica; equilibrio/desequilibrio, I_neutro, vertido por fase y escalón de 12,5 kVAr");

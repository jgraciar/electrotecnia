import assert from "node:assert/strict";
import {pvGridBalance} from "../scripts/LabPVGridBalance.ts";
import {selectCapacitorSteps} from "../scripts/LabPVCapacitorController.ts";

// Comprobaciones cruzadas: modelo fasorial y regulador de escalones.
// Unidades: kW, kVAr, V entre fases y A.
const loadP=100, loadQ=75, steps=[12.5,12.5,25], voltage=400;
const close=(actual,expected,tolerance=1e-8)=>{
 assert(Number.isFinite(actual),`Magnitud no finita: ${actual}`);
 assert(Math.abs(actual-expected)<=tolerance,`${actual} != ${expected}`);
};
for(const pvP of [0,25,60,99.9,100,100.1,120,150]){
 const before=pvGridBalance({loadP,loadQ,pvP,voltage});
 const selection=selectCapacitorSteps({
  gridP:before.gridP,reactiveBeforeCapacitors:before.gridQ,
  steps,targetCosPhi:0.95
 });
 const after=pvGridBalance({
  loadP,loadQ,pvP,voltage,capacitorQ:selection.capacitorQ
 });
 close(after.gridP,before.gridP);
 close(after.gridQ,selection.gridQ);
 // Balance fasorial de corrientes en el PCC, por fase.
 // La corriente del condensador se define absorbida por su rama: Ired + IFV = Icarga + Ic.
 // Referencia de tensión real: I = (P - jQ)/(sqrt(3) U_LL).
 const currentPhasor=(P,Q)=>({
  real:P*1000/(Math.sqrt(3)*voltage),
  imag:-Q*1000/(Math.sqrt(3)*voltage)
 });
 const loadI=currentPhasor(loadP,loadQ);
 const pvI=currentPhasor(pvP,0);
 const capacitorI=currentPhasor(0,-selection.capacitorQ);
 const gridI=currentPhasor(after.gridP,after.gridQ);
 close(gridI.real+pvI.real-capacitorI.real,loadI.real);
 close(gridI.imag+pvI.imag-capacitorI.imag,loadI.imag);
 close(Math.hypot(gridI.real,gridI.imag),after.gridCurrent);
 close(after.gridS,Math.hypot(after.gridP,after.gridQ));
 close(after.gridCurrent,after.gridS*1000/(Math.sqrt(3)*voltage));
 close(after.importedP-after.exportedP,after.gridP);
 close(after.selfConsumedP+after.importedP,loadP);
 close(after.selfConsumedP+after.exportedP,pvP);
 assert(after.gridCurrent>=0);
 assert(selection.selected.every(i=>Number.isInteger(i)&&i>=0&&i<steps.length));
 if(before.gridP<=0.1){
  assert.equal(selection.action,"hold");
  close(selection.capacitorQ,0);
 }else{
  assert.equal(selection.action,"recommend");
  assert(after.gridQ>=-1e-8,"Sobrecompensación no autorizada");
  assert(after.gridCurrent<=before.gridCurrent+1e-8,
   "La regulación no debe incrementar la corriente para este perfil inductivo");
 }
}
for(const pvP of [100,120]){
 const before=pvGridBalance({loadP,loadQ,pvP,voltage});
 const selection=selectCapacitorSteps({
  gridP:before.gridP,reactiveBeforeCapacitors:before.gridQ,
  steps,currentSelected:[0,2]
 });
 assert.equal(selection.action,"hold");
 assert.deepEqual(selection.selected,[0,2]);
 close(selection.capacitorQ,37.5);
 close(selection.gridQ,37.5);
}
// Autoconsumo total no implica corriente de acometida nula si queda Q.
// La FV puede aportar Q; los condensadores aportan Q capacitiva.
{
 const noCompensation=pvGridBalance({loadP:100,loadQ:75,pvP:100,voltage:400});
 close(noCompensation.gridP,0);
 close(noCompensation.gridQ,75);
 close(noCompensation.gridCurrent,75000/(Math.sqrt(3)*400));
 assert(noCompensation.activeZeroReactiveNonzero);
 const capacitorOnly=pvGridBalance({loadP:100,loadQ:75,pvP:100,capacitorQ:50,voltage:400});
 close(capacitorOnly.gridQ,25);
 close(capacitorOnly.gridCurrent,25000/(Math.sqrt(3)*400));
 const pvAndCapacitor=pvGridBalance({loadP:100,loadQ:75,pvP:100,pvQ:25,capacitorQ:50,voltage:400});
 close(pvAndCapacitor.gridP,0);
 close(pvAndCapacitor.gridQ,0);
 close(pvAndCapacitor.gridCurrent,0);
 assert.equal(pvAndCapacitor.activeZeroReactiveNonzero,false);
 const exportWithReactive=pvGridBalance({loadP:100,loadQ:75,pvP:120,pvQ:25,capacitorQ:50,voltage:400});
 close(exportWithReactive.gridP,-20);
 close(exportWithReactive.gridQ,0);
 close(exportWithReactive.exportedP,20);
 close(exportWithReactive.gridCurrent,20000/(Math.sqrt(3)*400));
}
console.log("OK: balance P/Q, corriente, autoconsumo y bloqueo del regulador FV");

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
console.log("OK: balance P/Q, corriente, autoconsumo y bloqueo del regulador FV");

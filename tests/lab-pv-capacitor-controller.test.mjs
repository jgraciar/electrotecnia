import assert from "node:assert/strict";
import {selectCapacitorSteps} from "../scripts/LabPVCapacitorController.ts";
const steps=[12.5,12.5,25];
const config={reactiveBeforeCapacitors:75,steps,targetCosPhi:0.95};
const import100=selectCapacitorSteps({...config,gridP:100});
assert.equal(import100.mode,"import-regulation");
assert.equal(import100.capacitorQ,37.5);
assert.equal(import100.gridQ,37.5);
const import40=selectCapacitorSteps({...config,gridP:40});
assert.equal(import40.mode,"import-regulation");
assert.equal(import40.capacitorQ,50);
assert.equal(import40.gridQ,25);
for(const gridP of [0,0.05,-20]){
 const state=selectCapacitorSteps({...config,gridP});
 assert.equal(state.action,"hold");
 assert.equal(state.capacitorQ,0);
 assert.equal(state.gridQ,75);
}
// En bloqueo, los contactores que ya estaban cerrados permanecen cerrados.
for(const gridP of [0,-20]){
 const held=selectCapacitorSteps({...config,gridP,currentSelected:[0,2]});
 assert.equal(held.action,"hold");
 assert.deepEqual(held.selected,[0,2]);
 assert.equal(held.capacitorQ,37.5);
 assert.equal(held.gridQ,37.5);
}
assert.throws(()=>selectCapacitorSteps({...config,gridP:0,currentSelected:[3]}));
const over=selectCapacitorSteps({
 gridP:40,reactiveBeforeCapacitors:10,steps:[12.5,25],targetCosPhi:0.95
});
assert.equal(over.capacitorQ,0);
assert.equal(over.gridQ,10);
const allowed=selectCapacitorSteps({
 gridP:40,reactiveBeforeCapacitors:10,steps:[12.5,25],targetCosPhi:1,allowCapacitive:true
});
assert.equal(allowed.capacitorQ,12.5);
assert.equal(allowed.gridQ,-2.5);
console.log("OK: regulación discreta, bloqueo en P≈0 y exportación, y sobrecompensación");

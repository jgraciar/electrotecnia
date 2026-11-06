import assert from "node:assert/strict";
import {capacitorContactorTransition as next} from "../scripts/LabPVCapacitorContactors.ts";
const base={stepCount:3,minimumDwell:5,minimumDischarge:60};
let a=next({...base,currentSelected:[],requestedSelected:[0,1,2],now:0});
assert.equal(a.action,"close");assert.deepEqual(a.selected,[0]);
let b=next({...base,...a,currentSelected:a.selected,requestedSelected:[0,1,2],now:1});
assert.equal(b.action,"wait-dwell");assert.deepEqual(b.selected,[0]);
let c=next({...base,...a,currentSelected:a.selected,requestedSelected:[0,1,2],now:5});
assert.equal(c.action,"close");assert.deepEqual(c.selected,[0,1]);
let d=next({...base,...c,currentSelected:c.selected,requestedSelected:[],now:10});
assert.equal(d.action,"open");assert.equal(d.step,0);
assert.deepEqual(d.selected,[1]);
let e=next({...base,...d,currentSelected:d.selected,requestedSelected:[0,1],now:15});
assert.equal(e.action,"wait-discharge");assert.deepEqual(e.selected,[1]);
let f=next({...base,...d,currentSelected:d.selected,requestedSelected:[0,1],now:70});
assert.equal(f.action,"close");assert.deepEqual(f.selected,[0,1]);
let held=next({...base,currentSelected:[0,2],requestedSelected:[0,2],now:100});
assert.equal(held.action,"none");assert.deepEqual(held.selected,[0,2]);
assert.throws(()=>next({...base,currentSelected:[0,0],requestedSelected:[],now:0}));

 
// Si hay que sustituir escalones, se abre primero el existente.
const replacement=next({...base,currentSelected:[0],requestedSelected:[1],now:100});
assert.equal(replacement.action,"open");
assert.equal(replacement.step,0);
assert.deepEqual(replacement.selected,[]);
const premature=next({...base,...replacement,currentSelected:[],requestedSelected:[1],now:104});
assert.equal(premature.action,"wait-dwell");
const afterDwell=next({...base,...replacement,currentSelected:[],requestedSelected:[1],now:105});
assert.equal(afterDwell.action,"close");
assert.deepEqual(afterDwell.selected,[1]);

// Si un escalón sigue descargándose, se permite conectar otro disponible.
const alternative=next({...base,currentSelected:[],requestedSelected:[0,2],now:120,
 lastOpenedAt:[100]});
assert.equal(alternative.action,"close");
assert.equal(alternative.step,2);
assert.deepEqual(alternative.selected,[2]);

// El secuenciador conserva el estado y nunca conmuta dos escalones a la vez.
let state={selected:[],lastSwitchAt:-Infinity,lastOpenedAt:[]};
for(const t of [0,5,10]){
 const change=next({...base,currentSelected:state.selected,requestedSelected:[0,1,2],
  now:t,lastSwitchAt:state.lastSwitchAt,lastOpenedAt:state.lastOpenedAt});
 assert.equal(change.action,"close");
 assert.equal(change.selected.length,state.selected.length+1);
 state=change;
}
assert.deepEqual(state.selected,[0,1,2]);
const stable=next({...base,currentSelected:state.selected,requestedSelected:[0,1,2],
 now:15,lastSwitchAt:state.lastSwitchAt,lastOpenedAt:state.lastOpenedAt});
assert.equal(stable.action,"none");

// Validación de parámetros e índices; entradas erróneas no pueden provocar maniobras.
for(const invalid of [
 {stepCount:17},{minimumDwell:-1},{minimumDischarge:-1},
 {now:Infinity},{lastSwitchAt:NaN},{lastOpenedAt:[NaN]},
 {currentSelected:[3]},{requestedSelected:[-1]},
 {requestedSelected:[1,1]}
]){
 assert.throws(()=>next({...base,currentSelected:[],requestedSelected:[],
  now:0,...invalid}),"Debe rechazarse "+JSON.stringify(invalid));
}

console.log("OK: secuencia de contactores, espera mínima y descarga antes de reconexión");

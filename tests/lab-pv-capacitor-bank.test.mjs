import assert from "node:assert/strict";
import {pvGridBalance} from "../scripts/LabPVGridBalance.ts";

// Batería de escalones discretos: medida en el punto de conexión (PCC).
// No se debe cerrar un escalón por un cos(phi) bajo si P≈0,
// ni tratar la exportación activa como consumo inductivo.
const loadP=100,loadQ=75,voltage=400;
const steps=[12.5,12.5,25]; // kVAr
function state(pvP,closed=[]){
 const capacitorQ=closed.reduce((sum,i)=>sum+steps[i],0);
 return pvGridBalance({loadP,loadQ,pvP,capacitorQ,voltage});
}
function close(actual,expected,eps=1e-9){
 assert(Math.abs(actual-expected)<eps,`${actual} != ${expected}`);
}
for(const pvP of [0,60,100,120]){
 const a=state(pvP,[]);
 const b=state(pvP,[0,1,2]);
 close(a.gridP,100-pvP);
 close(a.gridQ,75);
 close(b.gridP,100-pvP);
 close(b.gridQ,25);
 close(a.gridCurrent,Math.hypot(100-pvP,75)*1000/(Math.sqrt(3)*400));
 close(b.gridCurrent,Math.hypot(100-pvP,25)*1000/(Math.sqrt(3)*400));
 assert(b.gridCurrent<a.gridCurrent,"La compensación reduce corriente en este caso");
 assert(b.absCosPhi>=a.absCosPhi || pvP===100);
 console.log(`FV ${pvP} kW: red ${b.gridP} kW, ${b.gridQ} kVAr, I=${b.gridCurrent.toFixed(4)} A, |cosφ|=${b.absCosPhi.toFixed(4)}`);
}
const zero=state(100,[0,1,2]);
assert(zero.activeZeroReactiveNonzero);
close(zero.gridCurrent,25e3/(Math.sqrt(3)*400));
close(zero.absCosPhi,0);
const exportCase=state(120,[0,1,2]);
assert.equal(exportCase.gridDirection,"export");
assert.equal(exportCase.reactiveDirection,"inductive");
const overcompensated=pvGridBalance({loadP,loadQ,pvP:60,capacitorQ:100,voltage});
assert.equal(overcompensated.reactiveDirection,"capacitive");
close(overcompensated.gridQ,-25);
console.log("OK: escalones, reactiva en autoconsumo total, exportación y sobrecompensación");

import assert from "node:assert/strict";
import {pvGridBalance} from "../scripts/LabPVGridBalance.ts";
const base={loadP:100,loadQ:75,pvP:0,capacitorQ:50,voltage:400,phases:3};
function close(a,b){assert(Math.abs(a-b)<1e-8,`${a} != ${b}`);}
const cases=[
 {pvP:0,gridP:100,gridQ:25,direction:"import"},
 {pvP:60,gridP:40,gridQ:25,direction:"import"},
 {pvP:100,gridP:0,gridQ:25,direction:"zero"},
 {pvP:120,gridP:-20,gridQ:25,direction:"export"}
];
for(const c of cases){
 const r=pvGridBalance({...base,pvP:c.pvP});
 close(r.gridP,c.gridP);close(r.gridQ,c.gridQ);
 assert.equal(r.gridDirection,c.direction);
 close(r.gridS,Math.hypot(c.gridP,c.gridQ));
 close(r.gridCurrent,r.gridS*1000/(Math.sqrt(3)*400));
 close(r.importedP-r.exportedP,r.gridP);
}
const zero=pvGridBalance({...base,pvP:100});
assert.equal(zero.activeZeroReactiveNonzero,true);
assert(zero.gridCurrent>0);
const over=pvGridBalance({...base,pvP:60,capacitorQ:100});
assert.equal(over.reactiveDirection,"capacitive");
close(over.gridQ,-25);
const compensated=pvGridBalance({...base,pvP:60,pvQ:25});
close(compensated.gridQ,0);
close(compensated.absCosPhi,1);
assert.throws(()=>pvGridBalance({...base,voltage:0}));
assert.throws(()=>pvGridBalance({...base,phases:2}));
console.log("OK: balance FV-red, importación, vertido, reactiva y batería de condensadores");

import assert from "node:assert/strict";
import {commercialPVPower,islandReferenceVoltage,islandOutputResistance}
 from "../scripts/LabPVInverter.ts";

const near=(x,y,t=1e-8)=>assert(Math.abs(x-y)<t,`${x} != ${y}`);
// Ficha comercial: 5 kW activos nominales y 5,5 kVA de potencia
// aparente máxima. El usuario no introduce desfase, ni Q por defecto.
const c={entry:"P",value:3000,cosPhi:1,sense:"inductivo",
 ratedActive:5000,ratedApparent:5500};
let p=commercialPVPower(c);
near(p.p,3000);near(p.q,0);near(p.s,3000);
assert.equal(p.limited,false);
p=commercialPVPower({...c,value:6000});
near(p.p,5000);near(p.s,5000);assert.equal(p.limited,true);
p=commercialPVPower({...c,value:5000,cosPhi:0.9});
near(p.s,5500);near(p.p,4950);
near(p.q,5500*Math.sqrt(1-0.9**2));
assert.equal(p.limited,true);
const pc=commercialPVPower({...c,entry:"S",value:5500,
 cosPhi:.95,sense:"capacitivo"});
near(pc.s,5000/.95);near(pc.p,5000);
assert(pc.q<0);
assert.throws(()=>commercialPVPower({...c,ratedActive:0}));
assert.throws(()=>commercialPVPower({...c,ratedApparent:0}));
assert.throws(()=>commercialPVPower({...c,cosPhi:1.1}));
assert.throws(()=>commercialPVPower({...c,value:-1}));
// En aislada, la tensión (y no una potencia activa fija) es la consigna.
const v={voltageRms:230,frequency:50,ratedApparent:5500};
near(islandReferenceVoltage(v,0),0);
near(islandReferenceVoltage(v,0.005),230*Math.SQRT2);
near(islandReferenceVoltage({...v,frequency:60},1/240),230*Math.SQRT2);
near(islandOutputResistance(v),.01*230**2/5500);
assert.throws(()=>islandOutputResistance({...v,voltageRms:0}));
console.log("OK: Pn y Smax comerciales, límite P/S, cosφ opcional; aislada U/f independientes");
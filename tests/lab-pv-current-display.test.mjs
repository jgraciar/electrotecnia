import assert from "node:assert/strict";
import { LabPowerMeasurement } from "../scripts/LabPowerMeasurement.ts";
import { inverterCurrentDisplay } from "../scripts/LabPVInverter.ts";

const meter=new LabPowerMeasurement();
const f=50,I=7,offset=1.2,dt=0.0001;
const verify=(actual,expected,tolerance,label)=>{
 assert(Number.isFinite(actual),label+": valor no finito");
 assert(Math.abs(actual-expected)<tolerance,
  label+": "+actual+" ≠ "+expected);
};
assert.equal(inverterCurrentDisplay(meter,0,f).value,null);
for(let k=0;k<=3000;k++){
 const t=k*dt;
 const current=offset+Math.SQRT2*I*Math.sin(2*Math.PI*f*t);
 meter.add(t,0,current);
}
const rms=inverterCurrentDisplay(meter,0,f);
const mean=inverterCurrentDisplay(meter,1,f);
const instant=inverterCurrentDisplay(meter,2,f);
assert.equal(rms.label,"I [RMS]");
assert.equal(mean.label,"I [media]");
assert.equal(instant.label,"i(t)");
verify(rms.value,Math.hypot(I,offset),0.03,"I RMS");
verify(mean.value,offset,0.03,"I media algebraica");
verify(instant.value,offset,0.03,"i(t) instantánea");
assert(rms.value>mean.value);
const pure=new LabPowerMeasurement();
for(let k=0;k<=2500;k++){
 const t=k*dt;
 pure.add(t,0,Math.SQRT2*5*Math.sin(2*Math.PI*60*t));
}
verify(inverterCurrentDisplay(pure,0,60).value,5,0.03,"I RMS red 60 Hz");
verify(inverterCurrentDisplay(pure,1,60).value,0,0.03,
 "I media sinusoidal (debe ser nula)");
const dc=new LabPowerMeasurement();
for(let k=0;k<=500;k++)dc.add(k*dt,0,2.5);
verify(inverterCurrentDisplay(dc,0,50).value,2.5,.0001,"I RMS constante");
verify(inverterCurrentDisplay(dc,1,50).value,2.5,.0001,"I media constante");
assert.throws(()=>inverterCurrentDisplay(meter,3,50));
const reset=new LabPowerMeasurement();
reset.add(0,0,0);
reset.add(.005,0,4);
assert.equal(inverterCurrentDisplay(reset,0,50).value,null,
 "No ofrecer RMS sin un ciclo completo");
console.log("OK: inversor indica I RMS por defecto y permite media algebraica o i(t)");

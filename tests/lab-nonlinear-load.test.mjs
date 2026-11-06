import assert from "node:assert/strict";
import {halfWaveCurrent,halfWaveReference,fullWaveInputCurrent,fullWaveReference} from "../scripts/LabNonlinearLoad.ts";
const close=(a,b)=>assert(Math.abs(a-b)<1e-10*Math.max(1,Math.abs(b)));
const R=100,U=230;
const ref=halfWaveReference(U,R);
close(ref.p,264.5);
close(ref.s,264.5*Math.SQRT2);
close(ref.powerFactor,1/Math.SQRT2);
close(ref.cosPhi,1);
close(halfWaveCurrent(325,R),3.25);
close(halfWaveCurrent(-325,R),0);
close(halfWaveCurrent(-325,R,"negative"),-3.25);
close(halfWaveCurrent(325,R,"negative"),0);
assert.throws(()=>halfWaveCurrent(12,0),/R debe/);
assert.throws(()=>halfWaveCurrent(Infinity,100),/tensión/);
assert.throws(()=>halfWaveReference(0,100),/tensión eficaz/);
// Integración numérica independiente de las expresiones analíticas.
let sumP=0,sumI2=0;
const n=20000;
for(let k=0;k<n;k++){
    const v=Math.SQRT2*U*Math.sin(2*Math.PI*(k+.5)/n);
    const i=halfWaveCurrent(v,R);
    sumP+=v*i/n;
    sumI2+=i*i/n;
}
close(sumP,ref.p);
close(U*Math.sqrt(sumI2),ref.s);
console.log("OK: modelo de referencia de rectificador ideal de media onda.");

const full=fullWaveReference(U,R);
close(full.p,U*U/R);
close(full.s,U*U/R);
close(full.cosPhi,1);
close(full.powerFactor,1);
close(full.currentRms,U/R);
close(fullWaveInputCurrent(325,R),3.25);
close(fullWaveInputCurrent(-325,R),-3.25);
assert.throws(()=>fullWaveInputCurrent(12,0),/R debe/);
assert.throws(()=>fullWaveReference(0,R),/tensión eficaz/);
let fullP=0,fullI2=0;
for(let k=0;k<n;k++){
    const v=Math.SQRT2*U*Math.sin(2*Math.PI*(k+.5)/n);
    const i=fullWaveInputCurrent(v,R);
    fullP+=v*i/n;
    fullI2+=i*i/n;
}
close(fullP,full.p);
close(U*Math.sqrt(fullI2),full.s);
console.log("OK: puente ideal sin filtro, entrada sinusoidal y f.d.p. unitario.");

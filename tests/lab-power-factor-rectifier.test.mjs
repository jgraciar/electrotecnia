import assert from "node:assert/strict";
import {LabPowerMeasurement} from "../scripts/LabPowerMeasurement.ts";
import {filteredBridgeStep} from "../scripts/LabFilteredBridge.ts";

// Caso de diagnóstico: 81 kW trifásicos, 420 V entre fases, cosφ₁=0,86.
// El rectificador está conectado únicamente a L1-N; modelo de red ideal
// con 2 Ω de resistencia serie en la rama rectificadora.
const f=50, dt=0.00005, u=420/Math.sqrt(3), phi=Math.acos(0.86);
const baseI=81000/(3*u*0.86), omega=2*Math.PI*f;
const baseline=new LabPowerMeasurement(), combined=new LabPowerMeasurement();
const rectifier=new LabPowerMeasurement();
let state={capacitorVoltage:0};
for(let k=0;k<=24000;k++){
  const t=k*dt, v=Math.SQRT2*u*Math.sin(omega*t);
  const base=Math.SQRT2*baseI*Math.sin(omega*t-phi);
  const step=filteredBridgeStep(v,2,20,0.0022,dt,state);
  state=step.state;
  baseline.add(t,v,base);
  combined.add(t,v,base+step.inputCurrent);
  rectifier.add(t,v,step.inputCurrent);
}
const a=baseline.measure("ac"),b=combined.measure("ac"),c=rectifier.measure("ac");
for(const [name,m] of [["sin rectificador",a],["con rectificador",b],["rectificador",c]]){
  assert.equal(m.kind,"ac",name);
  assert(Number.isFinite(m.powerFactor)&&Number.isFinite(m.cosPhi)&&
    Number.isFinite(m.thdCurrent),name+": lecturas inválidas");
}
assert(Math.abs(a.powerFactor-0.86)<0.01,"Referencia de factor de potencia incorrecta");
assert(a.thdCurrent<0.01,"La carga original debe ser sinusoidal");
assert(c.thdCurrent>0.1,"El rectificador debe producir armónicos de corriente");
assert(Math.abs(b.powerFactor-a.powerFactor)>0.0001,
  "La carga rectificadora debe cambiar el f.d.p. de L1 en cuatro decimales");
assert(b.thdCurrent>a.thdCurrent+0.01,
  "La THD de L1 debe aumentar al conectar el rectificador");
console.log("Diagnóstico L1-N:",JSON.stringify({
  antes:{cosPhi:a.cosPhi,fdp:a.powerFactor,thd:a.thdCurrent},
  despues:{cosPhi:b.cosPhi,fdp:b.powerFactor,thd:b.thdCurrent},
  rectificador:{p:c.p,fdp:c.powerFactor,thd:c.thdCurrent}
}));

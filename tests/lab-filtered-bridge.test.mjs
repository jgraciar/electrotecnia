import assert from "node:assert/strict";
import {filteredBridgeStep} from "../scripts/LabFilteredBridge.ts";
const U=230,f=50,rs=2,r=200,c=0.002,dt=0.00002;
let state={capacitorVoltage:0},inputPower=0,loadPower=0,conductingSamples=0;
let positive=0,negative=0,blocked=0;
const samples=50000;
for(let k=0;k<samples;k++){
    const t=k*dt,source=Math.SQRT2*U*Math.sin(2*Math.PI*f*t);
    const step=filteredBridgeStep(source,rs,r,c,dt,state);
    state=step.state;
    assert(Number.isFinite(state.capacitorVoltage)&&state.capacitorVoltage>=0);
    assert(source*step.inputCurrent>=-1e-10,"El puente ideal no devuelve potencia a la red");
    if(k>samples/2){
        inputPower+=source*step.inputCurrent;
        loadPower+=state.capacitorVoltage**2/r;
        if(step.conducting)conductingSamples++;
        if(step.inputCurrent>0)positive++;
        if(step.inputCurrent<0)negative++;
        if(!step.conducting)blocked++;
    }
}
const count=samples/2;
inputPower/=count;loadPower/=count;
assert(positive>0&&negative>0&&blocked>0,
    "Debe conducir en ambos semiciclos y bloquear entre picos");
assert(conductingSamples/count<0.6,"La conducción debe concentrarse cerca de los picos");
assert(state.capacitorVoltage>200,"El condensador debe mantenerse cargado");
assert(inputPower>loadPower,"La potencia de entrada incluye las pérdidas en Rs");
assert(inputPower<loadPower*2,"El modelo debe alcanzar un régimen razonable");
assert.throws(()=>filteredBridgeStep(12,0,r,c,dt,state),/Parámetros/);
console.log("OK: puente con condensador, corriente pulsante y balance energético.");

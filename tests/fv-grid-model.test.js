/* Pruebas independientes del navegador: node tests/fv-grid-model.test.js */
const assert=require("node:assert/strict");
const {calculate,phaseInjection}=require("../fv-grid-model.js");
const near=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<=tol,`${a} != ${b}`);
let x=calculate({pvKW:0});near(x.gridKW,81);near(x.gridPF,.86);
x=calculate({pvKW:81});near(x.gridKW,0);near(x.gridKvar,81*Math.tan(Math.acos(.86)));near(x.gridPF,0);
x=calculate({pvKW:100,capacitorKvar:40});near(x.gridKW,-19);near(x.gridKvar,81*Math.tan(Math.acos(.86))-40);
x=calculate({pvKW:81,capacitorKvar:81*Math.tan(Math.acos(.86))});near(x.gridKVA,0);assert.equal(x.gridPF,null);
const currents=phaseInjection(.001,81);near(currents.reduce((a,b)=>a+b,0),0);
assert.throws(()=>calculate({lineVoltage:0}),RangeError);
console.log("FV grid model: 6 checks OK");

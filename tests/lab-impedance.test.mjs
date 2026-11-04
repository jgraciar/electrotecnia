import assert from "node:assert/strict";
import {
    fromRectangular,fromPolar,atFrequency,validateFrequency,validateRLC
} from "../scripts/LabImpedance.ts";

const close=(name,actual,expected,eps=1e-9)=>{
    assert(Number.isFinite(actual),name+": resultado no numérico "+actual);
    assert(Math.abs(actual-expected)<=eps*Math.max(1,Math.abs(expected)),
        name+": esperado "+expected+", real "+actual);
};
const f0=50,omega=2*Math.PI*f0;
const polar=fromPolar(10,30,f0);
close("R polar",polar.r,10*Math.cos(Math.PI/6));
close("L polar",polar.l,5/omega);
close("C polar ausente",polar.c,0);
const equivalent=atFrequency(polar,f0);
close("Z polar",equivalent.modulus,10);
close("φ polar",equivalent.argument,30);
close("R rectangular",fromRectangular(8,5,50).r,8);
close("L rectangular",fromRectangular(8,5,50).l,5/omega);
close("C rectangular",fromRectangular(8,-5,50).c,1/(omega*5));
const capacitive=atFrequency(fromPolar(10,-30,50),50);
close("Z capacitiva",capacitive.modulus,10);
close("φ capacitiva",capacitive.argument,-30);
const pureInductor=fromPolar(10,90,50);
close("R bobina pura",pureInductor.r,0);
close("X bobina pura",atFrequency(pureInductor,50).x,10);
const pureCapacitor=fromPolar(10,-90,50);
close("R condensador puro",pureCapacitor.r,0);
close("X condensador puro",atFrequency(pureCapacitor,50).x,-10);
const lc={r:8,l:0.1,c:0.0001};
const z50=atFrequency(lc,50),z100=atFrequency(lc,100);
close("X RLC 50 Hz",z50.x,omega*lc.l-1/(omega*lc.c));
close("X RLC 100 Hz",z100.x,2*omega*lc.l-1/(2*omega*lc.c));
assert.notEqual(z50.x,z100.x,"La reactancia debe cambiar con la frecuencia");
close("Frecuencia de resonancia",atFrequency(lc,1/(2*Math.PI*Math.sqrt(lc.l*lc.c))).x,0);
assert.throws(()=>validateFrequency(0),/solo está disponible en CA/);
assert.throws(()=>validateFrequency(-50),/solo está disponible en CA/);
assert.throws(()=>fromPolar(10,100,50),/argumento/);
assert.throws(()=>fromPolar(-10,0,50),/módulo/);
assert.throws(()=>fromRectangular(-1,5,50),/R debe/);
assert.throws(()=>fromRectangular(0,0,50),/impedancia nula/);
assert.throws(()=>validateRLC({r:0,l:0,c:0}),/necesita/);
assert.throws(()=>validateRLC({r:1,l:-1,c:0}),/no negativas/);
console.log("OK: impedancia exclusiva de CA, 3 entradas, reactancia variable, resonancia y validación");

import assert from "node:assert/strict";
import {LabPowerMeasurement} from "../scripts/LabPowerMeasurement.ts";

function measure(v, i, end=0.75, mode="auto") {
    const meter=new LabPowerMeasurement();
    for(let k=0; k<=Math.round(end/0.00005);k++) {
        const t=k*0.00005;
        meter.add(t, v(t), i(t));
    }
    return meter.measure(mode);
}
function approx(label, actual, expected, relative=0.012) {
    assert.ok(Number.isFinite(actual), label + ": resultado no numerico " + actual);
    assert.ok(Math.abs(actual-expected)<=Math.max(0.5,Math.abs(expected)*relative),
        label + ": " + actual + " frente a " + expected);
}
const dc=measure(()=>12,()=>1.2);
assert.equal(dc.kind,"dc");
approx("P continua",dc.p,14.4);
assert.equal(dc.q,null);
assert.equal(dc.s,null);

const f=50, omega=2*Math.PI*f, voltage=230,current=5,phi=Math.PI/6;
const sin=(t,phase=0)=>Math.SQRT2*Math.sin(omega*t+phase);
const rl=measure(t=>voltage*sin(t),t=>current*sin(t,-phi));
assert.equal(rl.kind,"ac");
approx("P carga RL",rl.p,voltage*current*Math.cos(phi));
approx("Q1 inductiva",rl.q,voltage*current*Math.sin(phi));
approx("S carga RL",rl.s,voltage*current);
assert(Math.abs(rl.cosPhi-Math.cos(phi))<0.015,
    "cos φ de carga RL debe ser el desfase de las fundamentales");
assert(Math.abs(rl.powerFactor-rl.cosPhi)<0.015,
    "En régimen sinusoidal, cos φ y f.d.p. deben coincidir");

const capacitor=measure(t=>voltage*sin(t),t=>current*sin(t,Math.PI/2));
assert.equal(capacitor.kind,"ac");
approx("P capacitiva",capacitor.p,0,0.02);
approx("Q1 capacitiva",capacitor.q,-voltage*current);
approx("S capacitiva",capacitor.s,voltage*current);

const resistive=measure(t=>voltage*sin(t),t=>current*sin(t));
approx("P resistiva",resistive.p,voltage*current);
approx("Q1 resistiva",resistive.q,0);
approx("S resistiva",resistive.s,voltage*current);
assert(Math.abs(resistive.cosPhi-1)<0.005);
assert(Math.abs(resistive.powerFactor-1)<0.005);

const nonSine=measure(t=>voltage*sin(t)+30*sin(3*t),t=>current*sin(t));
approx("P distorsion",nonSine.p,voltage*current);
approx("Q1 distorsion",nonSine.q,0);
assert.ok(nonSine.s>voltage*current,"La potencia aparente debe incluir distorsion");
assert(Math.abs(nonSine.cosPhi-1)<0.02,
    "Distorsión de tensión no debe cambiar el desfase fundamental");
assert(nonSine.powerFactor<nonSine.cosPhi-0.002,
    "El f.d.p. verdadero debe incluir la distorsión de tensión");

const harmonicCurrent=measure(t=>voltage*sin(t),
    t=>current*sin(t,-phi) + 4*Math.SQRT2*Math.sin(3*omega*t));
assert.equal(harmonicCurrent.kind,"ac");
assert(Math.abs(harmonicCurrent.cosPhi-Math.cos(phi))<0.015,
    "cos φ debe permanecer ligado a la fundamental con corriente armónica");
const expectedFdp=Math.cos(phi)*current/Math.hypot(current,4);
assert(Math.abs(harmonicCurrent.powerFactor-expectedFdp)<0.015,
    "f.d.p. debe usar P/S total, incluyendo el armónico tercero");
assert(harmonicCurrent.powerFactor<harmonicCurrent.cosPhi-0.10,
    "Con distorsión el factor de potencia real debe distinguirse de cos φ");
const generator=measure(t=>voltage*sin(t),t=>-current*sin(t));
assert(generator.powerFactor < -0.98 && generator.cosPhi < -0.98,
    "Con inversión de corriente deben conservarse los signos");
assert.equal(dc.cosPhi,null,"cos φ no definido en continua");
assert.equal(dc.powerFactor,null,"f.d.p. no definido por convenio con S=0 en CC");

const transient=measure(()=>12,t=>1.2+0.4*Math.exp(-t*10));
assert.equal(transient.kind,"dc","Transitorio con tension CC no debe interpretarse como CA");
assert.equal(measure(()=>12,()=>1.2,0.75,"ac").kind,"ac");
assert.equal(measure(t=>voltage*sin(t),t=>current*sin(t),0.75,"dc").kind,"dc");

const restarted=new LabPowerMeasurement();
restarted.add(1,12,1.2);
restarted.add(1.001,12,1.2);
restarted.add(0,3,2);
restarted.add(.05,3,2);
restarted.add(.1,3,2);
assert.equal(restarted.measure().kind,"dc","Debe reiniciarse el historial al retroceder el tiempo");
approx("P tras reinicio",restarted.measure().p,6);
console.log("OK: P/Q1/S en CC, CA resistiva, inductiva, capacitiva, distorsion y reinicio.");


// TEST: cuatro modos de lectura para las señales reales de las bobinas.
const temporal=new LabPowerMeasurement();
const f2=50, angular=2*Math.PI*f2, urms=230, irms=5;
for(let k=0;k<=15000;k++){
    const t=k*0.00005;
    temporal.add(t,Math.SQRT2*urms*Math.sin(angular*t),
        Math.SQRT2*irms*Math.sin(angular*t));
}
const readings=temporal.getWindowReadings(0.1);
assert(readings,"Faltan lecturas temporales");
approx("U eficaz",readings.rms.v,urms,0.005);
approx("I eficaz",readings.rms.i,irms,0.005);
approx("U pico absoluto",readings.peak.v,Math.SQRT2*urms,0.005);
approx("I pico absoluto",readings.peak.i,Math.SQRT2*irms,0.005);
approx("P media resistiva",readings.mean.p,urms*irms,0.005);
approx("P pico resistiva",readings.peak.p,2*urms*irms,0.005);
approx("p(t) RMS resistiva",readings.rms.p,
    urms*irms*Math.sqrt(1.5),0.005);
approx("U media sinusoidal",readings.mean.v,0,0.005);
approx("I media sinusoidal",readings.mean.i,0,0.005);
assert(readings.instantaneous.p>=0,"La carga resistiva no puede absorber potencia negativa");
assert(readings.rms.p>readings.mean.p,
    "El RMS de p(t) no debe confundirse con la potencia activa media");

const readingsDc=new LabPowerMeasurement();
for(let k=0;k<=3000;k++){
    const t=k*0.0001;
    readingsDc.add(t,12,1.2);
}
const dcValues=readingsDc.getWindowReadings(0.25);
assert(dcValues);
for(const mode of ["instantaneous","peak","rms","mean"]){
    approx("U CC "+mode,dcValues[mode].v,12);
    approx("I CC "+mode,dcValues[mode].i,1.2);
    approx("p CC "+mode,dcValues[mode].p,14.4);
}
const reversed=new LabPowerMeasurement();
for(let k=0;k<=1000;k++)reversed.add(k*0.0001,12,-1.2);
const powerOut=reversed.getWindowReadings(0.05);
assert(powerOut);
approx("Potencia generada con signo",powerOut.mean.p,-14.4);
approx("Pico algebraico negativo",powerOut.peak.p,-14.4);
console.log("OK: lectura instantánea, pico, RMS y media de U/I/p; ventana y signos");

console.log("OK: cos φ fundamental y f.d.p. P/S en CA sinusoidal, armónica, inversa y CC");


// Pruebas espectrales con valores analíticos independientes.
const harmonic=measure(t=>230*sin(t),
 t=>10*sin(t,-Math.acos(.8))+3*Math.SQRT2*Math.sin(5*omega*t)+Math.SQRT2*Math.sin(7*omega*t));
assert.equal(harmonic.kind,"ac");
approx("THD U ideal",harmonic.thdVoltage,0,.001);
assert(Math.abs(harmonic.thdCurrent-Math.sqrt(10)/10)<.008,
 "THD I: 5.º de 3 A y 7.º de 1 A frente a 10 A fundamentales");
approx("P con armonicos solo de corriente",harmonic.p,1840,.015);
approx("Q1 con armonicos solo de corriente",harmonic.q,1380,.015);
approx("S con armonicos solo de corriente",harmonic.s,230*Math.sqrt(110),.015);
approx("D* residual",harmonic.distortionResidual,230*Math.sqrt(10),.025);
assert(Math.abs(harmonic.powerFactor-.8*10/Math.sqrt(110))<.015);
const voltageHarmonics=measure(t=>230*sin(t)+23*Math.SQRT2*Math.sin(5*omega*t),
 t=>10*sin(t));
assert.equal(voltageHarmonics.kind,"ac");
assert(Math.abs(voltageHarmonics.thdVoltage-.1)<.008,"THD U 5.º al 10 %");
assert(Math.abs(voltageHarmonics.thdCurrent)<.008,"THD I sinusoidal");
const bothHarmonics=measure(t=>230*sin(t)+23*Math.SQRT2*Math.sin(5*omega*t),
 t=>10*sin(t)+2*Math.SQRT2*Math.sin(5*omega*t));
approx("P armonica adicional",bothHarmonics.p,2300+46,.015);
approx("P solo armonicos",bothHarmonics.harmonicPower,46,.04);
console.log("OK: THD U/I, potencia armonica y D* frente a referencias analiticas");

import type { LabPowerMeasurement } from "./LabPowerMeasurement";
// Inversor conectado a red: referencia temporal para validar la inyección de corriente.
// Potencias en W y VAr; tensión RMS fase-neutro en V.
// Convención: corriente positiva del inversor hacia el punto de conexión.
// i(t)=sqrt(2) [P/V sin(wt) - Q/V cos(wt)].
// Q positiva significa inyección reactiva inductiva desde el inversor.
export interface PVCurrentSettings { voltageRms:number; frequency:number; power:number; reactivePower?:number; phase?:number; time:number; }
export function gridFollowingCurrent({voltageRms,frequency,power,reactivePower=0,phase=0,time}:PVCurrentSettings):number{
  if(![voltageRms,frequency,power,reactivePower,phase,time].every(Number.isFinite)
     ||voltageRms<=0||frequency<=0)
    throw Error("Parámetros no válidos del inversor");
  const angle=2*Math.PI*frequency*time+phase;
  return Math.SQRT2*(power*Math.sin(angle)-reactivePower*Math.cos(angle))/voltageRms;
}
export function gridFollowingSample(settings:PVCurrentSettings):{voltage:number;current:number}{
  const angle=2*Math.PI*settings.frequency*settings.time+(settings.phase??0);
  const voltage=Math.SQRT2*settings.voltageRms*Math.sin(angle);
  return {voltage,current:gridFollowingCurrent(settings)};
}
// Para un sistema trifásico equilibrado, aplicar P/3 y Q/3 a cada fase,
// con desplazamientos 0, -2pi/3 y +2pi/3.


// Modelo didáctico: parámetro principal P o S y factor de desplazamiento.
// Q permanece en el cálculo físico; no se pide como consigna independiente.
// Un inversor fotovoltaico conectado a red puede regular Q o cosφ por
// exigencias de red; cosφ=1 es la consigna inicial, no una obligación universal.
export type PVPowerEntry = "P" | "S";
export type PVReactiveSense = "inductivo" | "capacitivo";
export interface PVCommercialSettings {
    entry: PVPowerEntry;
    value: number;
    cosPhi: number;
    sense: PVReactiveSense;
    ratedApparent: number;
    ratedActive?: number;
}
export interface PVCommercialPower {
    requestedP: number;
    requestedS: number;
    p: number;
    q: number;
    s: number;
    limited: boolean;
}
export function commercialPVPower(settings: PVCommercialSettings): PVCommercialPower {
    const {entry,value,cosPhi,sense,ratedApparent,ratedActive=Infinity}=settings;
    if(!["P","S"].includes(entry) ||
       !["inductivo","capacitivo"].includes(sense) ||
       ![value,cosPhi,ratedApparent].every(Number.isFinite) ||
       !(ratedActive>0) ||
       value<0 || ratedApparent<=0 || cosPhi<=0 || cosPhi>1)
        throw Error("Consigna P/S, cosφ o potencia nominal no válida");
    const requestedS=entry==="S"?value:value/cosPhi;
    const requestedP=entry==="P"?value:value*cosPhi;
    const s=Math.min(requestedS,ratedApparent,ratedActive/cosPhi);
    const p=s*cosPhi;
    const q=(sense==="inductivo"?1:-1)*s*Math.sqrt(Math.max(0,1-cosPhi*cosPhi));
    return {requestedP,requestedS,p,q,s,
        limited:requestedS>s+1e-9};
}

// Aislada: fuente sinusoidal de tensión regulada con resistencia de salida
// finita. La potencia entregada depende del consumo, no de una P prefijada.
// 1 % de caída de tensión a intensidad nominal como aproximación didáctica.
// El modelo no simula batería, MPPT, control PWM, protecciones ni sobrecarga.
export interface PVIslandSettings {
    voltageRms:number;
    frequency:number;
    phaseDegrees?:number;
    ratedApparent:number;
}
export function islandOutputResistance({voltageRms,ratedApparent}:PVIslandSettings):number{
    if(!Number.isFinite(voltageRms)||voltageRms<=0||
       !Number.isFinite(ratedApparent)||ratedApparent<=0)
        throw Error("Datos nominales del inversor aislado no válidos");
    return Math.max(0.01,0.01*voltageRms*voltageRms/ratedApparent);
}
export function islandReferenceVoltage(settings:PVIslandSettings,time:number):number{
    if(![settings.voltageRms,settings.frequency,settings.phaseDegrees??0,time]
        .every(Number.isFinite)||settings.voltageRms<=0||settings.frequency<=0)
        throw Error("Tensión o frecuencia del inversor aislado no válida");
    return Math.SQRT2*settings.voltageRms*
        Math.sin(2*Math.PI*settings.frequency*time+
                 (settings.phaseDegrees??0)*Math.PI/180);
}


// Lectura del inversor: intensidad eficaz (RMS) por defecto o i(t).
// El antiguo XML pvIView=2 sigue significando intensidad instantánea.
export type PVCurrentReadMode = 0 | 2;
export function inverterCurrentDisplay(
    samples: LabPowerMeasurement, mode: PVCurrentReadMode, frequency: number
):{label:string;value:number|null}{
    if(mode!==0&&mode!==2)
        throw Error("Modo de lectura de intensidad no válido");
    const label=mode===0?"I [RMS]":"i(t)";
    const freq=Number.isFinite(frequency)&&frequency>0?frequency:50;
    const period=1/freq;
    const window=samples.getWindowReadings(period);
    if(!window || (mode===0&&window.duration<period*0.95))
        return {label,value:null};
    return {label,value:mode===0?window.rms.i:window.instantaneous.i};
}

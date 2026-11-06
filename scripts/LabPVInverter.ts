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

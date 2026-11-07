// Modelo de referencia fasorial de un suministro trifásico de cuatro hilos.
// Magnitudes P en kW, Q en kVAr, tensión entre fases en V RMS.
// Corrientes positivas hacia la carga; neutral = suma fasorial de líneas.
// Se utiliza para contrastar cargas desequilibradas y generación FV por fase.
// No sustituye un modelo dinámico de inversor, contador ni protecciones.
export type ThreePhaseValues = readonly [number,number,number];

export interface PVThreePhaseBalanceSettings {
 lineVoltage:number;
 loadP:ThreePhaseValues;
 loadQ:ThreePhaseValues;
 pvP:ThreePhaseValues;
 pvQ?:ThreePhaseValues;
 capacitorQ?:ThreePhaseValues;
}
export function pvThreePhaseBalance(settings:PVThreePhaseBalanceSettings){
 const {lineVoltage,loadP,loadQ,pvP}=settings;
 const pvQ=settings.pvQ??[0,0,0];
 const capacitorQ=settings.capacitorQ??[0,0,0];
 if(!Number.isFinite(lineVoltage)||lineVoltage<=0)
  throw Error("Tensión entre fases no válida");
 for(const [name,values] of Object.entries({loadP,loadQ,pvP,pvQ,capacitorQ})){
  if(!Array.isArray(values)||values.length!==3||
   values.some(v=>!Number.isFinite(v))||
   (["loadP","pvP","capacitorQ"].includes(name)&&values.some(v=>v<0)))
   throw Error("Vector trifásico no válido: "+name);
 }
 const phaseVoltage=lineVoltage/Math.sqrt(3);
 const angles=[0,-2*Math.PI/3,2*Math.PI/3];
 const phases=angles.map((angle,i)=>{
  const gridP=loadP[i]-pvP[i];
  const gridQ=loadQ[i]-pvQ[i]-capacitorQ[i];
  const scale=1000/phaseVoltage;
  // I = conj(S/U) = (P-jQ)*exp(j*theta)/U.
  const real=scale*(gridP*Math.cos(angle)+gridQ*Math.sin(angle));
  const imag=scale*(gridP*Math.sin(angle)-gridQ*Math.cos(angle));
  return {
   gridP,gridQ,gridS:Math.hypot(gridP,gridQ),
   gridCurrent:Math.hypot(real,imag),
   currentPhasor:{real,imag},
   phaseAngle:angle,
   exportedP:Math.max(-gridP,0),
   importedP:Math.max(gridP,0)
  };
 });
 const totalGridP=phases.reduce((sum,p)=>sum+p.gridP,0);
 const totalGridQ=phases.reduce((sum,p)=>sum+p.gridQ,0);
 const currentReal=phases.reduce((sum,p)=>sum+p.currentPhasor.real,0);
 const currentImag=phases.reduce((sum,p)=>sum+p.currentPhasor.imag,0);
 return {
  phaseVoltage,phases,totalGridP,totalGridQ,
  totalGridS:Math.hypot(totalGridP,totalGridQ),
  // El contador puede sumar potencias; esta I solo sería correcta en equilibrio.
  balancedReferenceLineCurrent:Math.hypot(totalGridP,totalGridQ)*
   1000/(Math.sqrt(3)*lineVoltage),
  neutralCurrent:Math.hypot(currentReal,currentImag),
  maxLineCurrent:Math.max(...phases.map(p=>p.gridCurrent)),
  simultaneousPhaseImportP:phases.reduce((sum,p)=>sum+p.importedP,0),
  simultaneousPhaseExportP:phases.reduce((sum,p)=>sum+p.exportedP,0)
 };
}

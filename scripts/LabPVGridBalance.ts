// Modelo fasorial de referencia para autoconsumo y compensación reactiva.
// Convención: P_red>0 importa; P_red<0 exporta.
// Q_red>0 inductiva; Q_red<0 capacitiva.
// No sustituye al circuito eléctrico de CircuitJS.
export function pvGridBalance({loadP,loadQ,pvP,pvQ=0,capacitorQ=0,voltage=400,phases=3}){
  const values=[loadP,loadQ,pvP,pvQ,capacitorQ,voltage];
  if(values.some(v=>!Number.isFinite(v))||loadP<0||pvP<0||capacitorQ<0||voltage<=0||![1,3].includes(phases))
    throw Error("Parámetros de instalación fotovoltaica no válidos");
  const gridP=loadP-pvP;
  const gridQ=loadQ-pvQ-capacitorQ;
  const gridS=Math.hypot(gridP,gridQ);
  const gridCurrent=gridS*1000/(voltage*(phases===3?Math.sqrt(3):1));
  const absCosPhi=gridS>0?Math.abs(gridP)/gridS:1;
  return {
    gridP,gridQ,gridS,gridCurrent,absCosPhi,
    gridDirection:gridP>1e-9?"import":gridP< -1e-9?"export":"zero",
    reactiveDirection:gridQ>1e-9?"inductive":gridQ< -1e-9?"capacitive":"zero",
    selfConsumedP:Math.min(loadP,pvP),
    exportedP:Math.max(0,-gridP),
    importedP:Math.max(0,gridP),
    // Con P=0 y Q!=0 sigue circulando corriente por la acometida.
    activeZeroReactiveNonzero:Math.abs(gridP)<1e-9&&Math.abs(gridQ)>1e-9
  };
}

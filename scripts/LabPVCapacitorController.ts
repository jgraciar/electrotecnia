// Regulador didáctico de escalones en el punto de conexión (PCC).
// Entradas kW/kVAr. Solo recomienda estados; no acciona contactores.
export function selectCapacitorSteps({
 gridP, reactiveBeforeCapacitors, steps,
 targetCosPhi=0.95, minImportP=0.1,
 allowCapacitive=false
}){
 if(![gridP,reactiveBeforeCapacitors,targetCosPhi,minImportP].every(Number.isFinite)||
  !(targetCosPhi>0&&targetCosPhi<=1)||minImportP<0||
  !Array.isArray(steps)||steps.length>16||
  steps.some(q=>!Number.isFinite(q)||q<=0))
  throw Error("Parámetros del regulador no válidos");
 // Un cosφ calculado en exportación o P≈0 no es criterio suficiente
 // para cerrar escalones: se conserva el estado en esos regímenes.
 if(gridP<=minImportP)return {mode:gridP<0?"export-block":"low-import-block",
  selected:[],capacitorQ:0,gridQ:reactiveBeforeCapacitors,
  action:"hold",reason:"Medición de P en PCC insuficiente para regular por cosφ"};
 const targetQ=gridP*Math.tan(Math.acos(targetCosPhi));
 let best={selected:[],capacitorQ:0,gridQ:reactiveBeforeCapacitors};
 let bestError=Math.abs(best.gridQ-targetQ);
 for(let mask=1;mask<(1<<steps.length);mask++){
  let capacitorQ=0;const selected=[];
  for(let i=0;i<steps.length;i++)if(mask&(1<<i)){
   selected.push(i);capacitorQ+=steps[i];
  }
  const gridQ=reactiveBeforeCapacitors-capacitorQ;
  if(!allowCapacitive&&gridQ< -1e-9)continue;
  const error=Math.abs(gridQ-targetQ);
  if(error<bestError-1e-9||
   (Math.abs(error-bestError)<1e-9&&selected.length<best.selected.length)){
   best={selected,capacitorQ,gridQ};bestError=error;
  }
 }
 return {mode:"import-regulation",...best,action:"recommend",
  targetQ,achievedCosPhi:Math.abs(gridP)/Math.hypot(gridP,best.gridQ)};
}

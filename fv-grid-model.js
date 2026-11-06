/* Modelo trifásico equilibrado FV-red-cargas. Convención: P/Q de red positivos = importación. */
(function(root,factory){
  const api=factory();
  if(typeof module==="object"&&module.exports) module.exports=api;
  root.FVGridModel=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  "use strict";
  function calculate({lineVoltage=420,frequency=50,loadKW=81,loadCosPhi=0.86,pvKW=0,capacitorKvar=0}={}){
    for(const [name,value] of Object.entries({lineVoltage,frequency,loadKW,loadCosPhi,pvKW,capacitorKvar})){
      if(!Number.isFinite(value)) throw new TypeError(name+" debe ser finito");
    }
    if(lineVoltage<=0||frequency<=0||loadKW<0||pvKW<0||capacitorKvar<0||loadCosPhi<=0||loadCosPhi>1)
      throw new RangeError("Parámetros fuera de rango");
    const loadQKvar=loadKW*Math.tan(Math.acos(loadCosPhi));
    const gridKW=loadKW-pvKW;
    const gridKvar=loadQKvar-capacitorKvar;
    const gridKVA=Math.hypot(gridKW,gridKvar);
    const gridCurrentA=gridKVA*1000/(Math.sqrt(3)*lineVoltage);
    const gridPF=gridKVA<1e-9?null:Math.abs(gridKW)/gridKVA;
    return {lineVoltage,phaseVoltage:lineVoltage/Math.sqrt(3),frequency,
      loadKW,loadQKvar,pvKW,capacitorKvar,gridKW,gridKvar,gridKVA,gridCurrentA,
      gridPF,gridPowerDirection:gridKW>0?"import":gridKW<0?"export":"zero",
      gridReactiveDirection:gridKvar>0?"inductive":gridKvar<0?"capacitive":"zero"};
  }
  // Corriente inyectada ideal: referencia de fase coincidente con la tensión de red.
  function phaseInjection(t,pvKW=81,lineVoltage=420,frequency=50){
    if(![t,pvKW,lineVoltage,frequency].every(Number.isFinite)||pvKW<0||lineVoltage<=0||frequency<=0)
      throw new RangeError("Parámetros inválidos");
    const peak=Math.SQRT2*pvKW*1000/(Math.sqrt(3)*lineVoltage);
    const angle=2*Math.PI*frequency*t;
    return [0,-2*Math.PI/3,2*Math.PI/3].map(offset=>peak*Math.sin(angle+offset));
  }
  return Object.freeze({calculate,phaseInjection});
});

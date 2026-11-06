// Modelo temporal independiente de un rectificador de onda completa
// con condensador de filtrado y resistencia de carga.
// Modelo IDEAL: puente sin caídas, fuente con resistencia serie Rs.
// No sustituye el solver nodal de CircuitJS; se utiliza para validar
// el comportamiento esperado antes de integrar diodos, C y R reales.
export type FilteredBridgeState={capacitorVoltage:number};
export type FilteredBridgeStep={state:FilteredBridgeState;inputCurrent:number;loadCurrent:number;conducting:boolean};
export function filteredBridgeStep(
    sourceVoltage:number,seriesResistance:number,loadResistance:number,
    capacitance:number,dt:number,state:FilteredBridgeState
):FilteredBridgeStep {
    if(![sourceVoltage,seriesResistance,loadResistance,capacitance,dt,state.capacitorVoltage].every(Number.isFinite)
        ||seriesResistance<=0||loadResistance<=0||capacitance<=0||dt<=0||state.capacitorVoltage<0)
        throw Error("Parámetros del rectificador filtrado no válidos");
    // Discretización implícita: evita inestabilidad para dt << o >> Rs*C.
    // En conducción, el puente aplica |u| a Rs, R y C en paralelo.
    // En bloqueo, el condensador solo se descarga sobre R.
    const absV=Math.abs(sourceVoltage);
    const discharge=state.capacitorVoltage/(1+dt/(loadResistance*capacitance));
    const on=(state.capacitorVoltage+dt*absV/(seriesResistance*capacitance))/
        (1+dt*(1/seriesResistance+1/loadResistance)/capacitance);
    const conducting=on<absV && on>discharge;
    const capacitorVoltage=conducting?on:discharge;
    const rectifiedCurrent=conducting?Math.max(0,(absV-capacitorVoltage)/seriesResistance):0;
    return {state:{capacitorVoltage},inputCurrent:Math.sign(sourceVoltage)*rectifiedCurrent,
        loadCurrent:capacitorVoltage/loadResistance,conducting};
}

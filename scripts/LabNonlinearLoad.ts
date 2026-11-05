// Modelo de referencia de una carga no lineal de dos bornes.
// Rectificador ideal de media onda con resistencia serie R.
// Es una referencia de cálculo; todavía no está integrado en el solver de CircuitJS.
export type HalfWaveDirection = "positive" | "negative";
export function halfWaveCurrent(voltage:number,resistance:number,direction:HalfWaveDirection="positive"):number {
    if(!Number.isFinite(voltage))throw Error("La tensión debe ser finita");
    if(!Number.isFinite(resistance)||resistance<=0)throw Error("R debe ser finita y mayor que cero");
    if(direction!=="positive"&&direction!=="negative")throw Error("Sentido de conducción no válido");
    return direction==="positive"
        ? Math.max(0,voltage)/resistance
        : Math.min(0,voltage)/resistance;
}
export function halfWaveReference(voltageRms:number,resistance:number) {
    if(!Number.isFinite(voltageRms)||voltageRms<=0)throw Error("La tensión eficaz debe ser positiva");
    if(!Number.isFinite(resistance)||resistance<=0)throw Error("R debe ser finita y mayor que cero");
    const p=voltageRms*voltageRms/(2*resistance);
    const s=voltageRms*voltageRms/(Math.SQRT2*resistance);
    return {p,s,cosPhi:1,powerFactor:1/Math.SQRT2,
        currentRms:voltageRms/(Math.SQRT2*resistance)};
}

// Impedancia pasiva de CA, realizada con componentes R-L-C reales.
// f0 > 0 es una frecuencia de referencia; no se ofrece equivalente de CC.
// La representación polar o rectangular especifica Z únicamente en f0.
export type RLCValues = {r:number;l:number;c:number};
export type ImpedanceValues = {r:number;x:number;modulus:number;argument:number};

export function validateFrequency(f:number): void {
    if (!Number.isFinite(f) || f <= 0)
        throw Error("La impedancia Z solo está disponible en CA: frecuencia > 0 Hz");
}
export function validateRLC(v:RLCValues): void {
    if (![v.r,v.l,v.c].every(Number.isFinite) || v.r<0 || v.l<0 || v.c<0)
        throw Error("R, L y C deben ser magnitudes finitas y no negativas");
    if (!(v.r>0 || v.l>0 || v.c>0))
        throw Error("La impedancia necesita R, L o C; no admite un cortocircuito ideal");
}
export function fromRectangular(r:number,x:number,f:number):RLCValues {
    validateFrequency(f);
    if (!Number.isFinite(r) || r<0 || !Number.isFinite(x))
        throw Error("R debe ser >= 0 y X debe ser finita");
    if (r===0 && x===0)
        throw Error("La impedancia nula no se admite como elemento Z");
    const w=2*Math.PI*f;
    const result={r,l:x>0?x/w:0,c:x<0?-1/(w*x):0};
    validateRLC(result);
    return result;
}
export function fromPolar(modulus:number,argument:number,f:number):RLCValues {
    validateFrequency(f);
    if (!(Number.isFinite(modulus)&&modulus>0))
        throw Error("El módulo debe ser mayor que cero");
    if (!Number.isFinite(argument) || Math.abs(argument)>90)
        throw Error("El argumento de una impedancia pasiva serie debe estar entre -90° y 90°");
    const phi=argument*Math.PI/180;
    const r=modulus*Math.cos(phi);
    const x=modulus*Math.sin(phi);
    return fromRectangular(Math.abs(r)<1e-12?0:r,Math.abs(x)<1e-12?0:x,f);
}
export function atFrequency(values:RLCValues,f:number):ImpedanceValues {
    validateRLC(values);
    validateFrequency(f);
    const w=2*Math.PI*f;
    const x=(values.l>0?w*values.l:0)-(values.c>0?1/(w*values.c):0);
    const modulus=Math.hypot(values.r,x);
    return {r:values.r,x,modulus,argument:Math.atan2(x,values.r)*180/Math.PI};
}

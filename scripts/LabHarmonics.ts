// Espectro discreto de corriente periódica, con muestras equiespaciadas.
// La componente continua no se incluye en la THD, pero se devuelve aparte.
export function currentHarmonics(samples:number[],maxOrder:number) {
    const n=samples.length;
    if(n<8||!Number.isInteger(maxOrder)||maxOrder<1||maxOrder>=n/2||
        samples.some(x=>!Number.isFinite(x)))
        throw Error("Muestras u orden armónico no válidos");
    const dc=samples.reduce((a,b)=>a+b,0)/n;
    let sumSquares=0;
    for(const x of samples)sumSquares+=x*x/n;
    const totalRms=Math.sqrt(sumSquares);
    const harmonics=[];
    for(let h=1;h<=maxOrder;h++){
        let re=0,im=0;
        for(let k=0;k<n;k++){
            const angle=2*Math.PI*h*k/n;
            re+=samples[k]*Math.cos(angle);
            im-=samples[k]*Math.sin(angle);
        }
        harmonics.push(Math.hypot(re,im)*Math.SQRT2/n);
    }
    const fundamentalRms=harmonics[0];
    // THD completa a partir de Parseval, incluyendo armónicos no listados,
    // excluyendo la componente continua.
    const distortionSquared=Math.max(0,totalRms**2-dc**2-fundamentalRms**2);
    return {dc,totalRms,fundamentalRms,harmonics,
        thd:fundamentalRms>1e-12?Math.sqrt(distortionSquared)/fundamentalRms:null};
}

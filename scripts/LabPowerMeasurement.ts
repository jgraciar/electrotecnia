// Laboratorio de Electrotecnia: medicion P/Q1/S de un vatimetro de cuatro bornes.
// Q1 es la potencia reactiva de la componente fundamental (no la potencia no activa).
// Modelo independiente de CircuitJS para permitir pruebas numericas.
export type PowerSample = { t: number; v: number; i: number };
export type PowerReading = {
    kind: "dc" | "ac" | "pending";
    p: number;
    s: number | null;
    q: number | null;
    period: number | null;
};

export class LabPowerMeasurement {
    private samples: PowerSample[] = [];
    private start = 0;
    private lastStored = -Infinity;
    private readonly spacing = 0.0001;
    private readonly history = 1.25;

    clear(): void {
        this.samples = [];
        this.start = 0;
        this.lastStored = -Infinity;
    }

    add(t: number, v: number, i: number): void {
        if (![t, v, i].every(Number.isFinite)) return;
        const last = this.samples[this.samples.length - 1];
        if (last && t < last.t) this.clear();
        if (t <= this.lastStored + this.spacing - 1e-10) return;
        this.samples.push({t, v, i});
        this.lastStored = t;
        while (this.start < this.samples.length - 2 &&
               this.samples[this.start + 1].t < t - this.history)
            this.start++;
        if (this.start > 1024) {
            this.samples = this.samples.slice(this.start);
            this.start = 0;
        }
    }

    measure(force: "auto" | "dc" | "ac" = "auto"): PowerReading {
        const a = this.samples.slice(this.start);
        if (a.length < 2 || a[a.length-1].t - a[0].t < 0.018)
            return {kind: "pending", p: 0, q: null, s: null, period: null};
        const end = a[a.length - 1].t;
        const recent = this.interval(a, Math.max(a[0].t, end - 0.15), end);
        const stats = this.stats(recent);
        // Se puede empezar a buscar un periodo completo sin esperar 55 ms.
        // El cálculo exacto de Q y S exige dos cruces ascendentes consecutivos.
        const enough = recent.length >= 3 && end - recent[0].t > 0.020;
        const dv = Math.sqrt(Math.max(0, stats.vv - stats.v * stats.v));
        const di = Math.sqrt(Math.max(0, stats.ii - stats.i * stats.i));
        const vRms = Math.sqrt(Math.max(0, stats.vv));
        const iRms = Math.sqrt(Math.max(0, stats.ii));
        const variableV = dv > Math.max(1e-7, 0.005 * vRms);
        const variableI = di > Math.max(1e-9, 0.005 * iRms);
        // Cuando la tension es constante y apreciable, un transitorio de intensidad
        // no debe interpretarse por si solo como alimentacion alterna.
        const ac = force === "ac" || (force === "auto" &&
            (variableV || (vRms < 1e-7 && variableI)));
        if (force === "dc" || (enough && !ac))
            return {kind: "dc", p: stats.p, q: null, s: null, period: null};
        if (!enough)
            return {kind: "pending", p: stats.p, q: null, s: null, period: null};

        const full = this.interval(a, Math.max(a[0].t, end - 0.55), end);
        const sv = this.stats(full);
        const value = (variableV || !variableI) ? (x: PowerSample) => x.v : (x: PowerSample) => x.i;
        const mean = (variableV || !variableI) ? sv.v : sv.i;
        const rms = (variableV || !variableI) ? Math.sqrt(Math.max(0, sv.vv)) : Math.sqrt(Math.max(0, sv.ii));
        const hyst = Math.max(1e-9, 0.10 * Math.sqrt(Math.max(0, rms*rms - mean*mean)));
        let armed = false;
        const crossings: number[] = [];
        for (let j = 1; j < full.length; j++) {
            const prev = value(full[j-1]) - mean;
            const cur = value(full[j]) - mean;
            if (prev < -hyst) armed = true;
            if (armed && prev <= 0 && cur > 0) {
                const frac = -prev / (cur - prev);
                crossings.push(full[j-1].t + frac * (full[j].t - full[j-1].t));
                armed = false;
            }
        }
        if (crossings.length >= 2) {
            const t1 = crossings[crossings.length-1];
            const t0 = crossings[crossings.length-2];
            const T = t1-t0;
            if (T >= 0.0005 && T <= this.history / 1.5 && end-t1 <= 2*T) {
                const cycle = this.interval(a, t0, t1);
                if (cycle.length >= 3) {
                    const wave = this.stats(cycle, T, t0);
                    const s = Math.sqrt(Math.max(0,wave.vv)) * Math.sqrt(Math.max(0,wave.ii));
                    const q = (wave.vc*wave.is - wave.vs*wave.ic)/2;
                    return {kind: "ac", p: wave.p, s, q, period: T};
                }
            }
        }
        // No inventar Q cuando no se ha identificado un periodo completo.
        // Sin periodo identificado, no presentar una S basada en una fracción
        // muy corta de onda como si ya fuera una lectura estabilizada.
        return {kind: "ac", p: stats.p,
            s: end-a[0].t >= 0.055 ? vRms*iRms : null,
            q: null, period: null};
    }

    private interval(data: PowerSample[], lo: number, hi: number): PowerSample[] {
        const out: PowerSample[] = [];
        for (let j=1; j<data.length; j++) {
            const before = data[j-1], after=data[j];
            if (after.t < lo || before.t > hi || after.t <= before.t) continue;
            if (!out.length) {
                const t = Math.max(before.t, lo);
                const f = (t-before.t)/(after.t-before.t);
                out.push({t, v:before.v+(after.v-before.v)*f,
                           i:before.i+(after.i-before.i)*f});
            }
            if (after.t >= hi) {
                const f=(hi-before.t)/(after.t-before.t);
                if (hi > out[out.length-1].t)
                    out.push({t:hi, v:before.v+(after.v-before.v)*f,
                                i:before.i+(after.i-before.i)*f});
                break;
            }
            if (after.t > out[out.length-1].t) out.push(after);
        }
        return out;
    }

    private stats(a: PowerSample[], period = 0, origin = 0):
        {v:number; i:number; vv:number; ii:number; p:number;
         vc:number; vs:number; ic:number; is:number} {
        const sum = {v:0, i:0, vv:0, ii:0, p:0, vc:0, vs:0, ic:0, is:0};
        if (a.length < 2) return sum;
        const omega = period > 0 ? 2*Math.PI/period : 0;
        const values = (x: PowerSample) => {
            const co=Math.cos(omega*(x.t-origin));
            const si=Math.sin(omega*(x.t-origin));
            return {v:x.v, i:x.i, vv:x.v*x.v, ii:x.i*x.i, p:x.v*x.i,
                    vc:x.v*co, vs:x.v*si, ic:x.i*co, is:x.i*si};
        };
        for (let j=1; j<a.length; j++) {
            const dt = a[j].t-a[j-1].t;
            const before=values(a[j-1]), after=values(a[j]);
            for (const key of Object.keys(sum) as Array<keyof typeof sum>)
                sum[key] += dt*(before[key]+after[key])/2;
        }
        const duration=a[a.length-1].t-a[0].t;
        if (duration <= 0) return sum;
        for (const key of Object.keys(sum) as Array<keyof typeof sum>)
            sum[key] /= duration;
        sum.vc *= 2; sum.vs *= 2; sum.ic *= 2; sum.is *= 2;
        return sum;
    }
}

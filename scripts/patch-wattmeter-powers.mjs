// Aplica una ampliacion minima a WattmeterTrueElm.ts del CircuitJS upstream.
// No sustituye su tipo XML, sus cuatro bornes ni el calculo original del motor.
import {readFileSync, writeFileSync, copyFileSync} from "node:fs";
const source = process.argv[2];
const helper = process.argv[3];
if (!source || !helper) throw Error("Uso: node patch-wattmeter-powers.mjs WattmeterTrueElm.ts LabPowerMeasurement.ts");
let code = readFileSync(source, "utf8");
function once(oldText, newText) {
    const a=code.indexOf(oldText);
    if(a<0 || code.indexOf(oldText,a+oldText.length)>=0)
        throw Error("La fuente WattmeterTrueElm.ts ha cambiado: " + oldText.slice(0,90));
    code=code.slice(0,a)+newText+code.slice(a+oldText.length);
}
once('import { VoltageSource } from "./VoltageSource";',
     'import { VoltageSource } from "./VoltageSource";\nimport { LabPowerMeasurement } from "./LabPowerMeasurement";');
once('    selectedValue: number = 0;',
`    selectedValue: number = 0;
    // Preferencias locales de presentacion. No afectan a las conexiones ni a la simulacion.
    labCurrentMode: number = 0; // 0 auto; 1 CC; 2 CA
    labPowerMask: number = 1; // P=1, Q1=2, S=4; las tres se combinan
    labMeasurement: LabPowerMeasurement = new LabPowerMeasurement();
    // Modos de lectura: 0 instantánea, 1 pico, 2 RMS, 3 media.
    labPowerReadMode: number = 0;
    labVoltageReadMode: number = 2;
    labCurrentReadMode: number = 2;
    labShowVoltage: boolean = false;
    labShowCurrent: boolean = false;
    labShowCosPhi: boolean = false;
    labShowPowerFactor: boolean = false;
    // 0: 1 periodo; 1: 3 periodos; 2: 100ms; 3: 250ms; 4: 500ms
    labWindowMode: number = 0;
    private labSwitchingToDC: boolean = false;`);
once('        CircuitXMLSerializer.dumpAttr(elem, "meter", this.meter);',
`        CircuitXMLSerializer.dumpAttr(elem, "meter", this.meter);
        // Atributos optativos: los XML originales de Wulflemm carecen de ellos.
        if (this.labCurrentMode !== 0)
            CircuitXMLSerializer.dumpAttr(elem, "labCurrentMode", this.labCurrentMode);
        if (this.labPowerMask !== 1)
            CircuitXMLSerializer.dumpAttr(elem, "labPowerMask", this.labPowerMask);
        // Solo se escriben preferencias distintas a las del archivo clásico.
        if (this.labPowerReadMode !== (this.meter === this.PM_INST ? 0 : 3))
            CircuitXMLSerializer.dumpAttr(elem, "labPowerReadMode", this.labPowerReadMode);
        if (this.labVoltageReadMode !== 2)
            CircuitXMLSerializer.dumpAttr(elem, "labVoltageReadMode", this.labVoltageReadMode);
        if (this.labCurrentReadMode !== 2)
            CircuitXMLSerializer.dumpAttr(elem, "labCurrentReadMode", this.labCurrentReadMode);
        if (this.labShowVoltage)
            CircuitXMLSerializer.dumpAttr(elem, "labShowVoltage", 1);
        if (this.labShowCurrent)
            CircuitXMLSerializer.dumpAttr(elem, "labShowCurrent", 1);
        if (this.labShowCosPhi)
            CircuitXMLSerializer.dumpAttr(elem, "labShowCosPhi", 1);
        if (this.labShowPowerFactor)
            CircuitXMLSerializer.dumpAttr(elem, "labShowPowerFactor", 1);
        if (this.labWindowMode !== 0)
            CircuitXMLSerializer.dumpAttr(elem, "labWindowMode", this.labWindowMode);`);
once('        this.meter = xml.parseIntAttr("meter", this.meter);',
`        this.meter = xml.parseIntAttr("meter", this.meter);
        // La ausencia de estas opciones es normal en todos los archivos Wulflemm.
        this.labCurrentMode = Math.max(0, Math.min(2, xml.parseIntAttr("labCurrentMode", 0)));
        this.labPowerMask = xml.parseIntAttr("labPowerMask", 1) & 7;
        if (!this.labPowerMask) this.labPowerMask = 1;
        const limitMode = (n: number, max: number) => Math.max(0, Math.min(max, n));
        this.labPowerReadMode = limitMode(
            xml.parseIntAttr("labPowerReadMode", this.meter === this.PM_INST ? 0 : 3), 3);
        this.labVoltageReadMode = limitMode(xml.parseIntAttr("labVoltageReadMode", 2), 3);
        this.labCurrentReadMode = limitMode(xml.parseIntAttr("labCurrentReadMode", 2), 3);
        this.labShowVoltage = xml.parseIntAttr("labShowVoltage", 0) === 1;
        this.labShowCurrent = xml.parseIntAttr("labShowCurrent", 0) === 1;
        this.labShowCosPhi = xml.parseIntAttr("labShowCosPhi", 0) === 1;
        this.labShowPowerFactor = xml.parseIntAttr("labShowPowerFactor", 0) === 1;
        this.labWindowMode = limitMode(xml.parseIntAttr("labWindowMode", 0), 4);
        this.labMeasurement.clear();`);
once('        const str = CircuitElm.getUnitText(this.getMeterPower(), "W");\n        g.save();\n        let fsize = 15;\n        let w;\n        // adjust font size to fit\n        while (true) {\n            g.setFont(new Font("SansSerif", 0, fsize));\n            w = Math.trunc(g.context.measureText(str).width);\n            if (w < this.maxTextLen)\n                break;\n            fsize--;\n        }\n        g.setColor(CircuitElm.whiteColor);\n        g.context.textBaseline = "middle";\n        g.drawString(str, this.center.x - Math.trunc(w/2), this.center.y);\n        g.restore();',
`        const rows = this.getLabPowerRows();
        g.save();
        // P/Q/S permanecen visibles en el circuito Aron. Los indicadores
        // extra se compactan si el usuario los activa todos.
        let fsize = rows.length >= 7 ? 6 : rows.length === 6 ? 7 :
            rows.length === 5 ? 7 : rows.length === 4 ? 8 :
            rows.length === 3 ? 9 : rows.length === 2 ? 12 : 14;
        while (fsize > 6) {
            g.setFont(new Font("SansSerif", 0, fsize));
            if (rows.every(s => g.context.measureText(s).width < this.maxTextLen))
                break;
            fsize--;
        }
        g.setFont(new Font("SansSerif", 0, fsize));
        const line = fsize + 1;
        g.setColor(CircuitElm.whiteColor);
        g.context.textBaseline = "middle";
        rows.forEach((s, k) => {
            const w = Math.trunc(g.context.measureText(s).width);
            const y = this.center.y + (k - (rows.length-1)/2)*line;
            g.drawString(s, this.center.x-Math.trunc(w/2), y);
        });
        g.restore();`);
once('        const p = this.getPower();\n        const dt = CircuitElm.sim.timeStep;',
`        const p = this.getPower();
        // Muestras de las bobinas reales: V(1)-V(0) e intensidad de 2 a 3.
        this.labMeasurement.add(CircuitElm.sim.t, this.getVoltageDiff(), this.getCurrent());
        const dt = CircuitElm.sim.timeStep;`);
once('    canViewInScope(): boolean { return true; }',
`    private getLabWindowSeconds(period: number | null): number {
        const T = period !== null && period >= 0.0005 && period <= 0.5 ? period : 0.02;
        switch(this.labWindowMode) {
            case 0: return T;
            case 1: return 3*T;
            case 2: return 0.1;
            case 3: return 0.25;
            default: return 0.5;
        }
    }

    private getLabPowerRows(): string[] {
        const type = this.labCurrentMode === 1 ? "dc" : this.labCurrentMode === 2 ? "ac" : "auto";
        const electrical = this.labMeasurement.measure(type);
        const temporal = this.labMeasurement.getWindowReadings(
            this.getLabWindowSeconds(electrical.period));
        const values = temporal ? [temporal.instantaneous,temporal.peak,
            temporal.rms,temporal.mean] : null;
        const choice = this.labPowerReadMode;
        const power = choice === 0 ? this.getPower() :
            values ? values[choice].p : null;
        const result: string[] = [];
        const mask = this.labPowerMask || 1;
        // Reservamos p(t) exclusivamente para potencia instantánea.
        const powerLabel = ["p(t) ", "Pmax ", "PRMS ", "P "][choice];
        const print = (value: number | null, unit: string) =>
            value === null ? "..." : CircuitElm.getUnitText(value,unit);
        if (mask & 1)
            result.push(powerLabel + print(power,"W"));
        if (electrical.kind === "dc" || (electrical.kind === "pending" && type !== "ac")) {
            // Convención solicitada para continua, siempre seleccionables.
            if (mask & 2) result.push("Q 0 VAr");
            if (mask & 4) result.push("S 0 VA");
        } else {
            if (mask & 2) result.push("Q " + print(electrical.q,"VAr"));
            if (mask & 4) result.push("S " + print(electrical.s,"VA"));
        }
        // Lecturas suplementarias opcionales, desactivadas de origen para
        // mantener el dibujo de Aron P/Q/S sin ocupar espacio adicional.
        // Indicadores adimensionales distintos: cosφ usa solo la
        // fundamental; f.d.p. = P/S incluye toda la distorsión.
        const ratio = (value: number | null) =>
            value === null ? "..." : CircuitElm.showFormat.format(value);
        if (this.labShowCosPhi)
            result.push("cosφ " + (electrical.kind === "dc" ? "—" : ratio(electrical.cosPhi)));
        if (this.labShowPowerFactor)
            result.push("f.d.p. " + (electrical.kind === "dc" ? "—" : ratio(electrical.powerFactor)));
        if (this.labShowVoltage) {
            const n = values ? values[this.labVoltageReadMode].v : null;
            result.push(["u(t) ", "Umax ", "URMS ", "Umed "][this.labVoltageReadMode]+print(n,"V"));
        }
        if (this.labShowCurrent) {
            const n = values ? values[this.labCurrentReadMode].i : null;
            result.push(["i(t) ", "Imax ", "IRMS ", "Imed "][this.labCurrentReadMode]+print(n,"A"));
        }
        return result.length ? result : ["P "+CircuitElm.getUnitText(this.getMeterPower(),"W")];
    }

    canViewInScope(): boolean { return true; }`);
once('        arr[3] = "P = " + CircuitElm.getUnitText(this.getVoltageDiff() * this.getCurrent(), "W");\n        arr[4] = "P = " + CircuitElm.getUnitText(this.getAveragePower(), "W");',
`        arr[3] = "p(t) = " + CircuitElm.getUnitText(this.getPower(), "W");
        arr[4] = "P = " + CircuitElm.getUnitText(this.getAveragePower(), "W");
        const currentType = this.labCurrentMode === 1 ? "dc" : this.labCurrentMode === 2 ? "ac" : "auto";
        const powers = this.labMeasurement.measure(currentType);
        const temporal = this.labMeasurement.getWindowReadings(this.getLabWindowSeconds(powers.period));
        const choices = temporal ? [temporal.instantaneous,temporal.peak,
            temporal.rms,temporal.mean] : null;
        const fmt = (value: number | null, unit: string) =>
            value === null ? "..." : CircuitElm.getUnitText(value,unit);
        let line = 5;
        if (this.labPowerMask & 2) {
            const q = powers.kind === "dc" || (powers.kind === "pending" && currentType !== "ac")
                ? "0 VAr" : fmt(powers.q,"VAr");
            arr[line++] = "Q (fundamental) = " + q;
        }
        if (this.labPowerMask & 4) {
            const s = powers.kind === "dc" || (powers.kind === "pending" && currentType !== "ac")
                ? "0 VA" : fmt(powers.s,"VA");
            arr[line++] = "S = " + s;
        }
        const active = this.labPowerReadMode === 0 ? this.getPower() :
            choices ? choices[this.labPowerReadMode].p : null;
        arr[line++] = "Lectura P [" + ["instantánea","pico","RMS","media"][this.labPowerReadMode] +
            "] = " + fmt(active,"W");
        // U e I siempre se consultan en las propiedades, y opcionalmente
        // también se pintan en el cuerpo del vatímetro.
        const voltage = choices ? choices[this.labVoltageReadMode].v : null;
        const current = choices ? choices[this.labCurrentReadMode].i : null;
        arr[line++] = "U [" + ["instantánea","pico","RMS","media"][this.labVoltageReadMode] +
            "] = " + fmt(voltage,"V");
        arr[line++] = "I [" + ["instantánea","pico","RMS","media"][this.labCurrentReadMode] +
            "] = " + fmt(current,"A");
        const fraction = (n: number | null) =>
            n === null ? "..." : CircuitElm.showFormat.format(n);
        if (this.labShowCosPhi)
            arr[line++] = "cos φ (fundamental) = " +
                (powers.kind === "dc" ? "—" : fraction(powers.cosPhi));
        if (this.labShowPowerFactor)
            arr[line++] = "f.d.p. real (P/S) = " +
                (powers.kind === "dc" ? "—" : fraction(powers.powerFactor));`);

once('    getEditInfo(n: number): EditInfo | null {\n        if (n === 0) {\n            const ei = new EditInfo("Value", this.selectedValue, -1, -1);\n            ei.choice = new Choice();\n            ei.choice.add("Instantaneous Power");\n            ei.choice.add("Average Power");\n            ei.choice.select(this.meter);\n            return ei;\n        }\n        return null;\n    }\n\n    setEditValue(n: number, ei: EditInfo): void {\n        if (n === 0)\n            this.meter = ei.choice!.getSelectedIndex();\n    }',
`    getEditInfo(n: number): EditInfo | null {
        // Orden solicitado: tipo de corriente, modo P y magnitudes visibles.
        if (n === 0) {
            const ei = new EditInfo("Tipo de corriente", 0, -1, -1);
            ei.choice = new Choice();
            ei.choice.add("Automatica (detectar)");
            ei.choice.add("Continua (CC)");
            ei.choice.add("Alterna (CA)");
            ei.choice.select(this.labCurrentMode);\n            ei.newDialog = true; // refresca las casillas al cambiar entre CC y CA
            return ei;
        }
        if (n === 1) {
            const ei = new EditInfo("Lectura de P", this.selectedValue, -1, -1);
            ei.choice = new Choice();
            ei.choice.add("Instantanea p(t)");
            ei.choice.add("Pico Pmax");
            ei.choice.add("Eficaz PRMS");
            ei.choice.add("Activa media P");
            ei.choice.select(this.labPowerReadMode);
            return ei;
        }
        if (n === 2) return EditInfo.createCheckbox("Potencia activa P (W)", !!(this.labPowerMask & 1));
        // Casillas Q y S siempre seleccionables; en CC muestran 0 al marcarse.
        if (n === 3) return EditInfo.createCheckbox("Potencia reactiva Q (VAr) - fundamental", !!(this.labPowerMask & 2));
        if (n === 4) return EditInfo.createCheckbox("Potencia aparente S (VA)", !!(this.labPowerMask & 4));
        if (n === 5) return EditInfo.createCheckbox("Mostrar tensión en el vatímetro", this.labShowVoltage);
        if (n === 6 || n === 8) {
            const ei = new EditInfo(n === 6 ? "Lectura de tensión U" : "Lectura de intensidad I", 0, -1, -1);
            ei.choice = new Choice();
            ei.choice.add("Instantanea");
            ei.choice.add("Pico absoluto");
            ei.choice.add("Eficaz RMS");
            ei.choice.add("Media");
            ei.choice.select(n === 6 ? this.labVoltageReadMode : this.labCurrentReadMode);
            return ei;
        }
        if (n === 7) return EditInfo.createCheckbox("Mostrar intensidad en el vatímetro", this.labShowCurrent);
        if (n === 10) return EditInfo.createCheckbox("Mostrar cos φ (fundamental)", this.labShowCosPhi);
        if (n === 11) return EditInfo.createCheckbox("Mostrar f.d.p. real (P/S)", this.labShowPowerFactor);
        if (n === 9) {
            const ei = new EditInfo("Ventana de cálculo de U, I y p(t)", 0, -1, -1);
            ei.choice = new Choice();
            ei.choice.add("1 periodo detectado");
            ei.choice.add("3 periodos detectados");
            ei.choice.add("100 ms");
            ei.choice.add("250 ms");
            ei.choice.add("500 ms");
            ei.choice.select(this.labWindowMode);
            return ei;
        }
        return null;
    }

    setEditValue(n: number, ei: EditInfo): void {
        if (n === 0) {
            const mode = ei.choice!.getSelectedIndex();
            if (mode === 1 && this.labCurrentMode !== 1) {
                // Al pasar a CC, Q y S se desmarcan por defecto.
                // El usuario puede marcarlas después, sin mostrar lectura.
                this.labPowerMask = 1;
                // EditDialog aplica aún las casillas anteriores antes de
                // reconstruirse. Evitar que reactive Q y S en ese paso.
                this.labSwitchingToDC = true;
            }
            this.labCurrentMode = mode;
        }
        if (n === 1) {
            this.labPowerReadMode = ei.choice!.getSelectedIndex();
            // El atributo meter clásico solo conoce instante (0) y media (1).
            this.meter = this.labPowerReadMode === 0 ? this.PM_INST : this.PM_AVG;
        }
        if (n === 5) this.labShowVoltage = ei.checkbox!.getState();
        if (n === 6) this.labVoltageReadMode = ei.choice!.getSelectedIndex();
        if (n === 7) this.labShowCurrent = ei.checkbox!.getState();
        if (n === 8) this.labCurrentReadMode = ei.choice!.getSelectedIndex();
        if (n === 9) this.labWindowMode = ei.choice!.getSelectedIndex();
        if (n === 10) this.labShowCosPhi = ei.checkbox!.getState();
        if (n === 11) this.labShowPowerFactor = ei.checkbox!.getState();
        if (n >= 2 && n <= 4) {
            if (this.labSwitchingToDC && n >= 3) {
                if (n === 4) this.labSwitchingToDC = false;
                return;
            }
            const bit = 1 << (n-2);
            const mask = ei.checkbox!.getState()
                ? this.labPowerMask | bit : this.labPowerMask & ~bit;
            // No admitir un medidor sin ninguna magnitud seleccionada.
            if (mask) this.labPowerMask = mask;
            else ei.checkbox!.setState(true);
        }
    }`);
writeFileSync(source,code);
const target=source.replace(/WattmeterTrueElm\.ts$/, "LabPowerMeasurement.ts");
if(target===source)throw Error("Ruta inesperada de WattmeterTrueElm.ts");
copyFileSync(helper,target);
console.log("Vatimetro ampliado: tipo CA/CC, P, Q1, S; XML Wulflemm sin alterar");

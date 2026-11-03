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
    labMeasurement: LabPowerMeasurement = new LabPowerMeasurement();`);
once('        CircuitXMLSerializer.dumpAttr(elem, "meter", this.meter);',
`        CircuitXMLSerializer.dumpAttr(elem, "meter", this.meter);
        // Atributos optativos: los XML originales de Wulflemm carecen de ellos.
        if (this.labCurrentMode !== 0)
            CircuitXMLSerializer.dumpAttr(elem, "labCurrentMode", this.labCurrentMode);
        if (this.labPowerMask !== 1)
            CircuitXMLSerializer.dumpAttr(elem, "labPowerMask", this.labPowerMask);`);
once('        this.meter = xml.parseIntAttr("meter", this.meter);',
`        this.meter = xml.parseIntAttr("meter", this.meter);
        // La ausencia de estas opciones es normal en todos los archivos Wulflemm.
        this.labCurrentMode = Math.max(0, Math.min(2, xml.parseIntAttr("labCurrentMode", 0)));
        this.labPowerMask = xml.parseIntAttr("labPowerMask", 1) & 7;
        if (!this.labPowerMask) this.labPowerMask = 1;
        this.labMeasurement.clear();`);
once('        const str = CircuitElm.getUnitText(this.getMeterPower(), "W");\n        g.save();\n        let fsize = 15;\n        let w;\n        // adjust font size to fit\n        while (true) {\n            g.setFont(new Font("SansSerif", 0, fsize));\n            w = Math.trunc(g.context.measureText(str).width);\n            if (w < this.maxTextLen)\n                break;\n            fsize--;\n        }\n        g.setColor(CircuitElm.whiteColor);\n        g.context.textBaseline = "middle";\n        g.drawString(str, this.center.x - Math.trunc(w/2), this.center.y);\n        g.restore();',
`        const rows = this.getLabPowerRows();
        g.save();
        // Evitar el solapamiento vertical cuando se muestran varias potencias.
        // La bobina ocupa 32 px de altura en el modelo de cuatro bornes.
        let fsize = rows.length >= 3 ? 9 : rows.length === 2 ? 12 : 14;
        while (fsize > 7) {
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
`    private getLabPowerRows(): string[] {
        const type = this.labCurrentMode === 1 ? "dc" : this.labCurrentMode === 2 ? "ac" : "auto";
        const r = this.labMeasurement.measure(type);
        // En CC, solo potencia activa, independientemente de las casillas de CA.
        if (r.kind === "dc" || (r.kind === "pending" && type !== "ac")) {
            return [CircuitElm.getUnitText(this.getMeterPower(), "W")];
        }
        const result: string[] = [];
        const mask = this.labPowerMask || 1;
        if (mask & 1) {
            const p = this.meter === this.PM_INST ? this.getPower() : r.p;
            result.push((this.meter === this.PM_INST ? "p(t) " : "P ") +
                CircuitElm.getUnitText(p, "W"));
        }
        if (mask & 2)
            result.push("Q " + (r.q == null ? "..." : CircuitElm.getUnitText(r.q, "var")));
        if (mask & 4)
            result.push("S " + (r.s == null ? "..." : CircuitElm.getUnitText(r.s, "VA")));
        return result.length ? result : [CircuitElm.getUnitText(this.getMeterPower(),"W")];
    }

    canViewInScope(): boolean { return true; }`);
once('        arr[3] = "P = " + CircuitElm.getUnitText(this.getVoltageDiff() * this.getCurrent(), "W");\n        arr[4] = "P = " + CircuitElm.getUnitText(this.getAveragePower(), "W");',
`        arr[3] = "p(t) = " + CircuitElm.getUnitText(this.getPower(), "W");
        arr[4] = "P = " + CircuitElm.getUnitText(this.getAveragePower(), "W");
        const currentType = this.labCurrentMode === 1 ? "dc" : this.labCurrentMode === 2 ? "ac" : "auto";
        const powers = this.labMeasurement.measure(currentType);
        if (powers.kind === "ac") {
            arr[5] = "Q (fundamental) = " +
                (powers.q === null ? "..." : CircuitElm.getUnitText(powers.q, "var"));
            arr[6] = "S = " +
                (powers.s === null ? "..." : CircuitElm.getUnitText(powers.s, "VA"));
        }`);

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
            const ei = new EditInfo("Lectura de potencia activa", this.selectedValue, -1, -1);
            ei.choice = new Choice();
            ei.choice.add("Instantanea p(t)");
            ei.choice.add("Activa media P");
            ei.choice.select(this.meter);
            return ei;
        }
        if (n === 2) return EditInfo.createCheckbox("Potencia activa (W)", !!(this.labPowerMask & 1));
        const dc = this.labCurrentMode === 1 ||
            (this.labCurrentMode === 0 && this.labMeasurement.measure("auto").kind === "dc");
        if (dc) return null;
        if (n === 3) return EditInfo.createCheckbox("Potencia reactiva Q (var) - fundamental", !!(this.labPowerMask & 2));
        if (n === 4) return EditInfo.createCheckbox("Potencia aparente S (VA)", !!(this.labPowerMask & 4));
        return null;
    }

    setEditValue(n: number, ei: EditInfo): void {
        if (n === 0) this.labCurrentMode = ei.choice!.getSelectedIndex();
        if (n === 1) this.meter = ei.choice!.getSelectedIndex();
        if (n >= 2 && n <= 4) {
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

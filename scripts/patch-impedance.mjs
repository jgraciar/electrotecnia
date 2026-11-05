// Integra el elemento Z (solo CA) sin modificar ni eliminar los modelos oficiales.
// Se ejecuta después del checkout de pfalstad/circuitjs1 en GitHub Actions.
import {readFileSync,writeFileSync,copyFileSync} from "node:fs";
import {join} from "node:path";
const dir=process.argv[2],elmSource=process.argv[3],mathSource=process.argv[4];
if(!dir||!elmSource||!mathSource)
    throw Error("Uso: patch-impedance.mjs ts-dir scripts/ImpedanceElm.ts scripts/LabImpedance.ts");
const replaceOnce=(path,oldValue,newValue)=>{
    const src=readFileSync(path,"utf8");
    if(src.split(oldValue).length!==2)
        throw Error("El motor oficial ha cambiado en "+path+": "+oldValue);
    writeFileSync(path,src.replace(oldValue,newValue));
};
copyFileSync(elmSource,join(dir,"ImpedanceElm.ts"));
copyFileSync(mathSource,join(dir,"LabImpedance.ts"));
const registry=join(dir,"registerElements.ts");
replaceOnce(registry,'import { ResistorElm } from "./ResistorElm";',
    'import { ResistorElm } from "./ResistorElm";\nimport { ImpedanceElm } from "./ImpedanceElm";');
replaceOnce(registry,
    '    ElementFactory.registerClass("ResistorElm", ResistorElm as any);',
    '    ElementFactory.registerClass("ResistorElm", ResistorElm as any);\n'+
    '    ElementFactory.registerClass("ImpedanceElm", ImpedanceElm as any);');
replaceOnce(registry,
    '    CirSim.theApp.register("ResistorElm", new ResistorElm(0, 0));',
    '    CirSim.theApp.register("ResistorElm", new ResistorElm(0, 0));\n'+
    '    CirSim.theApp.register("ImpedanceElm", new ImpedanceElm(0, 0));');
const menus=join(dir,"Menus.ts");
replaceOnce(menus,
    '            "Add Inductor",                 "InductorElm",',
    '            "Add Inductor",                 "InductorElm",\n'+
    '            "Add Impedance Z (AC, series RLC)", "ImpedanceElm",');
// Un error por alimentación exclusivamente CC detiene el motor de CircuitJS.
// Al importar otro circuito, reanudar únicamente si la parada fue provocada
// por nuestra Z: nunca ocultar paradas del resto de elementos.
const cir=join(dir,"CirSim.ts");
replaceOnce(cir,
    '        if (!subcircuitsOnly)\n            this.resetEditingContext();',
    '        const resumeAfterImpedanceStop = !subcircuitsOnly && /impedancia Z/i.test(this.stopMessage ?? "");\n'+
    '        if (resumeAfterImpedanceStop) this.setStopElm(null, null);\n'+
    '        if (!subcircuitsOnly)\n            this.resetEditingContext();');
replaceOnce(cir,
    '                this.unsavedChanges = false;\n                this.savedFlag = true;',
    '                this.unsavedChanges = false;\n                this.savedFlag = true;\n'+
    '                if (resumeAfterImpedanceStop) this.setSimRunning(true);');
console.log("Impedancia CA Z registrada; el motor se recupera al importar CA tras rechazar CC");

const numberFormat=join(dir,"NumberFormat.ts");
replaceOnce(numberFormat,"    private pattern: string;",`    private pattern: string;
    static decimalSeparator: "." | "," = ",";
    static groupingSeparator: "." | "," | "" = ".";
    static setSeparators(decimal: "." | ",", grouping: "." | "," | ""):void {
        if(grouping===decimal) throw Error("Separadores repetidos");
        NumberFormat.decimalSeparator=decimal;
        NumberFormat.groupingSeparator=grouping;
        if(typeof localStorage!=="undefined"){
            localStorage.setItem("labDecimalSeparator",decimal);
            localStorage.setItem("labGroupingSeparator",grouping);
        }
    }
    private static localized(raw:string):string {
        const parts=raw.split(".");
        if(NumberFormat.groupingSeparator)
            parts[0]=parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g,NumberFormat.groupingSeparator);
        return parts.join(NumberFormat.decimalSeparator);
    }`);
replaceOnce(numberFormat,"return Math.round(v).toString();","return NumberFormat.localized(Math.round(v).toString());");
replaceOnce(numberFormat,"return v.toFixed(digits);","return NumberFormat.localized(v.toFixed(digits));");
replaceOnce(numberFormat,"return parseFloatStrict(v.toFixed(digits)).toString();","return NumberFormat.localized(parseFloatStrict(v.toFixed(digits)).toString());");
replaceOnce(numberFormat,"return exp.replace(/E([+-]?)(\\d+)$/, (_, sign, digits) =>","return NumberFormat.localized(exp.replace(/E([+-]?)(\\d+)$/, (_, sign, digits) =>");
replaceOnce(numberFormat,"digits.padStart(3, '0'));","digits.padStart(3, '0')));");
const circuitElm=join(dir,"CircuitElm.ts");
replaceOnce(circuitElm,"CircuitElm.decimalDigits = 3;","CircuitElm.decimalDigits = 4;");
replaceOnce(circuitElm,"CircuitElm.shortDecimalDigits = 1;","CircuitElm.shortDecimalDigits = 4;");
replaceOnce(circuitElm,'        CircuitElm.setDecimalDigits(CircuitElm.decimalDigits, false, false);',
`        NumberFormat.setSeparators(
            stor?.getItem("labDecimalSeparator")==="."?".":",",
            stor?.getItem("labGroupingSeparator")===""?"":stor?.getItem("labGroupingSeparator")===","?",":".");
        CircuitElm.setDecimalDigits(CircuitElm.decimalDigits, false, false);`);
const opts=join(dir,"EditOptions.ts");
replaceOnce(opts,'import { Locale } from "./Locale";','import { Locale } from "./Locale";\nimport { NumberFormat } from "./NumberFormat";');
replaceOnce(opts,'return new EditInfo("# of Decimal Digits (short format)", CircuitElm.shortDecimalDigits).setInteger();',
'return new EditInfo("Decimales generales (0 a 10)", CircuitElm.decimalDigits, 0, 10).setInteger();');
replaceOnce(opts,'return new EditInfo("# of Decimal Digits (long format)", CircuitElm.decimalDigits).setInteger().newColumnMethod();',
`{
            const ei=new EditInfo("Separador decimal",0,-1,-1).newColumnMethod();
            ei.choice=new Choice();ei.choice.add("Coma (,)");ei.choice.add("Punto (.)");
            ei.choice.select(NumberFormat.decimalSeparator==="."?1:0);return ei;
        }`);
replaceOnce(opts,'        // add new options here (before the adjustTimeStep conditional below)',
`        if(n===21){
            const ei=new EditInfo("Separador de miles",0,-1,-1);
            ei.choice=new Choice();ei.choice.add("Punto (.)");ei.choice.add("Coma (,)");ei.choice.add("Ninguno");
            ei.choice.select(NumberFormat.groupingSeparator==="."?0:NumberFormat.groupingSeparator===","?1:2);
            return ei;
        }
        // add new options here (before the adjustTimeStep conditional below)`);
replaceOnce(opts,'        if (n === 11)\n            CircuitElm.setDecimalDigits(Math.trunc(ei.value), true, true);\n        if (n === 12)\n            CircuitElm.setDecimalDigits(Math.trunc(ei.value), false, true);',
`        if(n===11){
            if(!Number.isInteger(ei.value)||ei.value<0||ei.value>10){
                ei.setError("Decimales: entero de 0 a 10");return;
            }
            CircuitElm.setDecimalDigits(ei.value,true,true);
            CircuitElm.setDecimalDigits(ei.value,false,true);
        }
        if(n===12){
            const decimal=ei.choice!.getSelectedIndex()===0?",":".";
            const grouping=NumberFormat.groupingSeparator===decimal?(decimal===","?".":","):NumberFormat.groupingSeparator;
            NumberFormat.setSeparators(decimal,grouping);ei.newDialog=true;
        }
        if(n===21){
            const idx=ei.choice!.getSelectedIndex();
            const grouping=idx===0?".":idx===1?",":"";
            if(grouping && grouping===NumberFormat.decimalSeparator){
                ei.setError("Los separadores deben ser distintos");return;
            }
            NumberFormat.setSeparators(NumberFormat.decimalSeparator,grouping);
        }`);
console.log("Opciones generales: cuatro decimales y separadores numéricos");

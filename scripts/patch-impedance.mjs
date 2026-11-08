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
copyFileSync(join(elmSource,"..","FilteredBridgeElm.ts"),join(dir,"FilteredBridgeElm.ts"));
const registry=join(dir,"registerElements.ts");
replaceOnce(registry,'import { ResistorElm } from "./ResistorElm";',
    'import { ResistorElm } from "./ResistorElm";\nimport { ImpedanceElm } from "./ImpedanceElm";\nimport { FilteredBridgeElm } from "./FilteredBridgeElm";');
replaceOnce(registry,
    '    ElementFactory.registerClass("ResistorElm", ResistorElm as any);',
    '    ElementFactory.registerClass("ResistorElm", ResistorElm as any);\n'+
    '    ElementFactory.registerClass("ImpedanceElm", ImpedanceElm as any);\n    ElementFactory.registerClass("FilteredBridgeElm", FilteredBridgeElm as any);');
replaceOnce(registry,
    '    CirSim.theApp.register("ResistorElm", new ResistorElm(0, 0));',
    '    CirSim.theApp.register("ResistorElm", new ResistorElm(0, 0));\n'+
    '    CirSim.theApp.register("ImpedanceElm", new ImpedanceElm(0, 0));\n    CirSim.theApp.register("FilteredBridgeElm", new FilteredBridgeElm(0, 0));');
const menus=join(dir,"Menus.ts");
replaceOnce(menus,
    '            "Add Inductor",                 "InductorElm",',
    '            "Add Inductor",                 "InductorElm",\n'+
    '            "Añadir impedancia Z (CA, RLC serie)", "ImpedanceElm",\n'+
    '            "Carga no lineal: puente rectificador con filtro C", "FilteredBridgeElm",');
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
replaceOnce(numberFormat,"return v.toFixed(digits);","return NumberFormat.localized(parseFloatStrict(v.toFixed(digits)).toString());");
replaceOnce(numberFormat,"return parseFloatStrict(v.toFixed(digits)).toString();","return NumberFormat.localized(parseFloatStrict(v.toFixed(digits)).toString());");
replaceOnce(numberFormat,"return exp.replace(/E([+-]?)(\\d+)$/, (_, sign, digits) =>","return NumberFormat.localized(exp.replace(/E([+-]?)(\\d+)$/, (_, sign, digits) =>");
replaceOnce(numberFormat,"digits.padStart(3, '0'));","digits.padStart(3, '0')));");
const circuitElm=join(dir,"CircuitElm.ts");
// Preferencia de escala SI de visualización. No modifica las magnitudes físicas.
replaceOnce(circuitElm,
    '        const sp = sf ? "" : " ";\n        const va = Math.abs(v);',
    `        const sp = sf ? "" : " ";
        const chosenScale=typeof localStorage!=="undefined" ?
            (localStorage.getItem("labDisplayUnitScale") ?? "auto") : "auto";
        const factors:{[key:string]:number}={"micro":1e6,"milli":1e3,"base":1,"kilo":1e-3};
        const prefixes:{[key:string]:string}={"micro":Locale.muString,"milli":"m","base":"","kilo":"k"};
        if(Object.prototype.hasOwnProperty.call(factors,chosenScale) && Number.isFinite(v))
            return CircuitElm.format(v*factors[chosenScale],sf)+sp+prefixes[chosenScale]+u;
        const va = Math.abs(v);`);
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
// El índice original 20 era un ajuste condicional del paso temporal: insertar
// un campo después lo oculta hasta activar el ajuste automático. Colocar
// siempre los separadores juntos y desplazar el resto, sin cambiar su lógica.
replaceOnce(opts,'    getEditInfo(n: number): EditInfo | null {',
`    getEditInfo(n: number): EditInfo | null {
        if(n===13){
            const ei=new EditInfo("Separador de miles",0,-1,-1);
            ei.choice=new Choice();ei.choice.add("Punto (.)");ei.choice.add("Coma (,)");ei.choice.add("Ninguno");
            ei.choice.select(NumberFormat.groupingSeparator==="."?0:NumberFormat.groupingSeparator===","?1:2);
            return ei;
        }
        if(n>=14)n--;`);
replaceOnce(opts,'        if (n === 11)\n            CircuitElm.setDecimalDigits(Math.trunc(ei.value), true, true);\n        if (n === 12)\n            CircuitElm.setDecimalDigits(Math.trunc(ei.value), false, true);',
`        if(n===11){
            if(!Number.isInteger(ei.value)||ei.value<0||ei.value>10){
                ei.setError(Locale.LS("Decimal digits: integer from 0 to 10"));return;
            }
            CircuitElm.setDecimalDigits(ei.value,true,true);
            CircuitElm.setDecimalDigits(ei.value,false,true);
        }
        if(n===12){
            const decimal=ei.choice!.getSelectedIndex()===0?",":".";
            const grouping=NumberFormat.groupingSeparator===decimal?(decimal===","?".":","):NumberFormat.groupingSeparator;
            NumberFormat.setSeparators(decimal,grouping);ei.newDialog=true;
        }`);
replaceOnce(opts,'    setEditValue(n: number, ei: EditInfo): void {',
`    setEditValue(n: number, ei: EditInfo): void {
        if(n===13){
            const idx=ei.choice!.getSelectedIndex();
            const grouping=idx===0?".":idx===1?",":"";
            if(grouping && grouping===NumberFormat.decimalSeparator){
                ei.setError(Locale.LS("Decimal and grouping separators must differ"));return;
            }
            NumberFormat.setSeparators(NumberFormat.decimalSeparator,grouping);
            return;
        }
        if(n>=14)n--;`);
console.log("Opciones generales: cuatro decimales y separadores numéricos");

const editDialog=join(dir,"EditDialog.ts");
replaceOnce(editDialog,'import { parseFloatStrict } from "./NumberParse";',
'import { parseFloatStrict } from "./NumberParse";\nimport { NumberFormat } from "./NumberFormat";');
replaceOnce(editDialog,'    static parseUnits(s: string): number {\n        s = s.trim();',
`    static parseUnits(s: string): number {
        s = s.trim();
        const decimal=NumberFormat.decimalSeparator;
        const grouping=NumberFormat.groupingSeparator;
        // Aceptar exclusivamente el agrupamiento regional correcto.
        // No alterar los valores internos, XML ni los sufijos de ingeniería.
        const numeric=s.match(/^([+-]?(?:[0-9][0-9.,]*|[.,][0-9]+))(.*)$/);
        if(numeric){
            let value=numeric[1];
            const suffix=numeric[2];
            if(grouping && value.includes(grouping)){
                const groups=value.split(decimal)[0].split(grouping);
                if(groups.length>1 && !(groups[0].length>=1 && groups[0].length<=3 &&
                    groups.slice(1).every(g=>/^\\d{3}$/.test(g))))
                    throw Error("Agrupación de miles incorrecta");
                value=value.split(grouping).join("");
            }
            if(decimal!==".") value=value.replace(decimal,".");
            if((value.match(/\\./g)||[]).length>1 || !/^[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)$/.test(value))
                throw Error("Número no válido para los separadores elegidos");
            s=value+suffix;
        }`);
console.log("Entrada regional: separadores decimales y de miles");

replaceOnce(editDialog,'                    this.activeCol.appendChild(this.makeValueStepperRow(ei));',
`                    this.activeCol.appendChild(this.makeValueStepperRow(ei));
                    const hint=document.createElement("small");
                    hint.className="lab-numeric-format-hint";
                    hint.style.cssText="color:#68727d;font-size:9px;font-weight:normal;";
                    const decimal=NumberFormat.decimalSeparator;
                    const grouping=NumberFormat.groupingSeparator;
                    const european=decimal==="," && grouping===".";
                    const anglo=decimal==="." && grouping===",";
                    const regional=european?Locale.LS("European number format"):
                        anglo?Locale.LS("Anglo-American number format"):
                        Locale.LS("Custom number format");
                    const example=grouping?"1"+grouping+"234"+decimal+"5678":"1234"+decimal+"5678";
                    hint.textContent="; "+regional+
                        (!european&&!anglo?" ("+example+")":"");
                    label.appendChild(hint);`);
replaceOnce(editDialog,'        if (ei !== null && ei.dimensionless) return noCommaFormat(v);',
'        if (ei !== null && ei.dimensionless) return NumberFormat.localizedInput(noCommaFormat(v));');
const numberFormatInput=join(dir,"NumberFormat.ts");
replaceOnce(numberFormatInput,'    private static localized(raw:string):string {',
`    static localizedInput(raw:string):string {
        const parts=raw.split(".");
        if(NumberFormat.groupingSeparator && !/[eE]/.test(raw))
            parts[0]=parts[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g,NumberFormat.groupingSeparator);
        return parts.join(NumberFormat.decimalSeparator);
    }
    private static localized(raw:string):string {`);
replaceOnce(editDialog,'        if (va < 1e-12) return noCommaFormat(v * 1e15) + "f";',
'        if (va < 1e-12) return NumberFormat.localizedInput(noCommaFormat(v * 1e15)) + "f";');
for(const [a,b] of [[1e-9,1e12,"p"],[1e-6,1e9,"n"],[1e-3,1e6,"u"],[1,1e3,"m"],[1e3,null,""],[1e6,1e-3,"k"],[1e9,1e-6,"M"]].map(x=>[x[0],x[1],x[2]])){
    const old=a===1e3?'        if (va < 1e3)   return noCommaFormat(v);':a===1?'        if (va < 1)     return noCommaFormat(v * 1e3)  + "m";':null;
    if(old) replaceOnce(editDialog,old,old.replace("noCommaFormat(v"+(a===1?" * 1e3":"")+")","NumberFormat.localizedInput(noCommaFormat(v"+(a===1?" * 1e3":"")+"))"));
}
console.log("Editor: ejemplo de formato regional junto a cada entrada numérica");

// Añadir las traducciones propias sin sustituir el catálogo original.
const spanishCatalog=join(dir,"public","locale","locale_es.txt");
const ownTranslations=[["Impedance Z (AC only)","Impedancia Z (solo CA)"],["Impedance Z is only available in AC","La impedancia Z solo está disponible en CA"],["Impedance Z requires an AC source (DC-only circuits are not supported)","Impedancia Z: se requiere una fuente de CA (no admite circuito solo CC)"],["Impedance Z · AC only · series connection","Impedancia Z · solo CA · asociación serie"],["Magnitude |Z| and phase φ","Módulo |Z| y argumento φ"],["Resistance R and reactance X","Resistencia R y reactancia X"],["Physical components R, L and C","Componentes físicos R, L y C"],["AC frequency detected from source","Frecuencia CA detectada de la fuente"],[" (automatic)"," (automática)"],["Reference AC frequency (Hz; no unique source)","Frecuencia de referencia CA (Hz; sin fuente única)"],["Magnitude |Z| (Ω)","Módulo |Z| (Ω)"],["Phase φ (°)","Argumento φ (°)"],["Resistance R (Ω)","Resistencia R (Ω)"],["Reactance X (Ω), +L / -C","Reactancia X (Ω), +L / -C"],["Inductance L (H), 0 = omit","Inductancia L (H), 0 = omitir"],["Capacitance C (F), 0 = omit","Capacidad C (F), 0 = omitir"],["Value display on schematic","Visualización del valor en el esquema"],["Magnitude |Z| only","Solo módulo |Z|"],["Components R, L and C","Componentes R, L y C"]];
const existingCatalog=readFileSync(spanishCatalog,"utf8");
const addedTranslations=ownTranslations.filter(([en])=>!existingCatalog.includes(JSON.stringify(en)+"="))
    .map(([en,es])=>JSON.stringify(en)+"="+JSON.stringify(es)).join("\n");
if(addedTranslations)writeFileSync(spanishCatalog,existingCatalog+"\n"+addedTranslations+"\n");

// Conservar la detección del navegador y la preferencia manual de CircuitJS.
// Cuando el catálogo del idioma solicitado no existe, utilizar español.
const localeSource=join(dir,"Locale.ts");
replaceOnce(localeSource,
    '                // if there was an error in retrieving the\n                // language, default to English (empty map)\n                Locale.localizationMap = new Map<string, string>();',
    '                // Catálogo inexistente: utilizar el español del laboratorio.\n                await Locale.loadSpanishFallback();');
replaceOnce(localeSource,
    '            Locale.localizationMap = new Map<string, string>();\n        }\n    }\n}',
    '            await Locale.loadSpanishFallback();\n        }\n    }\n\n    static async loadSpanishFallback(): Promise<void> {\n        try {\n            const response = await fetch(moduleBaseURL + "locale/locale_es.txt");\n            Locale.localizationMap = response.ok ? Locale.processLocale(await response.text()) : new Map<string, string>();\n        } catch (e) {\n            console.log("Spanish fallback locale failed", e);\n            Locale.localizationMap = new Map<string, string>();\n        }\n    }\n}');
console.log("Idioma automático del navegador; reserva en español si no existe catálogo");

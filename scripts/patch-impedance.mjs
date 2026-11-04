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
    '        const resumeAfterImpedanceStop = !subcircuitsOnly && !!this.stopMessage?.startsWith("Impedancia Z");\n'+
    '        if (resumeAfterImpedanceStop) this.setStopElm(null, null);\n'+
    '        if (!subcircuitsOnly)\n            this.resetEditingContext();');
replaceOnce(cir,
    '                this.unsavedChanges = false;\n                this.savedFlag = true;',
    '                this.unsavedChanges = false;\n                this.savedFlag = true;\n'+
    '                if (resumeAfterImpedanceStop) this.setSimRunning(true);');
console.log("Impedancia CA Z registrada; el motor se recupera al importar CA tras rechazar CC");

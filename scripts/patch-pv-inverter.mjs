import {readFileSync,writeFileSync,copyFileSync} from "node:fs";
import {join,dirname} from "node:path";
const [dir,source,reference]=process.argv.slice(2);
if(!dir||!source||!reference)throw Error("Uso: patch-pv-inverter.mjs ts-dir PVInverterElm.ts LabPVInverter.ts");
copyFileSync(source,join(dir,"PVInverterElm.ts"));
copyFileSync(reference,join(dir,"LabPVInverter.ts"));
function replaceOnce(path,oldText,newText){
 const s=readFileSync(path,"utf8");
 if(s.split(oldText).length!==2)throw Error("Anclaje ausente o duplicado en "+path+": "+oldText);
 writeFileSync(path,s.replace(oldText,newText));
}
const registry=join(dir,"registerElements.ts");
replaceOnce(registry,
 'import { ResistorElm } from "./ResistorElm";',
 'import { ResistorElm } from "./ResistorElm";\nimport { PVInverterElm } from "./PVInverterElm";');
replaceOnce(registry,
 '    ElementFactory.registerClass("ResistorElm", ResistorElm as any);',
 '    ElementFactory.registerClass("ResistorElm", ResistorElm as any);\n    ElementFactory.registerClass("PVInverterElm", PVInverterElm as any);');
replaceOnce(registry,
 '    CirSim.theApp.register("ResistorElm", new ResistorElm(0, 0));',
 '    CirSim.theApp.register("ResistorElm", new ResistorElm(0, 0));\n    CirSim.theApp.register("PVInverterElm", new PVInverterElm(0, 0));');
const menus=join(dir,"Menus.ts");
replaceOnce(menus,
 '            "Add Current Source",                   "CurrentElm",',
 '            "Add Current Source",                   "CurrentElm",\n            "Inversor fotovoltaico FV (CA)", "PVInverterElm",');
// Opción inicial: mostrar la unidad Ω al lado de las resistencias.
replaceOnce(menus,
 '    showOhmCheckItem         = new CheckItem();',
 '    showOhmCheckItem         = new CheckItem(true);');
// UIManager carga las opciones del usuario DESPUÉS de crear el menú.
// El valor inicial debe corregirse también aquí; no sobrescribir
// elecciones guardadas (showOhm=false) ni parámetros de URL.
const ui=join(dir,"UIManager.ts");
replaceOnce(ui,
 'showOhm       = qp.getBooleanValue("showOhm", this.getOptionFromStorage("showOhm", false));',
 'showOhm       = qp.getBooleanValue("showOhm", this.getOptionFromStorage("showOhm", true));');
console.log("Inversor FV registrado en CircuitJS");

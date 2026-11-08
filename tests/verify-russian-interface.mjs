// Auditoría por idioma: interfaz visible de CircuitJS en ruso.
// Lee los TypeScript realmente preparados por el proceso de compilación.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labTranslation} from "../scripts/LabTranslations.ts";

const dir=process.argv[2];
if(!dir)throw Error("Uso: verify-russian-interface.mjs <ts-dir>");
const officialText=readFileSync(join(dir,"public/locale/locale_ru.txt"),"utf8");
const official=new Map([...officialText.matchAll(/^"([^"]*)"="([^"]*)"$/gm)]
  .map(m=>[m[1],m[2]]));
const files=[
 "AboutBox","EditDialog","EditOptions","UIManager","Menus","ScopePopupMenu",
 "ScopePropertiesDialog","ScopeOverlays","ScopeFFT","ScopePlot2d","Scope",
 "Toolbar","SubcircuitBar","SubcircuitDialog","SliderDialog","ShortcutsDialog",
 "ImportFromTextDialog","ImportFromDropboxDialog","ExportAsImageDialog",
 "ExportAsLocalFileDialog","ExportAsTextDialog","ExportAsUrlDialog",
 "ScopeExportImageDialog","EditDiodeModelDialog","EditMosfetModelDialog",
 "EditRelayModelDialog","EditTransistorModelDialog","EditSubcircuitModelDialog",
 "GetCircuitAsSubcircuit","CommandPalette","ScrollValuePopup","Dialog"
];
const visibleKeys=new Set();
for(const name of files){
 const src=readFileSync(join(dir,name+".ts"),"utf8");
 const patterns=[
  /Locale\.LS\(\s*(["'])(.*?)\1\s*\)/g,
  /(?:new ScopeCheckBox|new ExpandingSection|makeXYSelect|addPlain|new EditInfo|new Checkbox)\(\s*(["'])(.*?)\1/g
 ];
 for(const pattern of patterns)
  for(const m of src.matchAll(pattern))if(m[2]?.trim())visibleKeys.add(m[2]);
 // Radio label: the first literal is the input group, not user-visible.
 for(const m of src.matchAll(/\.makeRadio\(\s*(["'])[^"'\n]+\1\s*,\s*(["'])(.*?)\2/g))
  visibleKeys.add(m[3]);
}
const absent=[...visibleKeys].filter(key=>!official.has(key)&&
 !official.has("&nbsp;</div>"+key)&&labTranslation("ru",key)==null);
assert.deepEqual(absent,[],"Cadenas visibles sin traducción rusa en el código TypeScript");
const mustBeRussian=[
 "Can't delete subcircuits in use in the current circuit: ",
 "Share Slider: ","Export Image","Transparent Background",
 "Type a command...","Recent",
 "Run","Stop","Reset","Scope Properties","Export Image...",
 "Vertical Scale","Horizontal Scale","DC Coupled","AC Coupled",
 "Show Spectrum","Show RMS Average","Show Phase Angle",
 "Time step size (s)","Show Properties on Create",
 "Show Properties on Click","Matrix Solver","Change Language",
 "Command Palette","Please select one or more subcircuits."
];
for(const key of mustBeRussian){
 const value=labTranslation("ru",key)??official.get(key);
 assert(value?.trim(),"Falta traducción rusa: "+key);
 assert.notEqual(value,key,"Se muestra inglés en ruso: "+key);
}
for(const key of ["Plot ","Max=","Min=","P-P=","CH ","default"," average"])
 assert(labTranslation("ru",key),
  "Falta la leyenda de osciloscopio en ruso: "+key);
console.log("OK ruso: "+files.length+" archivos de interfaz, "+
 visibleKeys.size+" textos visibles y "+mustBeRussian.length+
 " traducciones sensibles examinadas.");

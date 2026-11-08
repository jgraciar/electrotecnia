// Auditoría por idioma: controles, diálogos y leyendas en español de CircuitJS.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labTranslation} from "../scripts/LabTranslations.ts";

const dir=process.argv[2];
if(!dir)throw Error("Uso: verify-spanish-interface.mjs <ts-dir>");
const catalog=readFileSync(join(dir,"public/locale/locale_es.txt"),"utf8");
const official=new Map([...catalog.matchAll(/^"([^"]*)"="([^"]*)"$/gm)]
 .map(m=>[m[1],m[2]]));
// Archivos que generan texto visible y menús en el simulador.
const files=[
 "AboutBox","EditDialog","EditOptions","UIManager","Menus","ScopePopupMenu",
 "ScopePropertiesDialog","ScopeOverlays","ScopeFFT","ScopePlot2d","Scope",
 "Toolbar","SubcircuitBar","SubcircuitDialog","SliderDialog","ShortcutsDialog",
 "ImportFromTextDialog","ImportFromDropboxDialog","ExportAsImageDialog",
 "ExportAsLocalFileDialog","ExportAsTextDialog","ExportAsUrlDialog",
 "ScopeExportImageDialog","EditDiodeModelDialog","EditMosfetModelDialog",
 "EditRelayModelDialog","EditTransistorModelDialog","EditSubcircuitModelDialog",
 "GetCircuitAsSubcircuit","CommandPalette","ScrollValuePopup","Dialog",
 "TypeScrollPopup","CircuitElm"
];
const found=new Set();
for(const name of files){
 const src=readFileSync(join(dir,name+".ts"),"utf8");
 const patterns=[
  /Locale\.LS\(\s*(["'])(.*?)\1\s*\)/g,
  /(?:new ScopeCheckBox|new ExpandingSection|makeXYSelect|addPlain|new EditInfo|new Checkbox)\(\s*(["'])(.*?)\1/g
 ];
 for(const pattern of patterns)
  for(const m of src.matchAll(pattern))if(m[2]?.trim())found.add(m[2]);
 for(const m of src.matchAll(/\.makeRadio\(\s*(["'])[^"'\n]+\1\s*,\s*(["'])(.*?)\2/g))
  found.add(m[3]);
}
const missing=[...found].filter(key=>
 labTranslation("es",key)==null&&!official.has(key)&&
 !official.has("&nbsp;</div>"+key));
assert.deepEqual(missing,[],"Cadenas visibles sin traducción al español");

// Comprobar traducciones de ventanas que no figuraban en el catálogo español.
const reviewed=[
 ["Export Image","Exportar imagen"],
 ["Node {name} cannot be connected to ground","El nodo «{name}» no puede conectarse a tierra"],
 ["Element {name} refers to a node outside the selection","El elemento «{name}» hace referencia a un nodo fuera de la selección"],
 ["Node {name} is not used!","¡El nodo «{name}» no se utiliza!"],
 ["File too large!","¡El archivo es demasiado grande!"],
 ["Dropbox links must start https://www.dropbox.com/","Los enlaces de Dropbox deben empezar por https://www.dropbox.com/"],
 ["Transparent Background","Fondo transparente"],
 ["Type a command...","Escribe un comando..."],
 ["Recent","Recientes"],
 ["Bessel vs Butterworth","Bessel frente a Butterworth"],
 ["LM137000 Gain Oddity","Comportamiento anómalo de la ganancia del LM137000"],
 ["Zoom 100%","Ampliación al 100 %"],
 ["inductor (sat)","bobina saturable"],
 ["dur = ","duración = "],
 ["ext","externo"],
 ["Export Image...","Exportar imagen..."],
 ["Scroll Speed","Velocidad de desplazamiento"],
 ["JK\\q01: Reset","JK\\q01: Reposición"],
 ["Show Properties on Create","Mostrar propiedades al crear"],
 ["Show Properties on Click","Mostrar propiedades al pulsar"],
 ["Plot ","Gráfica "],
 ["CH ","Canal "],
 ["/div","/div."]
];
for(const [key,value] of reviewed)
 assert.equal(labTranslation("es",key),value,
  "Se ha perdido la traducción española de "+key);
// Detectar anglicismos residuales también en entradas antiguas que sí
// existen en locale_es.txt pero conservaban su valor en inglés.
const anglicisms=/\b(?:flip[- ]?flop|driver|display|offset|trigger|default|click|load|scroll|buffer|vs|scope|zoom|open|close|run|stop|view|input|output|back|editing disabled)\b/i;
const mixed=[...official].filter(([key,value])=>
 anglicisms.test(labTranslation("es",key)??value))
 .map(([key,value])=>key+" => "+(labTranslation("es",key)??value));
assert.deepEqual(mixed,[],
 "Las cadenas del catálogo oficial todavía mezclan inglés y español");
for(const key of ["Scope Properties","Vertical Scale","Horizontal Scale",
 "DC Coupled","AC Coupled","Show Phase Angle",
 "Show RMS Average","Matrix Solver","Show Spectrum","Run","Stop",
 "Please select one or more subcircuits.","Can't delete subcircuits in use in the current circuit: "])
 assert((labTranslation("es",key)??official.get(key))?.trim(),
  "Etiqueta española sin traducir: "+key);
for(const key of ["Plot ","Max=","Min=","P-P=","/div"])
 assert(readFileSync(join(dir,"ScopeOverlays.ts"),"utf8").includes('Locale.LS("'+key+'")'),
  "Texto del osciloscopio sin pasar por el traductor: "+key);
// Los rótulos de rendimiento y las advertencias del modo desarrollador
// no pueden saltarse la traducción por estar dibujados sobre el lienzo.
const canvasUI=readFileSync(join(dir,"UIManager.ts"),"utf8");
for(const [key,expected] of [
 ["Framerate: ","Fotogramas/s: "],
 ["Steprate: ","Pasos/s: "],
 ["Steprate/iter: ","Pasos/s por iteración: "],
 ["iterc: ","Iteraciones: "],
 ["Frames: ","Fotogramas: "],
 ["Mouse: ","Ratón: "],
 ["exception, see console!","Excepción: consulta la consola"]
]){
 assert.equal(labTranslation("es",key),expected,"Falta indicador español: "+key);
 assert(canvasUI.includes('Locale.LS("'+key+'")'),
  "La etiqueta del modo desarrollador se muestra en inglés: "+key);
}
assert(readFileSync(join(dir,"ScopePropertiesDialog.ts"),"utf8")
 .includes("Locale.LS('CH ')"));
assert(readFileSync(join(dir,"UIManager.ts"),"utf8")
 .includes("alert(Locale.LS('File too large!'))"),
 "La advertencia de archivo grande se sigue mostrando en inglés");
assert(readFileSync(join(dir,"ImportFromDropboxDialog.ts"),"utf8")
 .includes('window.alert(Locale.LS("Dropbox links must start https://www.dropbox.com/"))'),
 "La advertencia del enlace Dropbox sigue en inglés");
const subcircuitText=readFileSync(join(dir,"GetCircuitAsSubcircuit.ts"),"utf8");
for(const key of ["Node {name} cannot be connected to ground",
 "Element {name} refers to a node outside the selection","Node {name} is not used!"]){
 assert(subcircuitText.includes("Locale.LS("+JSON.stringify(key)+")"),
  "El aviso de subcircuitos sigue en inglés: "+key);
}
assert(!/window\\.alert\\('Node "|window\\.alert\\('Element "/.test(subcircuitText),
 "Persiste un aviso de subcircuitos sin traducir");
console.log("OK español: "+files.length+" archivos, "+found.size+
 " etiquetas visibles y "+reviewed.length+" traducciones revisadas.");

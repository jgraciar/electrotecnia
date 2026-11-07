// Adapta el cargador de idiomas del CircuitJS actual, conservando los catálogos
// oficiales y añadiendo las traducciones propias del laboratorio en 8 idiomas.
import {readFileSync,writeFileSync,copyFileSync} from "node:fs";
import {join} from "node:path";
const [dir,translations]=process.argv.slice(2);
if(!dir||!translations)throw Error("Uso: patch-lab-localization.mjs ts-dir LabTranslations.ts");
copyFileSync(translations,join(dir,"LabTranslations.ts"));
function once(path,oldText,newText){
 const src=readFileSync(path,"utf8");
 if(src.split(oldText).length!==2)
  throw Error("Anclaje de traducciones ausente o duplicado: "+path+" "+oldText.slice(0,90));
 writeFileSync(path,src.replace(oldText,newText));
}
const locale=join(dir,"Locale.ts");
once(locale,'import { moduleBaseURL } from "./ModuleBase";',
 'import { moduleBaseURL } from "./ModuleBase";\nimport { labTranslation } from "./LabTranslations";');
once(locale,'    static localizationMap: Map<string, string> = new Map();',
 '    static localizationMap: Map<string, string> = new Map();\n    static activeLanguage: string = "en";');
once(locale,'        const sm = Locale.localizationMap.get(s);',
 '        const own = labTranslation(Locale.activeLanguage,s);\n'+
 '        if(own!==null)return own;\n'+
 '        const sm = Locale.localizationMap.get(s);');
once(locale,'        if (sm != null)\n            return sm;',
 '        if (sm != null)\n            return sm;\n\n'+
 '        // Las categorías antiguas tienen la clave "&nbsp;</div>Nombre".\n'+
 '        // El menú TS usa ahora Locale.LS("Nombre"): recuperar sus etiquetas.\n'+
 '        const legacy = Locale.localizationMap.get("&nbsp;</div>"+s);\n'+
 '        if(legacy!=null)return legacy.replace(/^.*?<\\/div>/i,"").trim();');
once(locale,'        if (lang.startsWith("en")) {',
 '        Locale.activeLanguage = lang.toLowerCase();\n'+
 '        if (lang.startsWith("en")) {');
once(locale,'                // Catálogo inexistente: utilizar el español del laboratorio.\n                await Locale.loadSpanishFallback();',
 '                // No existe catálogo oficial neerlandés: usar la interfaz\n'+
 '                // base inglesa, pero traducir todos los elementos añadidos.\n'+
 '                if(Locale.activeLanguage==="nl") Locale.localizationMap=new Map();\n'+
 '                else await Locale.loadSpanishFallback();');
const dialog=join(dir,"EditDialog.ts");
once(dialog,'                    opt.textContent = ei.choice.items[j];',
 '                    opt.textContent = Locale.LS(ei.choice.items[j]);');
once(dialog,'                cbLabel.appendChild(document.createTextNode(ei.checkbox.name));',
 '                cbLabel.appendChild(document.createTextNode(Locale.LS(ei.checkbox.name)));');
once(dialog,'                btn.textContent = ei.button.label ?? ei.button.textContent ?? String(ei.button);',
 '                btn.textContent = Locale.LS(ei.button.label ?? ei.button.textContent ?? String(ei.button));');
console.log("Traducciones activadas: menús heredados, opciones de selección y 8 idiomas");

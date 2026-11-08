// Adapta el cargador de idiomas del CircuitJS actual, conservando los catálogos
// oficiales y añadiendo las traducciones propias del laboratorio en los 16 idiomas de CircuitJS.
import {readFileSync,writeFileSync,copyFileSync} from "node:fs";
import {join,dirname} from "node:path";
const [dir,translations]=process.argv.slice(2);
if(!dir||!translations)throw Error("Uso: patch-lab-localization.mjs ts-dir LabTranslations.ts");
copyFileSync(translations,join(dir,"LabTranslations.ts"));
copyFileSync(join(dirname(translations),"LabTranslationsMenus.ts"),join(dir,"LabTranslationsMenus.ts"));
function once(path,oldText,newText){
 const src=readFileSync(path,"utf8");
 if(src.split(oldText).length!==2)
  throw Error("Anclaje de traducciones ausente o duplicado: "+path+" "+oldText.slice(0,90));
 writeFileSync(path,src.replace(oldText,newText));
}
// TypeScript 6 permite imports .ts explícitos para el cargador nativo de Node.
once(join(dir,"tsconfig.json"),'    "noEmit": true,',
 '    "noEmit": true,\n    "allowImportingTsExtensions": true,');
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
 '        // CircuitJS usa csx para checo y kr para coreano.\n'+
 '        if(lang==="cs")lang="csx";\n'+
 '        if(lang==="ko")lang="kr";\n'+
 '        Locale.activeLanguage = lang.toLowerCase();\n'+
 '        if (lang.startsWith("en")) {');
once(locale,'                // Catálogo inexistente: utilizar el español del laboratorio.\n                await Locale.loadSpanishFallback();',
 '                // Neerlandés y sueco aún no tienen catálogo oficial completo: usar la interfaz\n'+
 '                // base inglesa, pero traducir todos los elementos añadidos.\n'+
 '                if(["nl","sv"].includes(Locale.activeLanguage)) Locale.localizationMap=new Map();\n'+
 '                else await Locale.loadSpanishFallback();');
// Windows usa ca-ES-valencia. No debe reducirse a «ca» al
// normalizar variantes regionales antes de cargar el catálogo.
once(locale,
 '        if (lang.toLowerCase() === "zh-tw" || lang.toLowerCase() === "zh-cht")',
 '        if (lang.toLowerCase().startsWith("ca-es-valencia"))\n'+
 '            lang = "ca-es-valencia";\n'+
 '        else if (lang.toLowerCase() === "zh-tw" || lang.toLowerCase() === "zh-cht")');
// CircuitJS solo incluye 15 catálogos de idioma originales. Para los
// cuatro nuevos, utilizar los textos originales en español como respaldo,
// pero mantener el idioma cooficial en todos los elementos del laboratorio.
once(locale,
 '        const url = moduleBaseURL + "locale/locale_" + lang + ".txt";',
 '        const originalLang = ["ca","ca-es-valencia","gl","eu"].includes(lang)?"es":lang;\n'+
 '        const url = moduleBaseURL + "locale/locale_" + originalLang + ".txt";');
const dialog=join(dir,"EditDialog.ts");
once(dialog,'                    opt.textContent = ei.choice.items[j];',
 '                    opt.textContent = Locale.LS(ei.choice.items[j]);');
once(dialog,'                cbLabel.appendChild(document.createTextNode(ei.checkbox.name));',
 '                cbLabel.appendChild(document.createTextNode(Locale.LS(ei.checkbox.name)));');
once(dialog,'                btn.textContent = ei.button.label ?? ei.button.textContent ?? String(ei.button);',
 '                btn.textContent = Locale.LS(ei.button.label ?? ei.button.textContent ?? String(ei.button));');
// Extender «Otras opciones > Cambiar idioma» con las lenguas cooficiales.
// Mantener los índices 1..16 existentes para evitar alterar su semántica.
const options=join(dir,"EditOptions.ts");
once(options,
 '            ei.choice.add("한국어"); // Korean\n            return ei;',
 '            ei.choice.add("한국어"); // Korean\n'+
 '            ei.choice.add("Català");\n'+
 '            ei.choice.add("Valencià");\n'+
 '            ei.choice.add("Galego");\n'+
 '            ei.choice.add("Euskara");\n'+
 '            ei.choice.add("Nederlands");\n'+
 '            ei.choice.add("Svenska");\n'+
 '            return ei;');
once(options,
 '            case 16: langString = "kr";  break;',
 '            case 16: langString = "kr";  break;\n'+
 '            case 17: langString = "ca"; break;\n'+
 '            case 18: langString = "ca-es-valencia"; break;\n'+
 '            case 19: langString = "gl"; break;\n'+
 '            case 20: langString = "eu"; break;\n'+
 '            case 21: langString = "nl"; break;\n'+
 '            case 22: langString = "sv"; break;');
once(options,
 '            stor.setItem("language", langString);',
 '            stor.setItem("language", langString);\n'+
 '            stor.setItem("labLanguageMode", "manual");');
console.log("Traducciones activadas: menús y controles de edición en 22 idiomas");

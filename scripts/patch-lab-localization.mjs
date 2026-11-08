// Adapta el cargador de idiomas del CircuitJS actual, conservando los catálogos
// oficiales y añadiendo las traducciones propias del laboratorio en los 16 idiomas de CircuitJS.
import {readFileSync,writeFileSync,copyFileSync} from "node:fs";
import {join,dirname} from "node:path";
import {spawnSync} from "node:child_process";
const [dir,translations]=process.argv.slice(2);
if(!dir||!translations)throw Error("Uso: patch-lab-localization.mjs ts-dir LabTranslations.ts");
copyFileSync(translations,join(dir,"LabTranslations.ts"));
copyFileSync(join(dirname(translations),"LabTranslationsMenus.ts"),join(dir,"LabTranslationsMenus.ts"));
copyFileSync(join(dirname(translations),"LabTranslationsNativeMenus.ts"),join(dir,"LabTranslationsNativeMenus.ts"));
copyFileSync(join(dirname(translations),"CircuitJsDrawLabels.ts"),join(dir,"CircuitJsDrawLabels.ts"));
copyFileSync(join(dirname(translations),"CircuitJsSupplementalUi.ts"),join(dir,"CircuitJsSupplementalUi.ts"));
copyFileSync(join(dirname(translations),"CircuitJsUiCompleteness.ts"),join(dir,"CircuitJsUiCompleteness.ts"));
copyFileSync(join(dirname(translations),"CircuitJsScopeOptions.ts"),join(dir,"CircuitJsScopeOptions.ts"));
copyFileSync(join(dirname(translations),"CircuitJsGeneralOptions.ts"),join(dir,"CircuitJsGeneralOptions.ts"));
function once(path,oldText,newText){
 const src=readFileSync(path,"utf8");
 if(src.split(oldText).length!==2)
  throw Error("Anclaje de traducciones ausente o duplicado: "+path+" "+oldText.slice(0,90));
 writeFileSync(path,src.replace(oldText,newText));
}
// TypeScript 6 permite imports .ts explícitos para el cargador nativo de Node.
once(join(dir,"tsconfig.json"),'    "noEmit": true,',
 '    "noEmit": true,\n    "allowImportingTsExtensions": true,');
// Generar el catálogo valenciano completo con las mismas claves originales.
const repoRoot=join(dirname(translations),"..");
const valencianBuild=spawnSync(process.execPath,[join(repoRoot,"scripts/build-valencian-catalog.mjs"),dir,repoRoot],
 {stdio:"inherit"});
if(valencianBuild.status!==0)throw Error("Error al generar el catálogo valenciano");
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
 '        const originalLang = ["ca","gl","eu"].includes(lang)?"es":lang;\n'+
 '        const url = moduleBaseURL + "locale/locale_" + originalLang + ".txt";');
const dialog=join(dir,"EditDialog.ts");
once(dialog,'                    opt.textContent = ei.choice.items[j];',
 '                    opt.textContent = Locale.LS(ei.choice.items[j]);');
once(dialog,'                cbLabel.appendChild(document.createTextNode(ei.checkbox.name));',
 '                cbLabel.appendChild(document.createTextNode(Locale.LS(ei.checkbox.name)));');
once(dialog,'                btn.textContent = ei.button.label ?? ei.button.textContent ?? String(ei.button);',
 '                btn.textContent = Locale.LS(ei.button.label ?? ei.button.textContent ?? String(ei.button));');
// Todos los controles visibles de «Añadir deslizadores» deben utilizar Locale.LS.
// Los textos suministrados por el usuario (por ejemplo, el nombre del deslizador) no se traducen.
const slider=join(dir,"SliderDialog.ts");
once(slider,"import { Checkbox } from \"./Checkbox\";","import { Checkbox } from \"./Checkbox\";\nimport { Locale } from \"./Locale\";");
once(slider,"title.textContent = \"Add Sliders\";","title.textContent = Locale.LS(\"Add Sliders\");");
once(slider,"applyButton.textContent = \"Apply\";","applyButton.textContent = Locale.LS(\"Apply\");");
once(slider,"okButton.textContent = \"OK\";","okButton.textContent = Locale.LS(\"OK\");");
once(slider,"cancelButton.textContent = \"Cancel\";","cancelButton.textContent = Locale.LS(\"Cancel\");");
once(slider,"let name = ei.name.replace(/<[^>]*>/g, \"\");","let name = Locale.LS(ei.name.replace(/<[^>]*>/g, \"\"));");
once(slider,"opt0.textContent = \"New Slider\";","opt0.textContent = Locale.LS(\"New Slider\");");
once(slider,"opt.textContent = \"Share Slider: \" + adji.sliderText;","opt.textContent = Locale.LS(\"Share Slider: \") + adji.sliderText;");
once(slider,"logLabel.appendChild(document.createTextNode(\"Logarithmic\"));","logLabel.appendChild(document.createTextNode(Locale.LS(\"Logarithmic\")));");
once(slider,"el.textContent = text;","el.textContent = Locale.LS(text);");
// Las dos advertencias del importador Dropbox estaban fijadas en inglés.
// Usar las mismas claves de los 15 catálogos oficiales y de las lenguas añadidas.
const dropbox=join(dir,"ImportFromDropboxDialog.ts");
once(dropbox,"label.textContent = \"This site, or your browser doesn't support the Dropbox chooser so you can't pick a file from your dropbox account.\";","label.textContent = Locale.LS(\"This site, or your browser doesn't support the Dropbox chooser so you can't pick a file from your dropbox account.\");");
once(dropbox,"la.textContent = \"You can open a shared Dropbox file if you have a link. Paste the Dropbox link below...\";","la.textContent = Locale.LS(\"You can open a shared Dropbox file if you have a link. Paste the Dropbox link below...\");");
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
// Las etiquetas de Dibujo no deben incluir un verbo de inserción. El comando
// técnico («Add Resistor» y su identificador de clase) permanece intacto.
const menus=join(dir,"Menus.ts");
once(menus,
 'import { Locale } from "./Locale";',
 'import { Locale } from "./Locale";\nimport { circuitJsDrawLabel } from "./CircuitJsDrawLabels";');
once(menus,
 '            menu.addCheckboxItem(this.getClassCheckItem(Locale.LS(items[i]), items[i + 1]));',
 '            menu.addCheckboxItem(this.getClassCheckItem(\n'+
 '                circuitJsDrawLabel(items[i], Locale.LS(items[i]), Locale.activeLanguage), items[i + 1]));');
// Botón lateral Run / Stop: traducir ambos estados, sin tocar el indicador
// de velocidad de simulación, que ya utiliza Locale.LS.
const uiManager=join(dir,"UIManager.ts");
const runningHtml="        this.runStopButton.innerHTML = '<strong>RUN</strong>&nbsp;/&nbsp;Stop';";
const runningLocalized='        this.runStopButton.innerHTML = \'<strong>\' + Locale.LS("Run") + \'</strong>&nbsp;/&nbsp;\' + Locale.LS("Stop");';
const uiSource=readFileSync(uiManager,"utf8");
if(uiSource.split(runningHtml).length!==3)
 throw Error("Han cambiado las etiquetas RUN/Stop en UIManager.ts");
writeFileSync(uiManager,uiSource.split(runningHtml).join(runningLocalized));
once(uiManager,
 "            this.runStopButton.innerHTML = 'Run&nbsp;/&nbsp;<strong>STOP</strong>';",
 "            this.runStopButton.innerHTML = Locale.LS(\"Run\") + '&nbsp;/&nbsp;<strong>' + Locale.LS(\"Stop\") + '</strong>';");
// Textos de la pantalla inicial y leyendas de los osciloscopios.
const scopeOverlays=join(dir,"ScopeOverlays.ts");
for(const [oldText,newText] of [
 ['("Plot " + (i + 1))','(Locale.LS("Plot ") + (i + 1))'],
 ['"Max=" + plot.getUnitText(this.scope.maxValue)','Locale.LS("Max=") + plot.getUnitText(this.scope.maxValue)'],
 ['"Min=" + plot.getUnitText(this.scope.minValue)','Locale.LS("Min=") + plot.getUnitText(this.scope.minValue)'],
 ['"P-P=" + plot.getUnitText(this.scope.maxValue - this.scope.minValue)','Locale.LS("P-P=") + plot.getUnitText(this.scope.maxValue - this.scope.minValue)']
])once(scopeOverlays,oldText,newText);
// Unidades por división: el texto "/div" aparecía fijado en inglés
// sobre las escalas, incluso cuando el idioma de la interfaz era ruso.
for(const [before,after] of [
 ['+ "/div";','+ Locale.LS("/div");'],
 ['+ "/div");','+ Locale.LS("/div"));']
]){
 const source=readFileSync(scopeOverlays,"utf8");
 const count=source.split(before).length-1;
 if(count<1)throw Error("Se ha modificado la leyenda de escalas: "+before);
 writeFileSync(scopeOverlays,source.split(before).join(after));
}
const scopeProperties=join(dir,"ScopePropertiesDialog.ts");
once(scopeProperties,"('Plot ' + (i + 1))","(Locale.LS('Plot ') + (i + 1))");
const channelPrefix="'CH ' + (this.plotSelection + 1)";
const channelSource=readFileSync(scopeProperties,"utf8");
if(channelSource.split(channelPrefix).length!==3)
 throw Error("La identificación de los dos canales ha cambiado");
writeFileSync(scopeProperties,channelSource.split(channelPrefix).join("Locale.LS('CH ') + (this.plotSelection + 1)"));
const scopePropertiesContent=readFileSync(scopeProperties,"utf8");
if(scopePropertiesContent.includes("'CH ' + (this.plotSelection + 1)"))
 throw Error("Queda un canal sin traducir en las propiedades del osciloscopio");
const uiPanel=join(dir,"UIManager.ts");
once(uiPanel,'this.titleLabel.textContent = "Label";','this.titleLabel.textContent = Locale.LS("Label");');
// Los indicadores del modo desarrollador también forman parte de la interfaz.
for(const key of ["Framerate: ","Steprate: ","Steprate/iter: ","iterc: ","Frames: "])
 once(uiPanel,'"'+key+'" +','Locale.LS("'+key+'") +');
once(uiPanel,'"Mouse: (" +','Locale.LS("Mouse: ") + "(" +');
once(uiPanel,'g.drawString("exception, see console!",','g.drawString(Locale.LS("exception, see console!"),');

// El cuadro Acerca de se carga en un iframe independiente: pasar el idioma
// efectivo y traducir su texto sin perder créditos ni los originales legales.
const aboutBox=join(dir,"AboutBox.ts");
once(aboutBox,
 'import { moduleBaseURL } from "./ModuleBase";',
 'import { moduleBaseURL } from "./ModuleBase";\nimport { Locale } from "./Locale";');
once(aboutBox,
 '        iframe.src = import.meta.env.DEV ? "circuitjs/about.html" : moduleBaseURL + "about.html";',
 '        const aboutURL = import.meta.env.DEV ? "circuitjs/about.html" : moduleBaseURL + "about.html";\n'+
 '        iframe.src = aboutURL + "?lang=" + encodeURIComponent(Locale.activeLanguage);');
once(aboutBox,
 '        okButton.textContent = "OK";',
 '        okButton.textContent = Locale.LS("OK");');
const about=join(dir,"circuitjs","about.html");
const aboutSource=readFileSync(join(repoRoot,"scripts/circuitjs-about-i18n.js"),"utf8");
const aboutLegal=readFileSync(join(repoRoot,"scripts/circuitjs-about-legal.js"),"utf8");
once(about,"</script>",aboutSource+"\n"+aboutLegal+"\n</script>");
console.log("Traducciones activadas: menús, nombres de componentes y Acerca de en 22 idiomas");

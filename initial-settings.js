(()=>{
"use strict";
const catalogs={
 en:["Initial setup","Confirm your language and number format.","Language","Regional format","European","Anglo-Saxon","Custom","Display decimal places","Decimal separator","Thousands separator","Preview","Confirm and open laboratory","None","Settings"],
 es:["Configuración inicial","Confirma el idioma y el formato numérico.","Idioma","Formato regional","Europeo","Anglosajón","Personalizado","Decimales de visualización","Separador decimal","Separador de miles","Vista previa","Aceptar y abrir laboratorio","Ninguno","Configuración"],
 fr:["Configuration initiale","Confirmez la langue et le format numérique.","Langue","Format régional","Européen","Anglo-saxon","Personnalisé","Décimales affichés","Séparateur décimal","Séparateur de milliers","Aperçu","Valider et ouvrir le laboratoire","Aucun","Paramètres"],
 de:["Ersteinrichtung","Bestätigen Sie Sprache und Zahlenformat.","Sprache","Zahlenformat","Europäisch","Angelsächsisch","Benutzerdefiniert","Angezeigte Dezimalstellen","Dezimaltrennzeichen","Tausendertrennzeichen","Vorschau","Bestätigen und Labor öffnen","Keines","Einstellungen"],
 it:["Configurazione iniziale","Conferma la lingua e il formato numerico.","Lingua","Formato regionale","Europeo","Anglosassone","Personalizzato","Decimali visualizzati","Separatore decimale","Separatore delle migliaia","Anteprima","Conferma e apri il laboratorio","Nessuno","Impostazioni"],
 pt:["Configuração inicial","Confirme o idioma e o formato numérico.","Idioma","Formato regional","Europeu","Anglo-saxónico","Personalizado","Casas decimais apresentadas","Separador decimal","Separador de milhares","Pré-visualização","Confirmar e abrir laboratório","Nenhum","Definições"],
 nl:["Eerste instellingen","Bevestig taal en getalnotatie.","Taal","Regionale notatie","Europees","Engels","Aangepast","Weergegeven decimalen","Decimaalteken","Duizendtalscheiding","Voorbeeld","Bevestigen en laboratorium openen","Geen","Instellingen"],
 pl:["Konfiguracja początkowa","Potwierdź język i format liczb.","Język","Format regionalny","Europejski","Anglosaski","Niestandardowy","Wyświetlane miejsca dziesiętne","Separator dziesiętny","Separator tysięcy","Podgląd","Zatwierdź i otwórz laboratorium","Brak","Ustawienia"]
};
const settingsHelp={en:"You can change these options later using Settings, at the bottom right of the laboratory.",es:"Puedes modificar estas opciones más adelante desde «Configuración», en la esquina inferior derecha.",fr:"Vous pourrez modifier ces options dans « Paramètres », en bas à droite du laboratoire.",de:"Sie können diese Optionen später über „Einstellungen“ unten rechts im Labor ändern.",it:"Puoi modificare queste opzioni in seguito da «Impostazioni», in basso a destra nel laboratorio.",pt:"Pode alterar estas opções mais tarde em «Definições», no canto inferior direito do laboratório.",nl:"Je kunt deze opties later wijzigen via «Instellingen», rechtsonder in het laboratorium.",pl:"Te opcje można później zmienić w «Ustawieniach» w prawym dolnym rogu laboratorium."};
const precisionNotes={"en":"CircuitJS calculates using 64-bit double-precision floating-point numbers (approximately 15–17 significant decimal digits). This option changes only how results are displayed. The final displayed decimal digit is rounded, not truncated.","es":"CircuitJS calcula con números de coma flotante de doble precisión (64 bits), aproximadamente 15–17 cifras decimales significativas. Esta opción solo modifica la visualización. El último decimal mostrado se redondea, no se trunca.","fr":"CircuitJS calcule en virgule flottante double précision (64 bits), soit environ 15 à 17 chiffres significatifs. Ce réglage modifie uniquement l'affichage. La dernière décimale affichée est arrondie, et non tronquée.","de":"CircuitJS rechnet mit 64-Bit-Gleitkommazahlen doppelter Genauigkeit (etwa 15–17 signifikante Dezimalziffern). Diese Einstellung betrifft nur die Anzeige. Die letzte angezeigte Dezimalstelle wird gerundet, nicht abgeschnitten.","it":"CircuitJS calcola con numeri in virgola mobile a doppia precisione (64 bit), circa 15–17 cifre significative. Questa impostazione modifica solo la visualizzazione. L'ultima cifra decimale visualizzata viene arrotondata, non troncata.","pt":"O CircuitJS calcula com números de vírgula flutuante de dupla precisão (64 bits), aproximadamente 15–17 algarismos significativos. Esta opção altera apenas a apresentação. A última casa decimal apresentada é arredondada, não truncada.","nl":"CircuitJS rekent met 64-bits drijvendekommagetallen met dubbele precisie (ongeveer 15–17 significante cijfers). Deze instelling verandert alleen de weergave. De laatste weergegeven decimaal wordt afgerond, niet afgekapt.","pl":"CircuitJS oblicza wartości za pomocą 64-bitowych liczb zmiennoprzecinkowych podwójnej precyzji (około 15–17 cyfr znaczących). To ustawienie zmienia tylko wyświetlanie. Ostatnia wyświetlana cyfra po przecinku jest zaokrąglana, a nie obcinana."};
const unitLabels={
 en:["Displayed unit prefix","Automatic","Micro (µ)","Milli (m)","Base unit","Kilo (k)"],
 es:["Prefijo de unidad mostrado","Automático","Micro (µ)","Mili (m)","Unidad base","Kilo (k)"],
 fr:["Préfixe d’unité affiché","Automatique","Micro (µ)","Milli (m)","Unité de base","Kilo (k)"],
 de:["Angezeigtes Einheitenpräfix","Automatisch","Mikro (µ)","Milli (m)","Basiseinheit","Kilo (k)"],
 it:["Prefisso unità visualizzato","Automatico","Micro (µ)","Milli (m)","Unità base","Chilo (k)"],
 pt:["Prefixo de unidade apresentado","Automático","Micro (µ)","Mili (m)","Unidade base","Quilo (k)"],
 nl:["Weergegeven eenheidsvoorvoegsel","Automatisch","Micro (µ)","Milli (m)","Basiseenheid","Kilo (k)"],
 pl:["Wyświetlany przedrostek jednostki","Automatyczny","Mikro (µ)","Mili (m)","Jednostka podstawowa","Kilo (k)"]
};
const names={en:"English",es:"Español",fr:"Français",de:"Deutsch",it:"Italiano",pt:"Português",nl:"Nederlands",pl:"Polski"};
const detect=()=>((navigator.languages&&navigator.languages[0])||navigator.language||"en").toLowerCase().split("-")[0];
const get=(k)=>{try{return localStorage.getItem(k)}catch{return null}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const detected=detect();
let language=(get("language")||detected).toLowerCase().split("-")[0];
const unknownDetected=!catalogs[detected];
if(!catalogs[language])language="es";
let dialogLanguage=unknownDetected&&!get("language")?"en":language;
let format=get("labRegionalFormat")||((detected==="en")?"uk":"eu");
let unitScale=get("labDisplayUnitScale")||"auto";
let digits=Math.max(0,Math.min(12,Number(get("labDecimalDigits")??4)||0));
let decimal=get("labDecimalSeparator")||",";
let grouping=get("labGroupingSeparator")??".";
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function render(){
 const t=catalogs[dialogLanguage]||catalogs.en;
 const ds=format==="uk"?".":format==="eu"?",":decimal;
 const gs=format==="uk"?",":format==="eu"?".":grouping;
 const sample=1234.5678901234;
 const parts=Number(sample.toFixed(digits)).toString().split(".");
 const preview=parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,gs)+(parts[1]?ds+parts[1]:"");
 const original=String(sample).split(".");
 const rawPreview=original[0].replace(/\B(?=(\d{3})+(?!\d))/g,gs)+ds+original[1];
 document.getElementById("lab-start-modal").innerHTML='<div class="lab-start-card" role="dialog" aria-modal="true" aria-labelledby="lab-start-title"><h2 id="lab-start-title">'+esc(t[0])+'</h2><p>'+esc(t[1])+'</p><label>'+esc(t[2])+'<select id="lab-start-language">'+Object.entries(names).map(([code,name])=>'<option value="'+code+'" '+(language===code?"selected":"")+'>'+esc(name)+'</option>').join("")+'</select></label><fieldset><legend>'+esc(t[3])+'</legend>'+["eu","uk","custom"].map((v,i)=>'<label class="lab-start-choice"><input type="radio" name="lab-start-format" value="'+v+'" '+(format===v?"checked":"")+'>'+esc(t[i+4])+'</label>').join("")+'</fieldset>'+(format==="custom"?'<div class="lab-start-pair"><label>'+esc(t[8])+'<select id="lab-start-decimal"><option value="," '+(decimal===","?"selected":"")+'>,</option><option value="." '+(decimal==="."?"selected":"")+'>.</option></select></label><label>'+esc(t[9])+'<select id="lab-start-group"><option value="." '+(grouping==="."?"selected":"")+'>.</option><option value="," '+(grouping===","?"selected":"")+'>,</option><option value="" '+(grouping===""?"selected":"")+'>'+esc(t[12])+'</option></select></label></div>':"")+'<div class="lab-start-digits"><span class="lab-start-digits-label">'+esc(t[7])+'</span><div class="lab-start-stepper"><button type="button" id="lab-start-minus" aria-label="Decrease decimals" '+(digits===0?'disabled':'')+'>−</button><output id="lab-start-digits" aria-live="polite">'+digits+'</output><button type="button" id="lab-start-plus" aria-label="Increase decimals" '+(digits===12?'disabled':'')+'>+</button></div><small>0–12</small></div><label>'+esc((unitLabels[dialogLanguage]||unitLabels.en)[0])+'<select id="lab-start-unit-scale">'+["auto","micro","milli","base","kilo"].map((v,i)=>'<option value="'+v+'" '+(unitScale===v?"selected":"")+'>'+esc((unitLabels[dialogLanguage]||unitLabels.en)[i+1])+'</option>').join("")+'</select></label><p class="lab-start-precision">'+esc(precisionNotes[dialogLanguage]||precisionNotes.en)+'</p><div class="lab-start-preview"><small>'+esc(t[10])+'</small><strong>'+esc(preview)+'</strong></div><p class="lab-start-settings-help">'+esc(settingsHelp[dialogLanguage]||settingsHelp.es)+'</p><button type="button" id="lab-start-accept">'+esc(t[11])+'</button></div>';
 document.getElementById("lab-start-language").onchange=e=>{language=e.target.value;dialogLanguage=language;format=language==="en"?"uk":"eu";render()};
 document.querySelectorAll('input[name="lab-start-format"]').forEach(el=>el.onchange=e=>{format=e.target.value;render()});
 document.getElementById("lab-start-unit-scale").onchange=e=>{unitScale=e.target.value};
 document.getElementById("lab-start-minus").onclick=()=>{digits=Math.max(0,digits-1);render()};
 document.getElementById("lab-start-plus").onclick=()=>{digits=Math.min(12,digits+1);render()};
 if(format==="custom"){
 document.getElementById("lab-start-decimal").onchange=e=>{decimal=e.target.value;if(decimal===grouping)grouping="";render()};
 document.getElementById("lab-start-group").onchange=e=>{grouping=e.target.value;if(grouping===decimal)decimal=grouping==="."?",":".";render()};
 }
 document.getElementById("lab-start-accept").onclick=()=>{
 set("language",language);set("labRegionalFormat",format);set("labDecimalSeparator",ds);set("labGroupingSeparator",gs);set("labDecimalDigits",String(digits));set("labDisplayUnitScale",unitScale);set("labStartConfigured","1");location.reload();
 };
}
function show(){const modal=document.getElementById("lab-start-modal");modal.hidden=false;document.body.classList.add("lab-start-open");render()}
function init(){
 const style=document.createElement("style");
 style.textContent='.lab-start-settings-help{font-size:13px;line-height:1.5;color:#35435a;margin:8px 0 14px}.lab-start-precision{font-size:12px;line-height:1.45;color:#505d70;margin:6px 0 12px}.lab-start-open{overflow:hidden}.lab-start-modal[hidden]{display:none}.lab-start-modal{position:fixed;inset:0;z-index:2147483647;background:rgba(0,0,0,.7);display:grid;place-items:center;padding:16px;overflow:auto}.lab-start-card{background:#fff;color:#202936;border-radius:14px;padding:24px;width:min(100%,440px);max-height:calc(100vh - 32px);overflow:auto;box-shadow:0 20px 70px #0007;font:15px system-ui,sans-serif}.lab-start-card h2{font-size:22px;margin:0 0 8px}.lab-start-card p{margin:0 0 16px}.lab-start-card label{display:block;margin:12px 0;font-weight:600}.lab-start-card select,.lab-start-card input[type=number]{display:block;width:100%;padding:9px;margin-top:6px;font:inherit;box-sizing:border-box}.lab-start-card fieldset{border:0;padding:0;margin:14px 0}.lab-start-card legend{font-weight:600}.lab-start-card .lab-start-choice{display:flex;align-items:center;gap:8px;font-weight:400;margin:9px 0}.lab-start-pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}.lab-start-preview{background:#eef1f5;padding:12px;border-radius:8px;margin:14px 0}.lab-start-preview small{display:block}.lab-start-preview strong{display:block;font-size:24px;font-variant-numeric:tabular-nums;margin-top:5px}.lab-start-digits{margin:14px 0}.lab-start-digits-label{display:block;font-weight:600;margin-bottom:9px}.lab-start-stepper{display:flex;align-items:center;justify-content:center;gap:14px}.lab-start-card .lab-start-stepper button{width:52px;height:48px;padding:0;font-size:28px;border-radius:9px;background:#fff;color:#202936;border:1px solid #8c98a9}.lab-start-card .lab-start-stepper button:disabled{opacity:.35;cursor:default}.lab-start-stepper output{display:grid;place-items:center;min-width:76px;height:48px;border:1px solid #8c98a9;border-radius:9px;font-size:28px;font-weight:700;font-variant-numeric:tabular-nums}.lab-start-digits>small{display:block;text-align:center;margin-top:7px;color:#505d70}.lab-start-original{display:block;margin-top:7px;color:#505d70;font-variant-numeric:tabular-nums}.lab-start-arrow{display:block;color:#505d70}.lab-start-card button{width:100%;padding:12px;border:0;border-radius:8px;background:#175fba;color:white;font:inherit;cursor:pointer}.lab-start-settings{position:fixed;bottom:12px;right:12px;z-index:1000;padding:8px 12px;border:1px solid #888;border-radius:8px;background:#fff;color:#222;cursor:pointer}';
 document.head.appendChild(style);
 const modal=document.createElement("div");modal.id="lab-start-modal";modal.className="lab-start-modal";modal.hidden=true;document.body.appendChild(modal);
 const settings=document.createElement("button");settings.className="lab-start-settings";settings.type="button";settings.textContent=(catalogs[language]||catalogs.en)[13];settings.onclick=show;document.body.appendChild(settings);
 if(get("labStartConfigured")!=="1")show();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
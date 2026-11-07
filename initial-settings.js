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
// Idiomas originales de CircuitJS que no estaban incluidos en el asistente inicial.
// El catálogo de componentes se encuentra en LabTranslations.ts.
Object.assign(catalogs,{
 csx:["Úvodní nastavení","Potvrďte jazyk a formát čísel.","Jazyk","Místní formát","Evropský","Anglosaský","Vlastní","Počet desetinných míst","Desetinný oddělovač","Oddělovač tisíců","Náhled","Potvrdit a otevřít laboratoř","Žádný","Nastavení"],
 da:["Første opsætning","Bekræft sprog og talformat.","Sprog","Regionalt format","Europæisk","Angelsaksisk","Brugerdefineret","Antal decimaler","Decimaltegn","Tusindtalsseparator","Forhåndsvisning","Bekræft og åbn laboratoriet","Ingen","Indstillinger"],
 fi:["Alkuasetukset","Vahvista kieli ja lukumuoto.","Kieli","Alueellinen muoto","Eurooppalainen","Anglosaksinen","Mukautettu","Desimaalien määrä","Desimaalierotin","Tuhaterotin","Esikatselu","Vahvista ja avaa laboratorio","Ei mitään","Asetukset"],
 nb:["Førstegangsoppsett","Bekreft språk og tallformat.","Språk","Regionalt format","Europeisk","Angelsaksisk","Egendefinert","Antall desimaler","Desimalskilletegn","Tusenskilletegn","Forhåndsvisning","Bekreft og åpne laboratoriet","Ingen","Innstillinger"],
 ru:["Начальная настройка","Подтвердите язык и формат чисел.","Язык","Региональный формат","Европейский","Англосаксонский","Пользовательский","Количество знаков после запятой","Десятичный разделитель","Разделитель тысяч","Предпросмотр","Подтвердить и открыть лабораторию","Нет","Настройки"],
 zh:["初始设置","请选择语言和数字格式。","语言","地区格式","欧洲格式","英美格式","自定义","小数位数","小数分隔符","千位分隔符","预览","确认并打开实验室","无","设置"],
 "zh-tw":["初始設定","請確認語言和數字格式。","語言","地區格式","歐洲格式","英美格式","自訂","小數位數","小數分隔符號","千位分隔符號","預覽","確認並開啟實驗室","無","設定"],
 ja:["初期設定","言語と数値形式を確認してください。","言語","地域形式","欧州式","英米式","カスタム","小数点以下の桁数","小数点記号","桁区切り記号","プレビュー","確定して実験室を開く","なし","設定"],
 kr:["초기 설정","언어와 숫자 형식을 확인하세요.","언어","지역 형식","유럽식","영미식","사용자 지정","소수 자릿수","소수 구분 기호","천 단위 구분 기호","미리 보기","확인하고 실험실 열기","없음","설정"]
});
Object.assign(catalogs,{
 ca:["Configuració inicial","Confirma l'idioma i el format numèric.","Idioma","Format regional","Europeu","Anglosaxó","Personalitzat","Decimals de visualització","Separador decimal","Separador de milers","Vista prèvia","Confirma i obre el laboratori","Cap","Configuració"],
 "ca-es-valencia":["Configuració inicial","Confirma l'idioma i el format numèric.","Idioma","Format regional","Europeu","Anglosaxó","Personalitzat","Decimals de visualització","Separador decimal","Separador de milers","Vista prèvia","Accepta i obri el laboratori","Cap","Configuració"],
 gl:["Configuración inicial","Confirma o idioma e o formato numérico.","Idioma","Formato rexional","Europeo","Anglosaxón","Personalizado","Decimais de visualización","Separador decimal","Separador de milleiros","Vista previa","Confirmar e abrir o laboratorio","Ningún","Configuración"],
 eu:["Hasierako konfigurazioa","Berretsi hizkuntza eta zenbaki-formatua.","Hizkuntza","Eskualdeko formatua","Europakoa","Anglosaxoia","Pertsonalizatua","Bistaratuko diren hamartarrak","Hamartar-bereizlea","Milakoen bereizlea","Aurrebista","Berretsi eta ireki laborategia","Bat ere ez","Ezarpenak"]
});
const settingsHelp={en:"You can change these options later using Settings, at the bottom right of the laboratory.",es:"Puedes modificar estas opciones más adelante pulsando el botón «Configuración», situado en la esquina inferior derecha de la pantalla.",fr:"Vous pourrez modifier ces options dans « Paramètres », en bas à droite du laboratoire.",de:"Sie können diese Optionen später über „Einstellungen“ unten rechts im Labor ändern.",it:"Puoi modificare queste opzioni in seguito da «Impostazioni», in basso a destra nel laboratorio.",pt:"Pode alterar estas opções mais tarde em «Definições», no canto inferior direito do laboratório.",nl:"Je kunt deze opties later wijzigen via «Instellingen», rechtsonder in het laboratorium.",pl:"Te opcje można później zmienić w «Ustawieniach» w prawym dolnym rogu laboratorium."};
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
// Textos explicativos y opciones regionales de los nueve idiomas adicionales.
Object.assign(settingsHelp,{
 ca:"Més endavant pots canviar aquestes opcions a Configuració, a la part inferior dreta del laboratori.",
 "ca-es-valencia":"Més avant pots canviar estes opcions en Configuració, en la part inferior dreta del laboratori.",
 gl:"Podes modificar estas opcións máis adiante en Configuración, na parte inferior dereita do laboratorio.",
 eu:"Ezarpen horiek geroago alda ditzakezu laborategiaren beheko eskuineko Ezarpenak atalean.",
 csx:"Tato nastavení můžete později změnit v nabídce Nastavení v pravém dolním rohu laboratoře.",
 da:"Du kan ændre disse indstillinger senere under Indstillinger nederst til højre i laboratoriet.",
 fi:"Voit muuttaa näitä asetuksia myöhemmin laboratorion oikean alakulman Asetukset-valikosta.",
 nb:"Du kan endre disse innstillingene senere via Innstillinger nederst til høyre i laboratoriet.",
 ru:"Позже эти параметры можно изменить в разделе «Настройки» в правом нижнем углу лаборатории.",
 zh:"稍后可以通过实验室右下角的“设置”更改这些选项。",
 "zh-tw":"稍後可以透過實驗室右下角的「設定」變更這些選項。",
 ja:"これらの設定は、実験室の右下にある「設定」から後で変更できます。",
 kr:"이 설정은 나중에 실험실 오른쪽 아래의 설정 메뉴에서 변경할 수 있습니다."
});
Object.assign(precisionNotes,{
 ca:"CircuitJS calcula amb nombres de coma flotant de doble precisió (64 bits), aproximadament 15–17 xifres significatives. Aquesta opció només canvia la visualització. L'últim decimal es mostra arrodonit.",
 "ca-es-valencia":"CircuitJS calcula amb nombres de coma flotant de doble precisió (64 bits), aproximadament 15–17 xifres significatives. Esta opció només canvia la visualització. L'últim decimal es mostra arredonit.",
 gl:"CircuitJS calcula con números de coma flotante de dobre precisión (64 bits), aproximadamente 15–17 cifras significativas. Esta opción só modifica a visualización. O último decimal arredóndase.",
 eu:"CircuitJS-k 64 biteko doitasun bikoitzeko koma mugikorreko zenbakiak erabiltzen ditu (15–17 zifra esanguratsu inguru). Aukera honek bistaratzea soilik aldatzen du. Azken hamartarra biribildu egiten da.",
 csx:"CircuitJS používá 64bitové výpočty s dvojitou přesností (přibližně 15–17 platných číslic). Toto nastavení mění jen zobrazení; poslední číslice se zaokrouhluje.",
 da:"CircuitJS beregner med 64-bit flydende kommatal med dobbelt præcision (ca. 15–17 betydende cifre). Indstillingen ændrer kun visningen; sidste ciffer afrundes.",
 fi:"CircuitJS laskee 64-bittisillä kaksinkertaisen tarkkuuden liukuluvuilla (noin 15–17 merkitsevää numeroa). Asetus vaikuttaa vain näyttöön; viimeinen numero pyöristetään.",
 nb:"CircuitJS regner med 64-bits flyttall med dobbel presisjon (omtrent 15–17 signifikante sifre). Innstillingen endrer bare visningen; siste siffer avrundes.",
 ru:"CircuitJS использует 64-битные числа двойной точности (примерно 15–17 значащих цифр). Параметр изменяет только отображение; последняя цифра округляется.",
 zh:"CircuitJS 使用 64 位双精度浮点数计算（约 15–17 位有效数字）。此设置仅改变显示方式；末位数字会四舍五入。",
 "zh-tw":"CircuitJS 使用 64 位元雙精度浮點數運算（約 15–17 位有效數字）。此設定僅改變顯示方式；最後一位會四捨五入。",
 ja:"CircuitJS は64ビット倍精度浮動小数点数（約15～17桁の有効数字）で計算します。この設定は表示のみを変更し、末尾の桁は四捨五入されます。",
 kr:"CircuitJS는 64비트 배정밀도 부동소수점(약 15~17자리 유효숫자)으로 계산합니다. 이 설정은 표시만 바꾸며 마지막 자리는 반올림됩니다."
});
Object.assign(unitLabels,{
 ca:["Prefix d'unitat mostrat","Automàtic","Micro (µ)","Mil·li (m)","Unitat bàsica","Quilo (k)"],
 "ca-es-valencia":["Prefix d'unitat mostrat","Automàtic","Micro (µ)","Mil·li (m)","Unitat bàsica","Quilo (k)"],
 gl:["Prefixo de unidade mostrado","Automático","Micro (µ)","Mili (m)","Unidade base","Quilo (k)"],
 eu:["Bistaratutako unitate-aurrizkia","Automatikoa","Mikro (µ)","Mili (m)","Oinarrizko unitatea","Kilo (k)"],
 csx:["Zobrazená předpona jednotky","Automaticky","Mikro (µ)","Mili (m)","Základní jednotka","Kilo (k)"],
 da:["Vist enhedspræfiks","Automatisk","Mikro (µ)","Milli (m)","Grundenhed","Kilo (k)"],
 fi:["Näytettävä yksikön etuliite","Automaattinen","Mikro (µ)","Milli (m)","Perusyksikkö","Kilo (k)"],
 nb:["Vist enhetsprefiks","Automatisk","Mikro (µ)","Milli (m)","Grunnenhet","Kilo (k)"],
 ru:["Отображаемая приставка единицы","Автоматически","Микро (µ)","Милли (m)","Основная единица","Кило (k)"],
 zh:["显示的单位前缀","自动","微 (µ)","毫 (m)","基本单位","千 (k)"],
 "zh-tw":["顯示的單位前綴","自動","微 (µ)","毫 (m)","基本單位","千 (k)"],
 ja:["表示する単位接頭辞","自動","マイクロ (µ)","ミリ (m)","基本単位","キロ (k)"],
 kr:["표시할 단위 접두어","자동","마이크로 (µ)","밀리 (m)","기본 단위","킬로 (k)"]
});
const names={ca:"Català","ca-es-valencia":"Valencià",gl:"Galego",eu:"Euskara",nl:"Nederlands",csx:"Čeština",da:"Dansk",de:"Deutsch",en:"English",
 es:"Español",fi:"Suomi",fr:"Français",it:"Italiano",
 nb:"Norsk bokmål",pl:"Polski",pt:"Português",ru:"Русский",
 zh:"中文（中国大陆）","zh-tw":"中文（台灣）",ja:"日本語",kr:"한국어"};
// Respeta el orden de preferencias del navegador, incluidos es-ES y es-419.
const normalizeLanguage=value=>{
 const code=String(value||"").toLowerCase().replace(/_/g,"-");
 if(code.startsWith("ca-es-valencia")||code==="ca-valencia")return "ca-es-valencia";
 if(code.startsWith("zh-tw")||code.startsWith("zh-hk")||
    code.startsWith("zh-mo")||code.startsWith("zh-hant"))return "zh-tw";
 const base=code.split("-")[0];
 if(base==="cs")return "csx";
 if(base==="ko")return "kr";
 if(base==="no"||base==="nn")return "nb";
 return base;
};
const detect=()=>{
 const prefs=[...(navigator.languages||[]),navigator.language,
  Intl.DateTimeFormat().resolvedOptions().locale].filter(Boolean);
 // Usar el primer idioma admitido del orden de preferencias del navegador.
 // Si no hay ninguno, ofrecer inglés como idioma técnico de respaldo:
 // el navegador no expone la interfaz instalada de Windows.
 return prefs.map(normalizeLanguage).find(code=>Object.hasOwn(catalogs,code))||"en";
};
const get=(k)=>{try{return localStorage.getItem(k)}catch{return null}};
const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
const detected=detect();
// Preferencia manual anterior: se conserva. En instalaciones nuevas,
// el modo inicial es automático y se actualiza al cambiar el navegador.
let languageMode=get("labLanguageMode")||
 (get("language")?"manual":"auto");
let language=languageMode==="auto"?detected:
 normalizeLanguage(get("language")||detected);
if(!catalogs[language])language=detected;
let dialogLanguage=language;
if(languageMode==="auto")set("language",detected);
const autoNames={
 ca:"Automàtic (navegador)","ca-es-valencia":"Automàtic (navegador)",
 gl:"Automático (navegador)",eu:"Automatikoa (arakatzailea)",
 en:"Automatic (browser)",es:"Automático (navegador)",
 fr:"Automatique (navigateur)",de:"Automatisch (Browser)",
 it:"Automatico (browser)",pt:"Automático (navegador)",
 nl:"Automatisch (browser)",pl:"Automatycznie (przeglądarka)",
 csx:"Automaticky (prohlížeč)",da:"Automatisk (browser)",
 fi:"Automaattinen (selain)",nb:"Automatisk (nettleser)",
 ru:"Автоматически (браузер)",zh:"自动（浏览器）",
 "zh-tw":"自動（瀏覽器）",ja:"自動（ブラウザー）",kr:"자동 (브라우저)"
};
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
 document.getElementById("lab-start-modal").innerHTML='<div class="lab-start-card" role="dialog" aria-modal="true" aria-labelledby="lab-start-title"><h2 id="lab-start-title">'+esc(t[0])+'</h2><p>'+esc(t[1])+'</p><label>'+esc(t[2])+'<select id="lab-start-language"><option value="auto" '+(languageMode==="auto"?"selected":"")+'>'+esc(autoNames[dialogLanguage]||autoNames.en)+' ('+esc(names[detected])+')</option>'+Object.entries(names).map(([code,name])=>'<option value="'+code+'" '+(languageMode==="manual"&&language===code?"selected":"")+'>'+esc(name)+'</option>').join("")+'</select></label><fieldset><legend>'+esc(t[3])+'</legend>'+["eu","uk","custom"].map((v,i)=>'<label class="lab-start-choice"><input type="radio" name="lab-start-format" value="'+v+'" '+(format===v?"checked":"")+'>'+esc(t[i+4])+'</label>').join("")+'</fieldset>'+(format==="custom"?'<div class="lab-start-pair"><label>'+esc(t[8])+'<select id="lab-start-decimal"><option value="," '+(decimal===","?"selected":"")+'>,</option><option value="." '+(decimal==="."?"selected":"")+'>.</option></select></label><label>'+esc(t[9])+'<select id="lab-start-group"><option value="." '+(grouping==="."?"selected":"")+'>.</option><option value="," '+(grouping===","?"selected":"")+'>,</option><option value="" '+(grouping===""?"selected":"")+'>'+esc(t[12])+'</option></select></label></div>':"")+'<div class="lab-start-digits"><span class="lab-start-digits-label">'+esc(t[7])+'</span><div class="lab-start-stepper"><button type="button" id="lab-start-minus" aria-label="'+esc(({en:"Decrease decimals",es:"Disminuir decimales",fr:"Réduire les décimales",de:"Dezimalstellen verringern",it:"Riduci decimali",pt:"Diminuir casas decimais",nl:"Minder decimalen",pl:"Zmniejsz liczbę miejsc dziesiętnych",csx:"Snížit počet desetinných míst",da:"Færre decimaler",fi:"Vähennä desimaaleja",nb:"Færre desimaler",ru:"Уменьшить число знаков",zh:"减少小数位数","zh-tw":"減少小數位數",ja:"小数桁数を減らす",kr:"소수 자릿수 줄이기"})[dialogLanguage]||"Decrease decimals") +'" '+(digits===0?'disabled':'')+'>−</button><output id="lab-start-digits" aria-live="polite">'+digits+'</output><button type="button" id="lab-start-plus" aria-label="'+esc(({en:"Increase decimals",es:"Aumentar decimales",fr:"Augmenter les décimales",de:"Dezimalstellen erhöhen",it:"Aumenta decimali",pt:"Aumentar casas decimais",nl:"Meer decimalen",pl:"Zwiększ liczbę miejsc dziesiętnych",csx:"Zvýšit počet desetinných míst",da:"Flere decimaler",fi:"Lisää desimaaleja",nb:"Flere desimaler",ru:"Увеличить число знаков",zh:"增加小数位数","zh-tw":"增加小數位數",ja:"小数桁数を増やす",kr:"소수 자릿수 늘리기"})[dialogLanguage]||"Increase decimals") +'" '+(digits===12?'disabled':'')+'>+</button></div><small>0–12</small></div><label>'+esc((unitLabels[dialogLanguage]||unitLabels.en)[0])+'<select id="lab-start-unit-scale">'+["auto","micro","milli","base","kilo"].map((v,i)=>'<option value="'+v+'" '+(unitScale===v?"selected":"")+'>'+esc((unitLabels[dialogLanguage]||unitLabels.en)[i+1])+'</option>').join("")+'</select></label><p class="lab-start-precision">'+esc(precisionNotes[dialogLanguage]||precisionNotes.en)+'</p><div class="lab-start-preview"><small>'+esc(t[10])+'</small><strong>'+esc(preview)+'</strong></div><p class="lab-start-settings-help">'+esc(settingsHelp[dialogLanguage]||settingsHelp.es)+'</p><button type="button" id="lab-start-accept">'+esc(t[11])+'</button></div>';
 document.getElementById("lab-start-language").onchange=e=>{
 languageMode=e.target.value==="auto"?"auto":"manual";
 language=languageMode==="auto"?detect():e.target.value;
 dialogLanguage=language;format=language==="en"?"uk":"eu";render();
};
 document.querySelectorAll('input[name="lab-start-format"]').forEach(el=>el.onchange=e=>{format=e.target.value;render()});
 document.getElementById("lab-start-unit-scale").onchange=e=>{unitScale=e.target.value};
 document.getElementById("lab-start-minus").onclick=()=>{digits=Math.max(0,digits-1);render()};
 document.getElementById("lab-start-plus").onclick=()=>{digits=Math.min(12,digits+1);render()};
 if(format==="custom"){
 document.getElementById("lab-start-decimal").onchange=e=>{decimal=e.target.value;if(decimal===grouping)grouping="";render()};
 document.getElementById("lab-start-group").onchange=e=>{grouping=e.target.value;if(grouping===decimal)decimal=grouping==="."?",":".";render()};
 }
 document.getElementById("lab-start-accept").onclick=()=>{
 set("labLanguageMode",languageMode);set("language",language);
 set("labRegionalFormat",format);set("labDecimalSeparator",ds);set("labGroupingSeparator",gs);set("labDecimalDigits",String(digits));set("labDisplayUnitScale",unitScale);set("labStartConfigured","1");location.reload();
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
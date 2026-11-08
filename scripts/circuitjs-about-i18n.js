// Traducciones del cuadro «Acerca de» de CircuitJS.
// El contenido legal original se conserva en el archivo about.html del proyecto.
(() => {
  const requested = new URLSearchParams(location.search).get("lang") ||
    (navigator.languages && navigator.languages[0]) || navigator.language || "en";
  const lower = requested.toLowerCase().replace(/_/g, "-");
  const lang = lower.startsWith("ca-es-valencia") ? "ca-es-valencia" :
    lower.startsWith("zh-tw") || lower.startsWith("zh-hant") || lower.startsWith("zh-hk") ? "zh-tw" :
    lower.startsWith("cs") ? "csx" : lower.startsWith("ko") ? "kr" :
    lower.startsWith("no") || lower.startsWith("nn") ? "nb" : lower.split("-")[0];
  const strings = {
    es: ["Simulador de circuitos, versión ", "Original de Paul Falstad.", "Conversión a JavaScript de Iain Sharp.",
      "Repositorio de GitHub para comunicar incidencias y consultar el código fuente: ",
      "Agradecimientos a: ", "Este programa utiliza iconos libres. Para más información, consulta la ",
      "relación de autores y licencias de los iconos y las fuentes tipográficas",
      "Para consultar las condiciones de licencia, visita ", "Código fuente (Paul): ", "Código fuente (Iain): "],
    "ca-es-valencia": ["Simulador de circuits, versió ", "Original de Paul Falstad.", "Conversió a JavaScript d'Iain Sharp.",
      "Repositori de GitHub per a comunicar incidències i consultar el codi font: ",
      "Agraïments a: ", "Este programa utilitza icones lliures. Per a més informació, consulta la ",
      "relació d'autors i llicències de les icones i els tipus de lletra",
      "Per a consultar les condicions de la llicència, visita ", "Codi font (Paul): ", "Codi font (Iain): "],
    ca: ["Simulador de circuits, versió ", "Original de Paul Falstad.", "Conversió a JavaScript d'Iain Sharp.",
      "Repositori de GitHub per informar d'incidències i consultar el codi font: ",
      "Agraïments a: ", "Aquest programa utilitza icones lliures. Per a més informació, consulteu la ",
      "llista d'autors i llicències de les icones i les fonts tipogràfiques",
      "Per consultar la llicència, visiteu ", "Codi font (Paul): ", "Codi font (Iain): "],
    gl: ["Simulador de circuítos, versión ", "Orixinal de Paul Falstad.", "Conversión a JavaScript de Iain Sharp.",
      "Repositorio de GitHub para informar de incidencias e consultar o código fonte: ",
      "Agradecementos a: ", "Este programa utiliza iconas libres. Para máis información, consulta a ",
      "relación de autores e licenzas das iconas e das fontes tipográficas",
      "Para consultar a licenza, visita ", "Código fonte (Paul): ", "Código fonte (Iain): "],
    eu: ["Zirkuitu-simulagailua, bertsioa ", "Jatorrizko egilea: Paul Falstad.", "JavaScript-erako bihurketa: Iain Sharp.",
      "Arazoen berri emateko eta iturburu-kodea ikusteko GitHub biltegia: ",
      "Eskerrak hauei: ", "Programa honek ikono libreak erabiltzen ditu. Informazio gehiago lortzeko, ikusi ",
      "ikonoen eta letra-tipoen egile eta lizentzien zerrenda",
      "Lizentziari buruzko xehetasunak: ", "Iturburu-kodea (Paul): ", "Iturburu-kodea (Iain): "],
    fr: ["Simulateur de circuits, version ", "Création originale de Paul Falstad.", "Conversion JavaScript par Iain Sharp.",
      "Dépôt GitHub pour signaler des problèmes et consulter le code source : ",
      "Remerciements à : ", "Ce programme utilise des icônes libres. Consultez la ",
      "liste des auteurs et des licences des icônes et polices",
      "Pour les conditions de licence, consultez ", "Code source (Paul) : ", "Code source (Iain) : "],
    de: ["Schaltungssimulator, Version ", "Original von Paul Falstad.", "JavaScript-Umsetzung von Iain Sharp.",
      "GitHub-Repository für Fehlermeldungen und Quellcode: ",
      "Dank an: ", "Dieses Programm verwendet freie Symbole. Siehe ",
      "Liste der Urheber und Lizenzen der Symbole und Schriftarten",
      "Lizenzinformationen unter ", "Quellcode (Paul): ", "Quellcode (Iain): "],
    it: ["Simulatore di circuiti, versione ", "Originale di Paul Falstad.", "Conversione JavaScript di Iain Sharp.",
      "Repository GitHub per segnalare problemi e consultare il codice sorgente: ",
      "Ringraziamenti a: ", "Questo programma utilizza icone libere. Consulta l'",
      "elenco degli autori e delle licenze di icone e caratteri",
      "Per informazioni sulla licenza, visita ", "Codice sorgente (Paul): ", "Codice sorgente (Iain): "],
    pt: ["Simulador de circuitos, versão ", "Original de Paul Falstad.", "Conversão para JavaScript de Iain Sharp.",
      "Repositório GitHub para comunicar problemas e consultar o código-fonte: ",
      "Agradecimentos a: ", "Este programa usa ícones livres. Consulte a ",
      "lista de autores e licenças dos ícones e tipos de letra",
      "Para informação sobre a licença, consulte ", "Código-fonte (Paul): ", "Código-fonte (Iain): "],
    nl: ["Circuitsimulator, versie ", "Oorspronkelijk van Paul Falstad.", "JavaScript-conversie door Iain Sharp.",
      "GitHub-repository voor meldingen en broncode: ",
      "Met dank aan: ", "Dit programma gebruikt vrije pictogrammen. Zie de ",
      "lijst met auteurs en licenties van pictogrammen en lettertypen",
      "Licentiegegevens: ", "Broncode (Paul): ", "Broncode (Iain): "],
    sv: ["Kretssimulator, version ", "Original av Paul Falstad.", "JavaScript-konvertering av Iain Sharp.",
      "GitHub-arkiv för felrapporter och källkod: ",
      "Tack till: ", "Programmet använder fria ikoner. Se ",
      "förteckningen över upphovspersoner och licenser för ikoner och typsnitt",
      "Licensinformation finns på ", "Källkod (Paul): ", "Källkod (Iain): "],
    da: ["Kredsløbssimulator, version ", "Original af Paul Falstad.", "JavaScript-konvertering af Iain Sharp.",
      "GitHub-lager til fejlrapporter og kildekode: ", "Tak til: ",
      "Dette program bruger frie ikoner. Se ", "listen over ophavspersoner og licenser til ikoner og skrifttyper",
      "Licensoplysninger: ", "Kildekode (Paul): ", "Kildekode (Iain): "],
    nb: ["Kretssimulator, versjon ", "Opprinnelig av Paul Falstad.", "JavaScript-konvertering av Iain Sharp.",
      "GitHub-lager for feilrapporter og kildekode: ", "Takk til: ",
      "Dette programmet bruker frie ikoner. Se ", "listen over opphavspersoner og lisenser for ikoner og skrifttyper",
      "Lisensinformasjon: ", "Kildekode (Paul): ", "Kildekode (Iain): "],
    fi: ["Piirisimulaattori, versio ", "Alkuperäinen tekijä: Paul Falstad.", "JavaScript-muunnos: Iain Sharp.",
      "GitHub-lähdekoodi ja virheilmoitukset: ", "Kiitokset: ",
      "Ohjelma käyttää vapaita kuvakkeita. Katso ", "kuvakkeiden ja kirjasinten tekijä- ja lisenssiluettelo",
      "Lisenssitiedot: ", "Lähdekoodi (Paul): ", "Lähdekoodi (Iain): "],
    pl: ["Symulator obwodów, wersja ", "Autor oryginału: Paul Falstad.", "Wersja JavaScript: Iain Sharp.",
      "Repozytorium GitHub do zgłaszania błędów i przeglądania kodu: ", "Podziękowania dla: ",
      "Program używa wolnych ikon. Zobacz ", "listę autorów i licencji ikon i czcionek",
      "Informacje o licencji: ", "Kod źródłowy (Paul): ", "Kod źródłowy (Iain): "],
    csx: ["Simulátor obvodů, verze ", "Původní autor: Paul Falstad.", "Převod do JavaScriptu: Iain Sharp.",
      "GitHub pro hlášení chyb a zobrazení zdrojového kódu: ", "Poděkování: ",
      "Program používá svobodné ikony. Viz ", "seznam autorů a licencí ikon a písem",
      "Informace o licenci: ", "Zdrojový kód (Paul): ", "Zdrojový kód (Iain): "],
    ru: ["Симулятор электрических цепей, версия ", "Оригинал: Пол Фалстад (Paul Falstad).", "Версия JavaScript: Иэн Шарп (Iain Sharp).",
      "Репозиторий GitHub для сообщений об ошибках и исходного кода: ", "Благодарности: ",
      "Программа использует свободные значки. См. ", "список авторов и лицензий значков и шрифтов",
      "Условия лицензии: ", "Исходный код (Paul): ", "Исходный код (Iain): "],
    ja: ["回路シミュレーター バージョン ", "原作者: Paul Falstad。", "JavaScript版: Iain Sharp。",
      "問題報告・ソースコードのGitHubリポジトリ: ", "謝辞: ", "このプログラムは自由に使用できるアイコンを利用します。詳しくは ",
      "アイコンとフォントの作者・ライセンス一覧", "ライセンスの詳細: ", "ソースコード (Paul): ", "ソースコード (Iain): "],
    kr: ["회로 시뮬레이터 버전 ", "원작: Paul Falstad.", "JavaScript 변환: Iain Sharp.",
      "오류 보고 및 소스 코드 GitHub 저장소: ", "감사의 말: ", "이 프로그램은 자유 라이선스 아이콘을 사용합니다. 자세한 내용은 ",
      "아이콘과 글꼴의 저작자 및 라이선스 목록", "라이선스 정보: ", "소스 코드 (Paul): ", "소스 코드 (Iain): "],
    zh: ["电路仿真器，版本 ", "原作者：Paul Falstad。", "JavaScript 移植：Iain Sharp。",
      "报告问题和查看源代码的 GitHub 仓库：", "致谢：", "本程序使用自由许可图标。详情请参阅",
      "图标与字体的作者及许可证列表", "许可证详情：", "源代码（Paul）：", "源代码（Iain）："],
    "zh-tw": ["電路模擬器，版本 ", "原作者：Paul Falstad。", "JavaScript 移植：Iain Sharp。",
      "回報問題及查看原始碼的 GitHub 儲存庫：", "致謝：", "本程式使用自由授權圖示。詳情請參閱",
      "圖示與字型的作者及授權清單", "授權資訊：", "原始碼（Paul）：", "原始碼（Iain）："]
  };
  const t = strings[lang];
  if (!t) return; // Inglés: conservar los textos originales.
  document.documentElement.lang = lang === "ca-es-valencia" ? "ca-ES-valencia" : lang === "csx" ? "cs" : lang === "kr" ? "ko" : lang;
  const p = [...document.querySelectorAll("div > p")];
  const lead = (index, value) => {
    if (!p[index]) return;
    const node = [...p[index].childNodes].find(x => x.nodeType === Node.TEXT_NODE);
    if (node) node.nodeValue = value;
  };
  lead(0,t[0]); lead(1,t[1]); lead(2,t[2]); lead(3,t[3]);
  lead(4,t[4]); lead(5,t[5]);
  const icons = p[5]?.querySelector("a");
  if (icons) icons.textContent = t[6];
  lead(8,t[7]); lead(9,t[8]); lead(10,t[9]);
  // Créditos y textos legales completos revisados en español y valenciano.
  const detailed = {
    es: {
      credits: `Agradecimientos a Edward Calver por 15 componentes nuevos y otras mejoras;
Rodrigo Hausen por la importación y exportación de archivos y numerosas mejoras de la interfaz;
J. Mike Rollins por el código del diodo Zener; Julius Schmidt por el descargador de chispas y algunos ejemplos;
Dustin Soodak por las mejoras de la interfaz; Jacob Calvert por el biestable T;
Ben Hayden por el espectro del osciloscopio; Francisco Campos por el motor de CC;
Bill Collis por el termistor y la fotorresistencia (LDR);
Mark McGarry por la compatibilidad con AVR8js; Uri Shaked por AVR8js;
Johannes Bauer por la compatibilidad con WebSocket;
Thomas Reitinger, Krystian Sławiński, Usevalad Khatkevich, Lucio Sciamanna,
Mauro Hemerly Gazzani, J. Miguel Silva, Kristian Keilen, Linhart Jiří, Karel Kupa,
Franck Viard, David Chen, Taisuke Fukuno, 肖国栋 (Gordon Shaw), 王逸伦 y Pablo Sanz Martin por las traducciones;
Andre Adrian por las mejoras del oscilador de emisores acoplados;
Felthry por numerosos ejemplos y Colin Howell por las mejoras de código.
LZString (c) 2013 pieroxy.`,
      legal: {
        6: "Este programa es software libre. Puedes redistribuirlo y modificarlo según los términos de la Licencia Pública General de GNU, publicada por la Free Software Foundation, en su versión 2 o, a tu elección, cualquier versión posterior.",
        7: "Este programa se distribuye con la esperanza de que resulte útil, pero SIN NINGUNA GARANTÍA, ni siquiera la garantía implícita de COMERCIABILIDAD o IDONEIDAD PARA UN FIN DETERMINADO. Consulta la Licencia Pública General de GNU para obtener más información.",
        11: "Copyright (c) 1985-1991 The Regents of the University of California. Todos los derechos reservados.",
        12: "LA UNIVERSIDAD DE CALIFORNIA NO SERÁ RESPONSABLE ANTE NINGUNA PARTE POR LOS DAÑOS DIRECTOS, INDIRECTOS, ESPECIALES, ACCIDENTALES O CONSECUENTES DERIVADOS DEL USO DE ESTE SOFTWARE Y SU DOCUMENTACIÓN, AUNQUE HUBIERA SIDO ADVERTIDA DE LA POSIBILIDAD DE TALES DAÑOS.",
        13: "LA UNIVERSIDAD DE CALIFORNIA RENUNCIA EXPRESAMENTE A CUALQUIER GARANTÍA, INCLUIDAS, ENTRE OTRAS, LAS GARANTÍAS IMPLÍCITAS DE COMERCIABILIDAD E IDONEIDAD PARA UN FIN DETERMINADO. ESTE SOFTWARE SE SUMINISTRA «TAL CUAL» Y LA UNIVERSIDAD DE CALIFORNIA NO ESTÁ OBLIGADA A PROPORCIONAR MANTENIMIENTO, SOPORTE, ACTUALIZACIONES, MEJORAS NI MODIFICACIONES.",
        15: "EL SOFTWARE SE PROPORCIONA «TAL CUAL», SIN GARANTÍA DE NINGÚN TIPO, EXPRESA O IMPLÍCITA, INCLUIDAS, ENTRE OTRAS, LAS GARANTÍAS DE COMERCIABILIDAD, IDONEIDAD PARA UN FIN DETERMINADO Y NO INFRACCIÓN DE DERECHOS. EN NINGÚN CASO LOS AUTORES O TITULARES DE LOS DERECHOS DE AUTOR SERÁN RESPONSABLES DE RECLAMACIONES, DAÑOS U OTRAS RESPONSABILIDADES, YA SEAN CONTRACTUALES, EXTRACONTRACTUALES O DE OTRO TIPO, DERIVADAS DEL SOFTWARE O DE SU USO U OTRAS OPERACIONES CON ÉL."
      }
    },
    "ca-es-valencia": {
      credits: `Agraïments a Edward Calver per 15 components nous i altres millores;
Rodrigo Hausen per la importació i exportació de fitxers i nombroses millores de la interfície;
J. Mike Rollins pel codi del díode Zener; Julius Schmidt pel descarregador d'espurnes i alguns exemples;
Dustin Soodak per les millores de la interfície; Jacob Calvert pel biestable T;
Ben Hayden per l'espectre de l'oscil·loscopi; Francisco Campos pel motor de CC;
Bill Collis pel termistor i la fotoresistència (LDR);
Mark McGarry per la compatibilitat amb AVR8js; Uri Shaked per AVR8js;
Johannes Bauer per la compatibilitat amb WebSocket;
Thomas Reitinger, Krystian Sławiński, Usevalad Khatkevich, Lucio Sciamanna,
Mauro Hemerly Gazzani, J. Miguel Silva, Kristian Keilen, Linhart Jiří, Karel Kupa,
Franck Viard, David Chen, Taisuke Fukuno, 肖国栋 (Gordon Shaw), 王逸伦 i Pablo Sanz Martin per les traduccions;
Andre Adrian per les millores de l'oscil·lador d'emissors acoblats;
Felthry per nombrosos exemples i Colin Howell per les millores del codi.
LZString (c) 2013 pieroxy.`,
      legal: {
        6: "Este programa és programari lliure. Pots redistribuir-lo i modificar-lo segons els termes de la Llicència Pública General de GNU, publicada per la Free Software Foundation, en la versió 2 o, a elecció teua, qualsevol versió posterior.",
        7: "Este programa es distribuïx amb l'esperança que siga útil, però SENSE CAP GARANTIA, ni tan sols la garantia implícita de COMERCIABILITAT o IDONEÏTAT PER A UNA FINALITAT CONCRETA. Consulta la Llicència Pública General de GNU per a obtindre'n més informació.",
        11: "Copyright (c) 1985-1991 The Regents of the University of California. Tots els drets reservats.",
        12: "LA UNIVERSITAT DE CALIFÒRNIA NO SERÀ RESPONSABLE DAVANT DE CAP PART PELS DANYS DIRECTES, INDIRECTES, ESPECIALS, ACCIDENTALS O CONSEQÜENTS DERIVATS DE L'ÚS D'ESTE PROGRAMARI I DE LA SEUA DOCUMENTACIÓ, ENCARA QUE HAJA SIGUT ADVERTIDA DE LA POSSIBILITAT D'ESTOS DANYS.",
        13: "LA UNIVERSITAT DE CALIFÒRNIA REBUTJA EXPRESSAMENT QUALSEVOL GARANTIA, INCLOSES, ENTRE ALTRES, LES GARANTIES IMPLÍCITES DE COMERCIABILITAT I IDONEÏTAT PER A UNA FINALITAT CONCRETA. ESTE PROGRAMARI SE SUBMINISTRA «TAL COM ÉS» I LA UNIVERSITAT DE CALIFÒRNIA NO ESTÀ OBLIGADA A PROPORCIONAR MANTENIMENT, SUPORT, ACTUALITZACIONS, MILLORES NI MODIFICACIONS.",
        15: "EL PROGRAMARI ES PROPORCIONA «TAL COM ÉS», SENSE GARANTIA DE CAP CLASSE, EXPRESSA O IMPLÍCITA, INCLOSES, ENTRE ALTRES, LES GARANTIES DE COMERCIABILITAT, IDONEÏTAT PER A UNA FINALITAT CONCRETA I NO INFRACCIÓ DE DRETS. EN CAP CAS ELS AUTORS O TITULARS DELS DRETS D'AUTOR SERAN RESPONSABLES DE RECLAMACIONS, DANYS O ALTRES RESPONSABILITATS, JA SIGUEN CONTRACTUALS, EXTRACONTRACTUALS O D'UNA ALTRA CLASSE, DERIVADES DEL PROGRAMARI, DEL SEU ÚS O D'ALTRES OPERACIONS AMB ESTE."
      }
    }
  };
  const full = detailed[lang];
  if (full) {
    if (p[4]) p[4].textContent = full.credits;
    for (const [index, value] of Object.entries(full.legal)) {
      if (p[Number(index)]) p[Number(index)].textContent = value;
    }
  }
})();

// Traducciones del contenido legal del cuadro Acerca de de CircuitJS.
// Se preservan los originales, créditos y enlaces en about.html.
(() => {
  const requested=new URLSearchParams(location.search).get("lang") || navigator.language || "en";
  const s=requested.toLowerCase().replace(/_/g,"-");
  const lang=s.startsWith("ca-es-valencia")?"ca-es-valencia":
    s.startsWith("zh-tw")||s.startsWith("zh-hant")||s.startsWith("zh-hk")?"zh-tw":
    s.startsWith("cs")?"csx":s.startsWith("ko")?"kr":
    s.startsWith("no")||s.startsWith("nn")?"nb":s.split("-")[0];
  const legal={
  "ru": [
    "Эта программа является свободным программным обеспечением. Вы можете распространять и изменять её на условиях Стандартной общественной лицензии GNU, опубликованной Free Software Foundation, версии 2 или, по вашему выбору, любой более поздней версии.",
    "Программа распространяется в надежде, что будет полезна, но БЕЗ КАКИХ-ЛИБО ГАРАНТИЙ, включая подразумеваемые гарантии ТОВАРНОЙ ПРИГОДНОСТИ и ПРИГОДНОСТИ ДЛЯ КОНКРЕТНОЙ ЦЕЛИ. Подробности приведены в лицензии GNU GPL.",
    "Авторское право © 1985–1991, Попечительский совет Калифорнийского университета. Все права защищены.",
    "КАЛИФОРНИЙСКИЙ УНИВЕРСИТЕТ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ НЕ НЕСЁТ ОТВЕТСТВЕННОСТИ ЗА ПРЯМОЙ, КОСВЕННЫЙ, ОСОБЫЙ, СЛУЧАЙНЫЙ ИЛИ ПОСЛЕДУЮЩИЙ УЩЕРБ ОТ ИСПОЛЬЗОВАНИЯ ЭТОГО ПО И ДОКУМЕНТАЦИИ, ДАЖЕ ЕСЛИ УНИВЕРСИТЕТ БЫЛ ПРЕДУПРЕЖДЁН О ВОЗМОЖНОСТИ ТАКОГО УЩЕРБА.",
    "КАЛИФОРНИЙСКИЙ УНИВЕРСИТЕТ ПРЯМО ОТКАЗЫВАЕТСЯ ОТ ВСЕХ ГАРАНТИЙ, ВКЛЮЧАЯ ПОДРАЗУМЕВАЕМЫЕ ГАРАНТИИ ТОВАРНОЙ ПРИГОДНОСТИ И ПРИГОДНОСТИ ДЛЯ КОНКРЕТНОЙ ЦЕЛИ. ПО ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ»; УНИВЕРСИТЕТ НЕ ОБЯЗАН ОБЕСПЕЧИВАТЬ ОБСЛУЖИВАНИЕ, ПОДДЕРЖКУ, ОБНОВЛЕНИЯ, УЛУЧШЕНИЯ ИЛИ ИЗМЕНЕНИЯ.",
    "ПО ПРЕДОСТАВЛЯЕТСЯ «КАК ЕСТЬ», БЕЗ ЛЮБЫХ ЯВНЫХ ИЛИ ПОДРАЗУМЕВАЕМЫХ ГАРАНТИЙ, ВКЛЮЧАЯ ТОВАРНУЮ ПРИГОДНОСТЬ, ПРИГОДНОСТЬ ДЛЯ ОПРЕДЕЛЁННОЙ ЦЕЛИ И ОТСУТСТВИЕ НАРУШЕНИЯ ПРАВ. АВТОРЫ И ПРАВООБЛАДАТЕЛИ НИ В КОЕМ СЛУЧАЕ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ПО ПРЕТЕНЗИЯМ, ЗА УЩЕРБ ИЛИ ИНЫЕ ОБЯЗАТЕЛЬСТВА, ВОЗНИКШИЕ ИЗ ДОГОВОРА, ДЕЛИКТА, ИНЫХ ОСНОВАНИЙ, ИСПОЛЬЗОВАНИЯ ИЛИ ДРУГИХ ОПЕРАЦИЙ С ПО."
  ],
  "fr": [
    "Ce programme est un logiciel libre : vous pouvez le redistribuer et le modifier selon les termes de la licence publique générale GNU, publiée par la Free Software Foundation, version 2 ou toute version ultérieure de votre choix.",
    "Ce programme est distribué dans l’espoir qu’il sera utile, mais SANS AUCUNE GARANTIE, notamment sans garantie implicite de QUALITÉ MARCHANDE ou d’ADÉQUATION À UN USAGE PARTICULIER. Consultez la licence GNU GPL pour plus de détails.",
    "Copyright © 1985-1991, The Regents of the University of California. Tous droits réservés.",
    "L’UNIVERSITÉ DE CALIFORNIE NE POURRA EN AUCUN CAS ÊTRE TENUE RESPONSABLE DES DOMMAGES DIRECTS, INDIRECTS, PARTICULIERS, ACCESSOIRES OU CONSÉCUTIFS DÉCOULANT DE L’UTILISATION DE CE LOGICIEL ET DE SA DOCUMENTATION, MÊME SI ELLE A ÉTÉ INFORMÉE DE LEUR POSSIBILITÉ.",
    "L’UNIVERSITÉ DE CALIFORNIE EXCLUT EXPRESSÉMENT TOUTE GARANTIE, NOTAMMENT LES GARANTIES IMPLICITES DE QUALITÉ MARCHANDE ET D’ADÉQUATION À UN USAGE PARTICULIER. CE LOGICIEL EST FOURNI « EN L’ÉTAT » ; L’UNIVERSITÉ N’EST TENUE D’ASSURER NI MAINTENANCE, NI ASSISTANCE, NI MISES À JOUR, NI AMÉLIORATIONS, NI MODIFICATIONS.",
    "LE LOGICIEL EST FOURNI « EN L’ÉTAT », SANS GARANTIE EXPRESSE OU IMPLICITE, NOTAMMENT DE QUALITÉ MARCHANDE, D’ADÉQUATION À UN USAGE PARTICULIER OU D’ABSENCE DE CONTREFAÇON. LES AUTEURS ET TITULAIRES DE DROITS NE POURRONT EN AUCUN CAS ÊTRE TENUS RESPONSABLES DES RÉCLAMATIONS, DOMMAGES OU AUTRES RESPONSABILITÉS, CONTRACTUELLES, DÉLICTUELLES OU AUTRES, LIÉS AU LOGICIEL, À SON UTILISATION OU À D’AUTRES OPÉRATIONS LE CONCERNANT."
  ],
  "de": [
    "Dieses Programm ist freie Software. Sie dürfen es gemäß der von der Free Software Foundation veröffentlichten GNU General Public License, Version 2 oder nach Ihrer Wahl einer späteren Version, weitergeben und verändern.",
    "Dieses Programm wird in der Hoffnung verbreitet, dass es nützlich ist, jedoch OHNE JEGLICHE GEWÄHRLEISTUNG, auch nicht die stillschweigende Gewährleistung der MARKTGÄNGIGKEIT oder EIGNUNG FÜR EINEN BESTIMMTEN ZWECK. Einzelheiten enthält die GNU GPL.",
    "Copyright © 1985–1991 The Regents of the University of California. Alle Rechte vorbehalten.",
    "DIE UNIVERSITY OF CALIFORNIA HAFTET UNTER KEINEN UMSTÄNDEN FÜR UNMITTELBARE, MITTELBARE, BESONDERE, ZUFÄLLIGE ODER FOLGESCHÄDEN AUS DER NUTZUNG DIESER SOFTWARE UND IHRER DOKUMENTATION, SELBST WENN SIE ÜBER DIE MÖGLICHKEIT SOLCHER SCHÄDEN INFORMIERT WURDE.",
    "DIE UNIVERSITY OF CALIFORNIA SCHLIESST AUSDRÜCKLICH JEDE GEWÄHRLEISTUNG AUS, EINSCHLIESSLICH DER STILLSCHWEIGENDEN GEWÄHRLEISTUNG DER MARKTGÄNGIGKEIT UND EIGNUNG FÜR EINEN BESTIMMTEN ZWECK. DIE SOFTWARE WIRD „WIE BESEHEN“ BEREITGESTELLT; ES BESTEHT KEINE PFLICHT ZU WARTUNG, UNTERSTÜTZUNG, AKTUALISIERUNGEN, VERBESSERUNGEN ODER ÄNDERUNGEN.",
    "DIE SOFTWARE WIRD „WIE BESEHEN“ UND OHNE AUSDRÜCKLICHE ODER STILLSCHWEIGENDE GEWÄHRLEISTUNG BEREITGESTELLT, EINSCHLIESSLICH MARKTGÄNGIGKEIT, EIGNUNG FÜR EINEN BESTIMMTEN ZWECK UND NICHTVERLETZUNG VON RECHTEN. AUTOREN UND RECHTEINHABER HAFTEN NICHT FÜR ANSPRÜCHE, SCHÄDEN ODER SONSTIGE VERPFLICHTUNGEN AUS VERTRAG, UNERLAUBTER HANDLUNG ODER ANDEREN GRÜNDEN, DIE MIT DER SOFTWARE, IHRER NUTZUNG ODER SONSTIGEN VORGÄNGEN ZUSAMMENHÄNGEN."
  ],
  "it": [
    "Questo programma è software libero: può essere ridistribuito e modificato secondo la Licenza Pubblica Generale GNU pubblicata dalla Free Software Foundation, versione 2 o, a scelta, qualsiasi versione successiva.",
    "Il programma viene distribuito nella speranza che sia utile, ma SENZA ALCUNA GARANZIA, comprese le garanzie implicite di COMMERCIABILITÀ e IDONEITÀ A UNO SCOPO PARTICOLARE. Per i dettagli consultare la licenza GNU GPL.",
    "Copyright © 1985-1991 The Regents of the University of California. Tutti i diritti riservati.",
    "L’UNIVERSITÀ DELLA CALIFORNIA NON SARÀ IN ALCUN CASO RESPONSABILE DI DANNI DIRETTI, INDIRETTI, SPECIALI, INCIDENTALI O CONSEQUENZIALI DERIVANTI DALL’USO DEL SOFTWARE E DELLA DOCUMENTAZIONE, ANCHE SE INFORMATA DELLA POSSIBILITÀ DI TALI DANNI.",
    "L’UNIVERSITÀ DELLA CALIFORNIA DECLINA ESPRESSAMENTE OGNI GARANZIA, COMPRESE QUELLE IMPLICITE DI COMMERCIABILITÀ E IDONEITÀ A UNO SCOPO PARTICOLARE. IL SOFTWARE È FORNITO «COSÌ COM’È» E L’UNIVERSITÀ NON È TENUTA A FORNIRE MANUTENZIONE, ASSISTENZA, AGGIORNAMENTI, MIGLIORAMENTI O MODIFICHE.",
    "IL SOFTWARE È FORNITO «COSÌ COM’È», SENZA GARANZIE ESPLICITE O IMPLICITE, INCLUSE COMMERCIABILITÀ, IDONEITÀ A UNO SCOPO PARTICOLARE E NON VIOLAZIONE DI DIRITTI. GLI AUTORI E I TITOLARI DEI DIRITTI NON SARANNO RESPONSABILI PER RECLAMI, DANNI O ALTRE RESPONSABILITÀ DI NATURA CONTRATTUALE, EXTRACONTRATTUALE O ALTRA, DERIVANTI DAL SOFTWARE, DAL SUO UTILIZZO O DA ALTRE OPERAZIONI SU DI ESSO."
  ],
  "pt": [
    "Este programa é software livre: pode redistribuí-lo e modificá-lo segundo os termos da Licença Pública Geral GNU, publicada pela Free Software Foundation, versão 2 ou qualquer versão posterior, à sua escolha.",
    "O programa é distribuído na esperança de ser útil, mas SEM QUALQUER GARANTIA, incluindo as garantias implícitas de COMERCIALIZAÇÃO ou ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA. Consulte a licença GNU GPL para mais informações.",
    "Copyright © 1985–1991 The Regents of the University of California. Todos os direitos reservados.",
    "A UNIVERSIDADE DA CALIFÓRNIA NÃO SERÁ RESPONSÁVEL POR DANOS DIRETOS, INDIRETOS, ESPECIAIS, INCIDENTAIS OU CONSEQUENTES DECORRENTES DO USO DESTE SOFTWARE E DA SUA DOCUMENTAÇÃO, MESMO QUE TENHA SIDO INFORMADA DA POSSIBILIDADE DE TAIS DANOS.",
    "A UNIVERSIDADE DA CALIFÓRNIA EXCLUI EXPRESSAMENTE TODAS AS GARANTIAS, INCLUINDO AS GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO E ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA. O SOFTWARE É FORNECIDO «TAL COMO ESTÁ», SEM OBRIGAÇÃO DE MANUTENÇÃO, APOIO, ATUALIZAÇÕES, MELHORIAS OU MODIFICAÇÕES.",
    "O SOFTWARE É FORNECIDO «TAL COMO ESTÁ», SEM GARANTIA EXPRESSA OU IMPLÍCITA, INCLUINDO COMERCIALIZAÇÃO, ADEQUAÇÃO A UMA FINALIDADE ESPECÍFICA E NÃO VIOLAÇÃO DE DIREITOS. OS AUTORES E TITULARES DOS DIREITOS NÃO RESPONDEM POR RECLAMAÇÕES, DANOS OU OUTRAS RESPONSABILIDADES CONTRATUAIS, EXTRACONTRATUAIS OU DE OUTRA NATUREZA RELACIONADAS COM O SOFTWARE, A SUA UTILIZAÇÃO OU OUTRAS OPERAÇÕES."
  ],
  "ca": [
    "Aquest programa és programari lliure: el podeu redistribuir i modificar d’acord amb els termes de la Llicència Pública General GNU, publicada per la Free Software Foundation, versió 2 o qualsevol versió posterior, a la vostra elecció.",
    "El programa es distribueix amb l’esperança que sigui útil, però SENSE CAP GARANTIA, ni tan sols les garanties implícites de COMERCIABILITAT o IDONEÏTAT PER A UNA FINALITAT CONCRETA. Consulteu la llicència GNU GPL per obtenir-ne més informació.",
    "Copyright © 1985–1991 The Regents of the University of California. Tots els drets reservats.",
    "LA UNIVERSITAT DE CALIFÒRNIA NO SERÀ RESPONSABLE DELS DANYS DIRECTES, INDIRECTES, ESPECIALS, ACCIDENTALS O CONSEQÜENTS DERIVATS DE L’ÚS D’AQUEST PROGRAMARI I DE LA SEVA DOCUMENTACIÓ, ENCARA QUE HAGI ESTAT INFORMADA DE LA POSSIBILITAT D’AQUESTS DANYS.",
    "LA UNIVERSITAT DE CALIFÒRNIA EXCLOU EXPRESSAMENT TOTES LES GARANTIES, INCLOSES LES GARANTIES IMPLÍCITES DE COMERCIABILITAT I IDONEÏTAT PER A UNA FINALITAT CONCRETA. EL PROGRAMARI ES PROPORCIONA «TAL COM ÉS», SENSE OBLIGACIÓ DE MANTENIMENT, ASSISTÈNCIA, ACTUALITZACIONS, MILLORES NI MODIFICACIONS.",
    "EL PROGRAMARI ES PROPORCIONA «TAL COM ÉS», SENSE GARANTIA EXPRESSA NI IMPLÍCITA, INCLOSES LA COMERCIABILITAT, LA IDONEÏTAT PER A UNA FINALITAT CONCRETA I LA NO INFRACCIÓ DE DRETS. ELS AUTORS I TITULARS DE DRETS NO SERAN RESPONSABLES DE RECLAMACIONS, DANYS NI ALTRES RESPONSABILITATS CONTRACTUALS, EXTRACONTRACTUALS O D’ALTRA NATURALESA RELACIONADES AMB EL PROGRAMARI, EL SEU ÚS O ALTRES OPERACIONS."
  ],
  "gl": [
    "Este programa é software libre: pode redistribuílo e modificalo segundo os termos da Licenza Pública Xeral GNU, publicada pola Free Software Foundation, versión 2 ou, se o prefire, calquera versión posterior.",
    "O programa distribúese coa esperanza de ser útil, mais SEN NINGUNHA GARANTÍA, nin sequera as garantías implícitas de COMERCIALIZACIÓN ou ADECUACIÓN A UN FIN CONCRETO. Consulte a licenza GNU GPL para obter máis información.",
    "Copyright © 1985–1991 The Regents of the University of California. Todos os dereitos reservados.",
    "A UNIVERSIDADE DE CALIFORNIA NON SERÁ RESPONSABLE DE DANOS DIRECTOS, INDIRECTOS, ESPECIAIS, ACCIDENTAIS OU CONSECUENTES DERIVADOS DO USO DESTE SOFTWARE E DA SÚA DOCUMENTACIÓN, AÍNDA QUE FOSE ADVERTIDA DA POSIBILIDADE DESSES DANOS.",
    "A UNIVERSIDADE DE CALIFORNIA EXCLÚE EXPRESAMENTE TODAS AS GARANTÍAS, INCLUÍDAS AS GARANTÍAS IMPLÍCITAS DE COMERCIALIZACIÓN E ADECUACIÓN A UN FIN CONCRETO. O SOFTWARE FORNÉCESE «TAL COMO ESTÁ» E NON HAI OBRIGA DE OFRECER MANTEMENTO, SOPORTE, ACTUALIZACIÓNS, MELLORAS NIN MODIFICACIÓNS.",
    "O SOFTWARE FORNÉCESE «TAL COMO ESTÁ», SEN GARANTÍA EXPRESA NIN IMPLÍCITA, INCLUÍDAS A COMERCIALIZACIÓN, A ADECUACIÓN A UN FIN CONCRETO E A NON INFRACCIÓN DE DEREITOS. OS AUTORES E TITULARES DE DEREITOS NON RESPONDERÁN DE RECLAMACIÓNS, DANOS OU OUTRAS RESPONSABILIDADES CONTRACTUAIS, EXTRACONTRACTUAIS OU DOUTRA NATUREZA DERIVADAS DO SOFTWARE, DO SEU USO OU DOUTRAS OPERACIÓNS."
  ],
  "eu": [
    "Programa hau software librea da: Free Software Foundation erakundeak argitaratutako GNU Lizentzia Publiko Orokorraren arabera birbanatu eta alda dezakezu, 2. bertsioan edo, nahi baduzu, ondorengo edozein bertsiotan.",
    "Programa erabilgarria izango delakoan banatzen da, baina INOLAKO BERMERIK GABE, ezta MERKATURATZEKO EGOKITASUNAREN edo HELBURU JAKIN BATERAKO EGOKITASUNAREN berme inpliziturik ere. Xehetasunetarako, ikusi GNU GPL lizentzia.",
    "Copyright © 1985–1991 The Regents of the University of California. Eskubide guztiak erreserbatuta.",
    "KALIFORNIAKO UNIBERTSITATEAK EZ DU ERANTZUKIZUNIK IZANGO SOFTWARE HAU ETA BERE DOKUMENTAZIOA ERABILTZEAREN ONDORIOZKO KALTE ZUZEN, ZEHARKAKO, BEREZI, USTEKABEKO EDO ONDORIOZKOENGATIK, KALTE HORIEN AUKERAZ OHARTARAZI BAZAIO ERE.",
    "KALIFORNIAKO UNIBERTSITATEAK ESPRESUKI UKATZEN DITU BERME GUZTIAK, BARNE MERKATURATZEKO EGOKITASUNAREN ETA HELBURU JAKIN BATERAKO EGOKITASUNAREN BERME INPLIZITUAK. SOFTWAREA «DAGOEN BEZALA» EMATEN DA, ETA EZ DAGO MANTENTZE-LANAK, LAGUNTZA, EGUNERATZEAK, HOBEKUNTZAK EDO ALDAKETAK EMATEKO BETEBEHARRIK.",
    "SOFTWAREA «DAGOEN BEZALA» EMATEN DA, BERME ESPRESU EDO INPLIZITURIK GABE, BARNE MERKATURATZEKO EGOKITASUNA, HELBURU JAKIN BATERAKO EGOKITASUNA ETA ESKUBIDEAK EZ URRATZEKO BERMEA. EGILEAK ETA ESKUBIDEEN TITULARRAK EZ DIRA ERANTZULE IZANGO SOFTWAREAREKIN, HAREN ERABILERAREKIN EDO BESTE ERAGIKETA BATZUEKIN LOTUTAKO KONTRATU, KALTE EDO BESTELAKO ERREKLAMAZIO, KALTE EDO BETEBEHARRENGATIK."
  ],
  "nl": [
    "Dit programma is vrije software. U mag het verspreiden en wijzigen onder de voorwaarden van de GNU General Public License, gepubliceerd door de Free Software Foundation, versie 2 of naar keuze een latere versie.",
    "Dit programma wordt verspreid in de hoop dat het nuttig zal zijn, maar ZONDER ENIGE GARANTIE, zelfs zonder de stilzwijgende garantie van VERHANDELBAARHEID of GESCHIKTHEID VOOR EEN BEPAALD DOEL. Zie de GNU GPL voor meer informatie.",
    "Copyright © 1985–1991 The Regents of the University of California. Alle rechten voorbehouden.",
    "DE UNIVERSITEIT VAN CALIFORNIË IS IN GEEN GEVAL AANSPRAKELIJK VOOR DIRECTE, INDIRECTE, BIJZONDERE, INCIDENTELE OF GEVOLGSCHADE DOOR HET GEBRUIK VAN DEZE SOFTWARE EN DOCUMENTATIE, ZELFS ALS ZIJ OP DE MOGELIJKHEID VAN DIE SCHADE IS GEWEZEN.",
    "DE UNIVERSITEIT VAN CALIFORNIË WIJST ALLE GARANTIES UITDRUKKELIJK AF, MET INBEGRIP VAN STILZWIJGENDE GARANTIES VAN VERHANDELBAARHEID EN GESCHIKTHEID VOOR EEN BEPAALD DOEL. DE SOFTWARE WORDT GELEVERD 'ZOALS DEZE IS', ZONDER VERPLICHTING TOT ONDERHOUD, ONDERSTEUNING, UPDATES, VERBETERINGEN OF WIJZIGINGEN.",
    "DE SOFTWARE WORDT GELEVERD 'ZOALS DEZE IS', ZONDER UITDRUKKELIJKE OF STILZWIJGENDE GARANTIE, WAARONDER VERHANDELBAARHEID, GESCHIKTHEID VOOR EEN BEPAALD DOEL EN NIET-INBREUK. AUTEURS EN RECHTHEBBENDEN ZIJN NIET AANSPRAKELIJK VOOR VORDERINGEN, SCHADE OF ANDERE AANSPRAKELIJKHEID UIT CONTRACT, ONRECHTMATIGE DAAD OF ANDERSZINS, DIE VERBAND HOUDEN MET DE SOFTWARE, HET GEBRUIK OF ANDERE HANDELINGEN ERMEE."
  ],
  "sv": [
    "Detta program är fri programvara. Du får sprida och ändra det enligt GNU General Public License, utgiven av Free Software Foundation, version 2 eller valfri senare version.",
    "Programmet distribueras i hopp om att vara användbart, men UTAN NÅGON GARANTI, inte ens underförstådd garanti om SÄLJBARHET eller LÄMPLIGHET FÖR ETT VISST ÄNDAMÅL. Se GNU GPL för mer information.",
    "Copyright © 1985–1991 The Regents of the University of California. Alla rättigheter förbehållna.",
    "UNIVERSITY OF CALIFORNIA ANSVARAR INTE UNDER NÅGRA OMSTÄNDIGHETER FÖR DIREKTA, INDIREKTA, SÄRSKILDA, OFÖRUTSEDDA ELLER FÖLJDSKADOR SOM UPPSTÅR GENOM ANVÄNDNING AV PROGRAMVARAN OCH DESS DOKUMENTATION, ÄVEN OM UNIVERSITETET INFORMERATS OM RISKEN FÖR SÅDAN SKADA.",
    "UNIVERSITY OF CALIFORNIA FRÅNSÄGER SIG UTTRYCKLIGEN ALLA GARANTIER, INKLUSIVE UNDERFÖRSTÅDDA GARANTIER OM SÄLJBARHET OCH LÄMPLIGHET FÖR ETT VISST ÄNDAMÅL. PROGRAMVARAN TILLHANDAHÅLLS I BEFINTLIGT SKICK; UNIVERSITETET HAR INGEN SKYLDIGHET ATT GE UNDERHÅLL, SUPPORT, UPPDATERINGAR, FÖRBÄTTRINGAR ELLER ÄNDRINGAR.",
    "PROGRAMVARAN TILLHANDAHÅLLS I BEFINTLIGT SKICK, UTAN UTTRYCKLIG ELLER UNDERFÖRSTÅDD GARANTI, INKLUSIVE SÄLJBARHET, LÄMPLIGHET FÖR ETT VISST ÄNDAMÅL OCH FRIHET FRÅN RÄTTSINTRÅNG. UPPHOVSPERSONER OCH RÄTTIGHETSINNEHAVARE ANSVARAR INTE FÖR ANSPRÅK, SKADOR ELLER ANNAT ANSVAR GRUNDAT PÅ AVTAL, SKADESTÅND ELLER ANNAN RÄTTSGRUND, SOM HÄRRÖR FRÅN PROGRAMVARAN, ANVÄNDNINGEN ELLER ANDRA ÅTGÄRDER."
  ],
  "da": [
    "Dette program er fri software. Du må videredistribuere og ændre det efter GNU General Public License udgivet af Free Software Foundation, version 2 eller efter eget valg en senere version.",
    "Programmet distribueres i håb om at være nyttigt, men UDEN NOGEN GARANTI, heller ikke underforstået garanti for SALGBARHED eller EGNETHED TIL ET BESTEMT FORMÅL. Se GNU GPL for detaljer.",
    "Copyright © 1985–1991 The Regents of the University of California. Alle rettigheder forbeholdes.",
    "UNIVERSITY OF CALIFORNIA ER UNDER INGEN OMSTÆNDIGHEDER ANSVARLIG FOR DIREKTE, INDIREKTE, SÆRLIGE, HÆNDELIGE ELLER FØLGESKADER VED BRUG AF DENNE SOFTWARE OG DOKUMENTATION, SELV OM UNIVERSITETET ER BLEVET OPLYST OM MULIGHEDEN FOR SÅDANNE SKADER.",
    "UNIVERSITY OF CALIFORNIA FRASKRIVER SIG UDTRYKKELIGT ALLE GARANTIER, HERUNDER UNDERFORSTÅEDE GARANTIER OM SALGBARHED OG EGNETHED TIL ET BESTEMT FORMÅL. SOFTWAREN LEVERES 'SOM DEN ER', UDEN FORPLIGTELSE TIL VEDLIGEHOLDELSE, SUPPORT, OPDATERINGER, FORBEDRINGER ELLER ÆNDRINGER.",
    "SOFTWAREN LEVERES 'SOM DEN ER', UDEN UDTRYKKELIG ELLER UNDERFORSTÅET GARANTI, HERUNDER OM SALGBARHED, EGNETHED TIL ET BESTEMT FORMÅL OG KRÆNKELSESFRIHED. FORFATTERE OG RETTIGHEDSHAVERE ER IKKE ANSVARLIGE FOR KRAV, SKADER ELLER ANDET ANSVAR EFTER KONTRAKT, ERSTATNINGSRET ELLER ANDET, SOM FØLGER AF SOFTWAREN, BRUGEN ELLER ANDRE HANDLINGER."
  ],
  "nb": [
    "Dette programmet er fri programvare. Du kan distribuere og endre det i samsvar med GNU General Public License, utgitt av Free Software Foundation, versjon 2 eller en senere versjon etter eget valg.",
    "Programmet distribueres i håp om å være nyttig, men UTEN NOEN GARANTI, heller ikke underforståtte garantier om SALGBARHET eller EGNETHET FOR ET BESTEMT FORMÅL. Se GNU GPL for detaljer.",
    "Copyright © 1985–1991 The Regents of the University of California. Alle rettigheter forbeholdt.",
    "UNIVERSITY OF CALIFORNIA ER UNDER INGEN OMSTENDIGHETER ANSVARLIG FOR DIREKTE, INDIREKTE, SÆRSKILTE, TILFELDIGE ELLER FØLGESKADER SOM FØLGE AV BRUK AV PROGRAMVAREN OG DOKUMENTASJONEN, SELV OM UNIVERSITETET ER VARSLET OM MULIGHETEN FOR SLIKE SKADER.",
    "UNIVERSITY OF CALIFORNIA FRASKRIVER SEG UTTRYKKELIG ALLE GARANTIER, INKLUDERT UNDERFORSTÅTTE GARANTIER OM SALGBARHET OG EGNETHET FOR ET BESTEMT FORMÅL. PROGRAMVAREN LEVERES 'SOM DEN ER', UTEN PLIKT TIL VEDLIKEHOLD, STØTTE, OPPDATERINGER, FORBEDRINGER ELLER ENDRINGER.",
    "PROGRAMVAREN LEVERES 'SOM DEN ER', UTEN UTTRYKKELIGE ELLER UNDERFORSTÅTTE GARANTIER, INKLUDERT SALGBARHET, EGNETHET FOR ET BESTEMT FORMÅL OG IKKE-KRENKELSE. FORFATTERE OG RETTIGHETSHAVERE ER IKKE ANSVARLIGE FOR KRAV, SKADER ELLER ANNET ANSVAR SOM FØLGE AV KONTRAKT, ERSTATNINGSRETT ELLER ANNET, KNYTTET TIL PROGRAMVAREN, BRUKEN ELLER ANDRE HANDLINGER."
  ],
  "fi": [
    "Tämä ohjelma on vapaa ohjelmisto. Sitä saa levittää ja muokata Free Software Foundationin julkaiseman GNU General Public License -lisenssin version 2 tai valinnaisesti minkä tahansa uudemman version ehtojen mukaisesti.",
    "Ohjelmaa levitetään siinä toivossa, että siitä on hyötyä, mutta ILMAN MITÄÄN TAKUUTA, mukaan lukien oletetut takuut KAUPALLISESTA HYÖDYNNETTÄVYYDESTÄ ja SOVELTUVUUDESTA TIETTYYN TARKOITUKSEEN. Lisätietoja on GNU GPL -lisenssissä.",
    "Copyright © 1985–1991 The Regents of the University of California. Kaikki oikeudet pidätetään.",
    "KALIFORNIAN YLIOPISTO EI MISSÄÄN TAPAUKSESSA VASTAA SUORISTA, EPÄSUORISTA, ERITYISISTÄ, SATUNNAISISTA TAI VÄLILLISISTÄ VAHINGOISTA, JOTKA AIHEUTUVAT TÄMÄN OHJELMISTON JA DOKUMENTAATION KÄYTÖSTÄ, VAIKKA YLIOPISTOLLE OLISI ILMOITETTU TÄLLAISTEN VAHINKOJEN MAHDOLLISUUDESTA.",
    "KALIFORNIAN YLIOPISTO KIISTÄÄ NIMENOMAISESTI KAIKKI TAKUUT, MYÖS OLETETUT TAKUUT KAUPALLISESTA HYÖDYNNETTÄVYYDESTÄ JA SOVELTUVUUDESTA TIETTYYN TARKOITUKSEEN. OHJELMISTO TOIMITETAAN 'SELLAISENAAN', EIKÄ YLIOPISTOLLA OLE VELVOLLISUUTTA TARJOTA YLLÄPITOA, TUKEA, PÄIVITYKSIÄ, PARANNUKSIA TAI MUUTOKSIA.",
    "OHJELMISTO TOIMITETAAN 'SELLAISENAAN' ILMAN NIMENOMAISTA TAI OLETETTUA TAKUUTA, MUKAAN LUKIEN KAUPALLINEN HYÖDYNNETTÄVYYS, SOVELTUVUUS TIETTYYN TARKOITUKSEEN JA OIKEUKSIEN LOUKKAAMATTOMUUS. TEKIJÄT JA OIKEUDENHALTIJAT EIVÄT VASTAA SOPIMUKSEEN, VAHINGONKORVAUKSEEN TAI MUUHUN PERUSTEESEEN LIITTYVISTÄ VAATIMUKSISTA, VAHINGOISTA TAI MUISTA VASTUISTA, JOTKA JOHTUVAT OHJELMISTOSTA, SEN KÄYTÖSTÄ TAI MUISTA TOIMISTA."
  ],
  "pl": [
    "Ten program jest wolnym oprogramowaniem. Można go rozpowszechniać i modyfikować zgodnie z GNU General Public License opublikowaną przez Free Software Foundation, w wersji 2 lub dowolnej późniejszej.",
    "Program rozpowszechniany jest z nadzieją, że będzie przydatny, ale BEZ JAKIEJKOLWIEK GWARANCJI, także dorozumianej gwarancji PRZYDATNOŚCI HANDLOWEJ lub PRZYDATNOŚCI DO OKREŚLONEGO CELU. Szczegóły zawiera licencja GNU GPL.",
    "Copyright © 1985–1991 The Regents of the University of California. Wszelkie prawa zastrzeżone.",
    "UNIWERSYTET KALIFORNIJSKI W ŻADNYM WYPADKU NIE ODPOWIADA ZA SZKODY BEZPOŚREDNIE, POŚREDNIE, SZCZEGÓLNE, PRZYPADKOWE LUB WYNIKOWE POWSTAŁE W ZWIĄZKU Z KORZYSTANIEM Z TEGO OPROGRAMOWANIA I DOKUMENTACJI, NAWET JEŚLI ZOSTAŁ POINFORMOWANY O MOŻLIWOŚCI TAKICH SZKÓD.",
    "UNIWERSYTET KALIFORNIJSKI WYRAŹNIE WYŁĄCZA WSZELKIE GWARANCJE, W TYM DOROZUMIANE GWARANCJE PRZYDATNOŚCI HANDLOWEJ I PRZYDATNOŚCI DO OKREŚLONEGO CELU. OPROGRAMOWANIE JEST DOSTARCZANE 'TAK JAK JEST', BEZ OBOWIĄZKU ZAPEWNIANIA KONSERWACJI, POMOCY, AKTUALIZACJI, ULEPSZEŃ LUB ZMIAN.",
    "OPROGRAMOWANIE JEST DOSTARCZANE 'TAK JAK JEST', BEZ JAKIEJKOLWIEK GWARANCJI WYRAŹNEJ LUB DOROZUMIANEJ, W TYM PRZYDATNOŚCI HANDLOWEJ, PRZYDATNOŚCI DO OKREŚLONEGO CELU I NIENARUSZANIA PRAW. AUTORZY I WŁAŚCICIELE PRAW NIE PONOSZĄ ODPOWIEDZIALNOŚCI ZA ROSZCZENIA, SZKODY ANI INNE ZOBOWIĄZANIA KONTRAKTOWE, DELIKTOWE LUB INNE WYNIKAJĄCE Z OPROGRAMOWANIA, JEGO UŻYWANIA LUB INNYCH DZIAŁAŃ."
  ],
  "csx": [
    "Tento program je svobodný software. Můžete jej dále šířit a upravovat podle podmínek GNU General Public License vydané Free Software Foundation, verze 2 nebo libovolné pozdější verze.",
    "Program je šířen v naději, že bude užitečný, ale BEZ JAKÉKOLI ZÁRUKY, včetně předpokládané záruky PRODEJNOSTI nebo VHODNOSTI PRO KONKRÉTNÍ ÚČEL. Podrobnosti uvádí licence GNU GPL.",
    "Copyright © 1985–1991 The Regents of the University of California. Všechna práva vyhrazena.",
    "UNIVERZITA KALIFORNIE NENÍ ZA ŽÁDNÝCH OKOLNOSTÍ ODPOVĚDNÁ ZA PŘÍMÉ, NEPŘÍMÉ, ZVLÁŠTNÍ, NÁHODNÉ ANI NÁSLEDNÉ ŠKODY VZNIKLÉ UŽITÍM TOHOTO SOFTWARU A JEHO DOKUMENTACE, ANI KDYŽ BYLA NA MOŽNOST TAKOVÝCH ŠKOD UPOZORNĚNA.",
    "UNIVERZITA KALIFORNIE VÝSLOVNĚ ODMÍTÁ VEŠKERÉ ZÁRUKY, VČETNĚ PŘEDPOKLÁDANÝCH ZÁRUK PRODEJNOSTI A VHODNOSTI PRO KONKRÉTNÍ ÚČEL. SOFTWARE JE POSKYTOVÁN 'TAK, JAK JE', BEZ POVINNOSTI ZAJIŠŤOVAT ÚDRŽBU, PODPORU, AKTUALIZACE, VYLEPŠENÍ NEBO ÚPRAVY.",
    "SOFTWARE JE POSKYTOVÁN 'TAK, JAK JE', BEZ VÝSLOVNÝCH ČI PŘEDPOKLÁDANÝCH ZÁRUK, VČETNĚ PRODEJNOSTI, VHODNOSTI PRO KONKRÉTNÍ ÚČEL A NEPORUŠOVÁNÍ PRÁV. AUTOŘI ANI DRŽITELÉ PRÁV NEODPOVÍDAJÍ ZA NÁROKY, ŠKODY ANI JINÉ ZÁVAZKY SMLUVNÍ, MIMOSMLUVNÍ ČI JINÉ VZNIKLÉ V SOUVISLOSTI SE SOFTWAREM, JEHO UŽÍVÁNÍM NEBO JINÝM NAKLÁDÁNÍM."
  ],
  "ja": [
    "このプログラムは自由ソフトウェアです。Free Software Foundation が公開した GNU 一般公衆利用許諾書の第2版、または選択によりそれ以降の版の条件に従って、再配布および改変できます。",
    "本プログラムは有用であることを願って配布されますが、商品性や特定目的への適合性を含め、一切の保証はありません。詳しくは GNU GPL を参照してください。",
    "著作権 © 1985–1991 カリフォルニア大学評議員会。無断転載を禁じます。",
    "カリフォルニア大学は、このソフトウェアと文書の使用に起因する直接的、間接的、特別、付随的または結果的な損害について、その可能性を知らされていた場合でも、一切責任を負いません。",
    "カリフォルニア大学は、商品性や特定目的への適合性の黙示保証を含む、すべての保証を明示的に否認します。本ソフトウェアは「現状有姿」で提供され、保守、サポート、更新、改善または変更を行う義務を負いません。",
    "本ソフトウェアは「現状有姿」で、商品性、特定目的への適合性、権利の非侵害を含め、明示または黙示の保証なしに提供されます。著作者および著作権者は、契約、不法行為その他の法的根拠に基づく請求、損害その他の責任について、ソフトウェア、その使用またはその他の取扱いに関連して責任を負いません。"
  ],
  "kr": [
    "이 프로그램은 자유 소프트웨어입니다. Free Software Foundation이 공개한 GNU 일반 공중 사용 허가서 버전 2 또는 선택에 따라 이후 버전의 조건에 따라 재배포하고 수정할 수 있습니다.",
    "이 프로그램은 유용하리라는 기대 아래 배포되지만, 상품성이나 특정 목적에의 적합성에 대한 묵시적 보증을 포함한 어떠한 보증도 제공하지 않습니다. 자세한 내용은 GNU GPL을 참조하십시오.",
    "저작권 © 1985–1991 캘리포니아 대학교 이사회. 모든 권리 보유.",
    "캘리포니아 대학교는 이 소프트웨어 및 문서의 사용으로 발생한 직접적, 간접적, 특별, 우발적 또는 결과적 손해에 대해, 그러한 손해의 가능성을 사전에 통지받았더라도 어떠한 책임도 지지 않습니다.",
    "캘리포니아 대학교는 상품성 및 특정 목적에의 적합성에 대한 묵시적 보증을 포함한 모든 보증을 명시적으로 부인합니다. 소프트웨어는 '있는 그대로' 제공되며, 유지보수, 지원, 업데이트, 개선 또는 수정 의무가 없습니다.",
    "이 소프트웨어는 상품성, 특정 목적에의 적합성, 권리 비침해를 포함한 어떠한 명시적 또는 묵시적 보증도 없이 '있는 그대로' 제공됩니다. 저작자와 저작권자는 소프트웨어, 그 사용 또는 관련 거래로 인해 발생하는 계약, 불법행위 기타 사유에 따른 청구, 손해 또는 기타 책임을 지지 않습니다."
  ],
  "zh": [
    "本程序是自由软件。您可以按照自由软件基金会发布的 GNU 通用公共许可证第 2 版或您选择的任何后续版本的条款重新发布和修改本程序。",
    "本程序希望能发挥作用，但不提供任何担保，包括对适销性或特定用途适用性的默示担保。详情请参阅 GNU GPL。",
    "版权所有 © 1985–1991 加利福尼亚大学董事会。保留所有权利。",
    "对于使用本软件及其文档造成的任何直接、间接、特殊、偶发或后果性损害，即使加利福尼亚大学已获知此类损害的可能性，加利福尼亚大学亦不承担任何责任。",
    "加利福尼亚大学明确否认包括适销性和特定用途适用性默示担保在内的所有担保。本软件按“原样”提供，加利福尼亚大学没有提供维护、支持、更新、增强或修改的义务。",
    "本软件按“原样”提供，不附带任何明示或默示担保，包括适销性、特定用途适用性和不侵权担保。对于因本软件、其使用或其他交易引起的合同、侵权行为或其他法律依据下的任何索赔、损害或其他责任，作者和版权持有人概不负责。"
  ],
  "zh-tw": [
    "本程式是自由軟體。您可依自由軟體基金會發布的 GNU 通用公眾授權條款第 2 版或您選擇的任何後續版本，重新散布與修改本程式。",
    "本程式希望能有所助益，但不提供任何保證，包括對適銷性或特定用途適用性的默示保證。詳情請參閱 GNU GPL。",
    "著作權 © 1985–1991 加州大學董事會。保留所有權利。",
    "對於因使用本軟體及其文件而產生的任何直接、間接、特殊、附帶或衍生性損害，即使加州大學已獲告知可能發生該等損害，加州大學亦不負任何責任。",
    "加州大學明確否認所有保證，包括適銷性及特定用途適用性的默示保證。本軟體以「現狀」提供，加州大學無義務提供維護、支援、更新、改進或修改。",
    "本軟體以「現狀」提供，不附帶任何明示或默示保證，包括適銷性、特定用途適用性及不侵權保證。作者及著作權人對因本軟體、其使用或其他交易所生之契約、侵權或其他法律依據下的任何索賠、損害或其他責任，均不承擔責任。"
  ]
};
  const row=legal[lang];
  if(!row)return;
  const paragraphs=[...document.querySelectorAll("div > p")];
  const indices=[6,7,11,12,13,15];
  indices.forEach((index,i)=>{if(paragraphs[index])paragraphs[index].textContent=row[i]});
})();

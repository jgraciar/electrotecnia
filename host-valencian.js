"use strict";
(() => {
 // Traducciones de la interfaz del laboratorio, separadas de los enunciados y materiales docentes.
 const translations = {
  "Laboratorio virtual de Electrotecnia": "Laboratori virtual d'Electrotècnia",
  "Laboratorio virtual de Electrotecnia y Electrónica: generador, osciloscopio y análisis trifásico.": "Laboratori virtual d'Electrotècnia i Electrònica: generador, oscil·loscopi i anàlisi trifàsica.",
  "FORMACIÓN PROFESIONAL · ELECTROTECNIA Y ELECTRÓNICA": "FORMACIÓ PROFESSIONAL · ELECTROTÈCNIA I ELECTRÒNICA",
  "Laboratorio virtual": "Laboratori virtual",
  "Osciloscopio, generador de funciones y redes trifásicas. Todo desde tu navegador.": "Oscil·loscopi, generador de funcions i xarxes trifàsiques. Tot des del navegador.",
  "Versión 1.0 · Ejercicios y CircuitJS": "Versió 1.0 · Exercicis i CircuitJS",
  "Módulos": "Mòduls",
  "Generador": "Generador",
  "Trifásica": "Trifàsica",
  "Publicaciones": "Publicacions",
  "Generador de funciones": "Generador de funcions",
  "Señales matemáticas independientes del hardware": "Senyals matemàtics independents del maquinari",
  "Forma de onda": "Forma d'ona",
  "Senoidal": "Sinusoidal",
  "Cuadrada": "Quadrada",
  "Triangular": "Triangular",
  "Diente de sierra": "Dent de serra",
  "Pulsos": "Polsos",
  "Frecuencia · Hz": "Freqüència · Hz",
  "Amplitud pico · V": "Amplitud de pic · V",
  "Offset · V": "Component contínua · V",
  "Desfase CH2 · grados": "Desfasament CH2 · graus",
  "Ciclo de trabajo · %": "Cicle de treball · %",
  "Red trifásica equilibrada": "Xarxa trifàsica equilibrada",
  "Estrella, tensión fase/línea y carga RLC serie equilibrada": "Estrela, tensió de fase i de línia i càrrega RLC sèrie equilibrada",
  "Tensión línea-línea RMS · V": "Tensió entre línies RMS · V",
  "Secuencia de fases": "Seqüència de fases",
  "Directa · ABC": "Directa · ABC",
  "Inversa · ACB": "Inversa · ACB",
  "Resistencia por fase · Ω": "Resistència per fase · Ω",
  "Inductancia por fase · mH": "Inductància per fase · mH",
  "Capacitancia por fase · µF (0 = sin condensador)": "Capacitat per fase · µF (0 = sense condensador)",
  "Modelo teórico senoidal en régimen permanente. No incluye todavía desequilibrios, apertura de neutro ni transitorios.": "Model teòric sinusoidal en règim permanent. Encara no inclou desequilibris, obertura del neutre ni transitoris.",
  "Publicaciones y actividades": "Publicacions i activitats",
  "Catálogo bibliográfico con unidades, actividades identificadas y prácticas del laboratorio relacionadas.": "Catàleg bibliogràfic amb unitats, activitats identificades i pràctiques relacionades del laboratori.",
  "Publicación": "Publicació",
  "Unidad didáctica": "Unitat didàctica",
  "Tipo de actividad": "Tipus d'activitat",
  "Todos los tipos": "Tots els tipus",
  "Prácticas de laboratorio": "Pràctiques de laboratori",
  "Comprobación": "Comprovació",
  "Evaluación resuelta": "Avaluació resolta",
  "Actividades resueltas dentro de las unidades": "Activitats resoltes dins de les unitats",
  "Actividades propuestas": "Activitats proposades",
  "Ampliación": "Ampliació",
  "Actividades experimentales": "Activitats experimentals",
  "Buscar actividad": "Busca una activitat",
  "Ej. 16.12, osciloscopio, medida…": "P. ex., 16.12, oscil·loscopi, mesura…",
  "Se muestran únicamente las actividades originales del libro ya incorporadas. Los circuitos y las medidas se contrastarán en Falstad antes de su publicación definitiva. El resto de referencias permanece pendiente.": "Només es mostren les activitats originals del llibre que ja s'han incorporat. Els circuits i les mesures es contrastaran en Falstad abans de publicar-los definitivament. La resta de referències continua pendent.",
  "Prácticas guiadas · GM y GS · RA y CE": "Pràctiques guiades · GM i GS · RA i CE",
  "Selecciona un módulo y una práctica. Cada ficha muestra nivel, código, RA, CE y referencia al currículo oficial.": "Selecciona un mòdul i una pràctica. Cada fitxa mostra el nivell, el codi, els RA, els CE i la referència al currículum oficial.",
  "Módulo de FP": "Mòdul de FP",
  "Todos los módulos (GM y GS)": "Tots els mòduls (GM i GS)",
  "GRADO MEDIO (GM) · Instalaciones Eléctricas y Automáticas": "GRAU MITJÀ (GM) · Instal·lacions Elèctriques i Automàtiques",
  "GM · Electrotecnia (0234)": "GM · Electrotècnia (0234)",
  "GM · Electrónica (0233)": "GM · Electrònica (0233)",
  "GM · Instalaciones de distribución (0236)": "GM · Instal·lacions de distribució (0236)",
  "GM · Instalaciones solares fotovoltaicas (0239)": "GM · Instal·lacions solars fotovoltaiques (0239)",
  "GRADO SUPERIOR (GS) · Sistemas Electrotécnicos y Automatizados": "GRAU SUPERIOR (GS) · Sistemes Electrotècnics i Automatitzats",
  "GS · Sistemas y circuitos eléctricos (0520)": "GS · Sistemes i circuits elèctrics (0520)",
  "GS · Desarrollo de redes eléctricas y centros de transformación (0522)": "GS · Desenrotllament de xarxes elèctriques i centres de transformació (0522)",
  "Selecciona la práctica": "Selecciona la pràctica",
  "Cargar montaje en CircuitJS": "Carrega el muntatge en CircuitJS",
  "Reiniciar respuestas": "Reinicia les respostes",
  "Selecciona una práctica. La carga del circuito requiere CircuitJS integrado.": "Selecciona una pràctica. Per a carregar el circuit cal tindre CircuitJS integrat.",
  "CircuitJS y osciloscopio": "CircuitJS i oscil·loscopi",
  "Montaje de circuitos y adquisición virtual de tensiones y corrientes por componente.": "Muntatge de circuits i adquisició virtual de tensions i intensitats per component.",
  "Comprobando si CircuitJS está alojado en esta misma web…": "Comprovant si CircuitJS està allotjat en esta mateixa web…",
  "Componente del circuito": "Component del circuit",
  "Esperando conexión…": "Esperant la connexió…",
  "Magnitud visualizada": "Magnitud representada",
  "Tensión en el componente (V)": "Tensió en el component (V)",
  "Corriente en el componente (A)": "Intensitat en el component (A)",
  "Ventana de adquisición · ms": "Finestra d'adquisició · ms",
  "Abrir Falstad": "Obri Falstad",
  "Abrir circuito de Falstad o Wulflemm": "Obri un circuit de Falstad o Wulflemm",
  "Exportar XML conservado": "Exporta l'XML conservat",
  "Exportar circuito con RLC estándar": "Exporta el circuit amb RLC estàndard",
  "Elemento XML": "Element XML",
  "Selecciona un XML": "Selecciona un XML",
  "Atributo": "Atribut",
  "Valor": "Valor",
  "Nuevo valor": "Valor nou",
  "Modificar XML": "Modifica l'XML",
  "Admite circuitos XML de Wulflemm/CircuitJS y texto de Falstad (cabecera $), independientemente de su extensión. Se comprueba que no falten componentes.": "Admet circuits XML de Wulflemm/CircuitJS i text de Falstad (capçalera $), independentment de l'extensió. Es comprova que no falten components.",
  "Para ver ambos vatímetros y sus tres lecturas en pantallas estrechas, desliza horizontalmente el simulador.": "Per a veure els dos vatímetres i les tres lectures en pantalles estretes, desplaça el simulador horitzontalment.",
  "Simulador CircuitJS de Falstad": "Simulador CircuitJS de Falstad",
  "Las señales mostradas proceden del motor CircuitJS cuando está alojado en este mismo dominio. En modo externo solo se puede editar el circuito: el navegador impide leer sus señales por motivos de seguridad.": "Els senyals mostrats procedixen del motor CircuitJS quan està allotjat en este mateix domini. En mode extern només es pot editar el circuit: el navegador impedix llegir-ne els senyals per motius de seguretat.",
  "Osciloscopio virtual": "Oscil·loscopi virtual",
  "Canales sintéticos · no son mediciones físicas": "Canals sintètics · no són mesures físiques",
  "Representación": "Representació",
  "Tensiones de fase": "Tensions de fase",
  "Tensiones compuestas": "Tensions compostes",
  "Corrientes de fase": "Intensitats de fase",
  "Cursores: desactivados": "Cursors: desactivats",
  "Cursores: activados": "Cursors: activats",
  "Espectro y THD": "Espectre i THD",
  "Exportar CSV": "Exporta CSV",
  "Señales simuladas en función del tiempo": "Senyals simulats en funció del temps",
  "Análisis armónico de la primera señal": "Anàlisi harmònica del primer senyal",
  "Espectro armónico simulado": "Espectre harmònic simulat",
  "Se muestran los primeros 15 armónicos y la distorsión calculada a partir de las muestras.": "Es mostren els primers 15 harmònics i la distorsió calculada a partir de les mostres.",
  "Atención: los resultados son simulaciones matemáticas. No conectes redes de 230/400 V al Hantek 6022BE.": "Atenció: els resultats són simulacions matemàtiques. No connectes xarxes de 230/400 V al Hantek 6022BE.",
  "Proyecto didáctico · Código de esta aplicación GPL-3.0 ·": "Projecte didàctic · Codi d'esta aplicació GPL-3.0 ·",
  "Ver repositorio": "Consulta el repositori",
  "Código fuente de CircuitJS (GPL-2.0 o posterior)": "Codi font de CircuitJS (GPL-2.0 o posterior)",
  "Estado": "Estat",
  "Sin muestras": "Sense mostres",
  "Esperando adquisición": "Esperant l'adquisició",
  "Ventana": "Finestra",
  "Valor medio": "Valor mitjà",
  "Muestras": "Mostres",
  "Corriente del componente": "Intensitat del component",
  "Tensión del componente": "Tensió del component",
  "U fase RMS": "U de fase RMS",
  "U línea RMS": "U de línia RMS",
  "I fase RMS": "I de fase RMS",
  "|Z| por fase": "|Z| per fase",
  "Ángulo de carga": "Angle de càrrega",
  "Potencia activa P": "Potència activa P",
  "Potencia reactiva Q": "Potència reactiva Q",
  "Potencia aparente S": "Potència aparent S",
  "Factor de potencia": "Factor de potència",
  "Reactancia X": "Reactància X",
  "Secuencia": "Seqüència",
  "Frecuencia": "Freqüència",
  "Periodo": "Període",
  "V pico": "V de pic",
  "V RMS": "V RMS",
  "Desfase CH2": "Desfasament CH2",
  "Selecciona una señal para analizar.": "Selecciona un senyal per a analitzar.",
  "Espectro por armónicos de la ventana: la frecuencia fundamental real no está verificada; no se presenta THD.": "Espectre harmònic de la finestra: la freqüència fonamental real no està verificada; no es mostra la THD.",
  "red equilibrada": "xarxa equilibrada",
  "funciones virtuales": "funcions virtuals",
  "Dos periodos": "Dos períodes",
  "Señal de CircuitJS": "Senyal de CircuitJS",
  "valores simulados": "valors simulats",
  "Resultados de aprendizaje y criterios de evaluación vinculados": "Resultats d'aprenentatge i criteris d'avaluació vinculats",
  "RESULTADO DE APRENDIZAJE": "RESULTAT D'APRENENTATGE",
  "Criterios de evaluación (CE) relacionados con esta práctica": "Criteris d'avaluació (CE) relacionats amb esta pràctica",
  "Correspondencia curricular parcial: la práctica aporta evidencias relacionadas con estos CE, pero no acredita automáticamente su cumplimiento completo.": "Correspondència curricular parcial: la pràctica aporta evidències relacionades amb estos CE, però no acredita automàticament el seu compliment complet.",
  "Consultar el currículo oficial (BOE) ↗": "Consulta el currículum oficial (BOE) ↗",
  "Objetivos": "Objectius",
  "Trabajo propuesto": "Treball proposat",
  "Hoja de cálculo y comprobación": "Full de càlcul i comprovació",
  "Escribe el valor calculado": "Escriu el valor calculat",
  "Comprobar respuestas": "Comprova les respostes",
  "Ver desarrollo matemático": "Mostra el desenrotllament matemàtic",
  "Ocultar desarrollo": "Amaga el desenrotllament",
  "Guardar informe TXT": "Guarda l'informe TXT",
  "Modelo equivalente de Falstad": "Model equivalent de Falstad",
  "Introduce un número en la unidad indicada.": "Introduïx un nombre en la unitat indicada.",
  "Correcto.": "Correcte.",
  "Correcto": "Correcte",
  "Revisa el resultado y sus unidades.": "Revisa el resultat i les unitats.",
  "Informe generado en tu navegador; no se han enviado respuestas a ningún servidor.": "Informe generat en el navegador; les respostes no s'han enviat a cap servidor.",
  "Esta práctica es teórica: realiza los cálculos y utiliza la autocorrección sin CircuitJS.": "Esta pràctica és teòrica: fes els càlculs i utilitza l'autocorrecció sense CircuitJS.",
  "Todavía no se ha inicializado la integración con CircuitJS.": "Encara no s'ha inicialitzat la integració amb CircuitJS.",
  "La autocorrección se refiere al circuito original, no a valores que hayas modificado.": "L'autocorrecció es referix al circuit original, no als valors que hages modificat.",
  "La autocorrección se refiere a los datos del supuesto teórico indicado en la ficha.": "L'autocorrecció es referix a les dades del supòsit teòric indicat en la fitxa.",
  "Abrir actividad original y circuito": "Obri l'activitat original i el circuit",
  "Actividades originales del libro": "Activitats originals del llibre",
  "No hay referencias que coincidan con estos filtros.": "No hi ha referències que coincidisquen amb estos filtres.",
  "No se pudo abrir la práctica: accede desde la pestaña «Prácticas guiadas».": "No s'ha pogut obrir la pràctica: accedix des de la pestanya «Pràctiques guiades».",
  "Autor:": "Autor:",
  "Editorial:": "Editorial:",
  "Edición:": "Edició:",
  "ISBN:": "ISBN:",
  "Nivel y ciclo:": "Nivell i cicle:",
  "Módulo:": "Mòdul:",
  "Inicio:": "Inici:",
  "Únicamente se muestran actividades originales del libro. Los ejercicios parametrizados y las prácticas similares no se ofrecen en esta sección.": "Només es mostren activitats originals del llibre. En esta secció no s'oferixen exercicis parametritzats ni pràctiques semblants.",
  "Sin CE directamente acreditable": "Sense CE acreditable directament",
  "Revisión curricular:": "Revisió curricular:",
  "Enunciado original del libro": "Enunciat original del llibre",
  "Circuito para verificar el enunciado en Falstad": "Circuit per a verificar l'enunciat en Falstad",
  "Contador virtual de energía": "Comptador virtual d'energia",
  "Procedimiento": "Procediment",
  "Cálculos del ejercicio original": "Càlculs de l'exercici original",
  "Resultado numérico": "Resultat numèric",
  "Mostrar desarrollo y soluciones": "Mostra el desenrotllament i les solucions",
  "Ocultar soluciones": "Amaga les solucions",
  "Comparar lecturas reales de Falstad": "Compara les lectures reals de Falstad",
  "Descargar informe TXT": "Descarrega l'informe TXT",
  "Cerrar ejercicio": "Tanca l'exercici",
  "Sin comparación instrumental de Falstad.": "Sense comparació instrumental de Falstad.",
  "Falstad aún no ha adquirido las lecturas de este ejercicio.": "Falstad encara no ha adquirit les lectures d'este exercici.",
  "Contraste instrumental satisfactorio para esta ejecución (tolerancia 0,5 %; t ≥ 2 ms).": "Contrast instrumental satisfactori per a esta execució (tolerància 0,5 %; t ≥ 2 ms).",
  "Resultado pendiente: revisa conexión, estabilización y lecturas en Falstad.": "Resultat pendent: revisa la connexió, l'estabilització i les lectures en Falstad.",
  "No se crea un circuito con tensiones o impedancias inventadas.": "No es crea cap circuit amb tensions o impedàncies inventades.",
  "Introduce un número válido.": "Introduïx un nombre vàlid.",
  "Revisa el cálculo y las unidades.": "Revisa el càlcul i les unitats.",
  "Sin observaciones adicionales": "Sense observacions addicionals",
  "Sin vinculación específica verificada": "Sense vinculació específica verificada",
  "sin asignación específica": "sense assignació específica",
  "No hay componentes de dos terminales": "No hi ha components de dos terminals",
  "Cargando práctica…": "Carregant la pràctica…",
  "CircuitJS conectado; añade un componente medible al circuito.": "CircuitJS connectat; afig un component mesurable al circuit.",
  "CircuitJS conectado: selecciona un componente y observa su tensión o corriente en el osciloscopio.": "CircuitJS connectat: selecciona un component i observa'n la tensió o la intensitat en l'oscil·loscopi.",
  "No se pudo importar el circuito.": "No s'ha pogut importar el circuit.",
  "Archivo demasiado grande (máximo 10 MB).": "Fitxer massa gran (màxim 10 MB).",
  "No se pudo leer el XML.": "No s'ha pogut llegir l'XML.",
  "No se pudo modificar el atributo.": "No s'ha pogut modificar l'atribut.",
  "No se puede exportar el circuito.": "No es pot exportar el circuit.",
  "No hay XML para exportar.": "No hi ha cap XML per a exportar.",
  "XML exportado desde el estado actual del simulador.": "XML exportat des de l'estat actual del simulador.",
  "No se ha detectado la copia local de Falstad. Comprueba la publicación de GitHub Pages y sus archivos de CircuitJS.": "No s'ha detectat la còpia local de Falstad. Comprova la publicació de GitHub Pages i els fitxers de CircuitJS.",
  "CircuitJS integrado aún no está disponible.": "CircuitJS integrat encara no està disponible.",
  "Plantilla no autorizada.": "Plantilla no autoritzada.",
  "La copia integrada de CircuitJS aún no está disponible.": "La còpia integrada de CircuitJS encara no està disponible.",
  "Identificador de ejercicio no válido.": "Identificador d'exercici no vàlid.",
  "Formato de circuito no válido.": "Format de circuit no vàlid.",
  "CircuitJS integrado no está disponible.": "CircuitJS integrat no està disponible."
};
 const dynamicRules = [
  [/^Señal de CircuitJS · ventana ([\d.,]+ ms) · valores simulados$/,(_,time)=>"Senyal de CircuitJS · finestra "+time+" · valors simulats"],
  [/^Dos periodos · ([\d.,]+ Hz) · (red equilibrada|funciones virtuales)$/,(_,f,mode)=>"Dos períodes · "+f+" · "+translations[mode]],
  [/^Fundamental: (.*) Hz · H1 \(pico\): (.*) · THD aproximada \(H2–H15\): (.*) %$/,(_,f,h,thd)=>"Fonamental: "+f+" Hz · H1 (pic): "+h+" · THD aproximada (H2–H15): "+thd+" %"],
  [/^(\d+) actividades originales disponibles en esta unidad\. El resto solo se incorporará tras resolver y contrastar los ejercicios\.$/,(_,n)=>n+" activitats originals disponibles en esta unitat. La resta només s'incorporarà després de resoldre i contrastar els exercicis."],
  [/^Mostrar más referencias \((\d+) restantes\)$/,(_,n)=>"Mostra més referències ("+n+" restants)"],
  [/^Práctica (.+) preparada\. Pulsa «Cargar montaje en CircuitJS»\.$/,(_,id)=>"Pràctica "+id+" preparada. Prem «Carrega el muntatge en CircuitJS»."],
  [/^Práctica (.+) de cálculo y análisis preparada\. Completa los ejercicios y comprueba tus respuestas; no necesita simulador externo\.$/,(_,id)=>"Pràctica "+id+" de càlcul i anàlisi preparada. Completa els exercicis i comprova les respostes; no necessita simulador extern."],
  [/^Montaje de (.+) cargado correctamente\. Ya puedes modificar componentes y medir sus señales\.$/,(_,id)=>"Muntatge de "+id+" carregat correctament. Ja pots modificar components i mesurar-ne els senyals."],
  [/^Resultado: (\d+) de (\d+) respuestas correctas \(intento (\d+)\)\.$/,(_,a,b,c)=>"Resultat: "+a+" de "+b+" respostes correctes (intent "+c+")."],
  [/^Autocorrección: (\d+)\/(\d+) respuestas correctas · (\d+) intento\(s\)\. Solo se evalúan los datos iniciales\.$/,(_,a,b,c)=>"Autocorrecció: "+a+"/"+b+" respostes correctes · "+c+" intents. Només s'avaluen les dades inicials."],
  [/^Circuito cargado y comprobado: (.*)\.$/,(_,name)=>"Circuit carregat i comprovat: "+name+"."],
  [/^Archivo recibido, pendiente de inicialización de CircuitJS: (.*)$/,(_,name)=>"Fitxer rebut, pendent d'inicialitzar CircuitJS: "+name],
  [/^Cargando (.*) en CircuitJS…$/,(_,name)=>"Carregant "+name+" en CircuitJS…"],
  [/^Error al leer el archivo: (.*)$/,(_,err)=>"Error en llegir el fitxer: "+err],
  [/^Error al consultar los componentes: (.*)$/,(_,err)=>"Error en consultar els components: "+err],
  [/^Error al preparar el ejercicio: (.*)$/,(_,err)=>"Error en preparar l'exercici: "+err],
  [/^XML compatible exportado: (\d+) impedancia\(s\) Z convertida\(s\) en componentes R, L y C estándar\.$/,(_,n)=>"XML compatible exportat: "+n+" impedàncies Z convertides en components R, L i C estàndard."]
 ];
 const locale = () => document.documentElement.lang.toLowerCase()==="ca-es-valencia";
 const t = input => {
  if(typeof input!=="string"||!locale())return input;
  const direct=translations[input];
  if(direct!==undefined)return direct;
  for(const [re,fn] of dynamicRules)if(re.test(input))return input.replace(re,(...args)=>fn(...args));
  return input;
 };
 function textNode(node){
  if(!node?.nodeValue||!node.nodeValue.trim())return;
  const raw=node.nodeValue;
  const prefix=raw.match(/^\s*/)?.[0]||"",suffix=raw.match(/\s*$/)?.[0]||"";
  const middle=raw.slice(prefix.length,raw.length-suffix.length);
  const result=t(middle);
  if(result!==middle)node.nodeValue=prefix+result+suffix;
 }
 function apply(root){
  if(!locale()||!root)return;
  if(root.nodeType===Node.TEXT_NODE){textNode(root);return;}
  if(!root.querySelectorAll)return;
  if(root.nodeType===Node.ELEMENT_NODE) {
   for(const attribute of ["placeholder","title","aria-label","label"]){
    if(root.hasAttribute(attribute)){const old=root.getAttribute(attribute),next=t(old);if(old!==next)root.setAttribute(attribute,next);}
   }
  }
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  let node;
  while((node=walker.nextNode())){
   if(node.parentElement?.closest(".practice-statement,.practice-description,.practice-steps,.practice-ce-summary,.practice-note,.publication-numbered-item p,.publication-header h3"))continue;
   textNode(node);
  }
  for(const el of root.querySelectorAll("[placeholder],[title],[aria-label],optgroup[label]")){
   for(const attribute of ["placeholder","title","aria-label","label"]){
    if(el.hasAttribute(attribute)){const old=el.getAttribute(attribute),next=t(old);if(old!==next)el.setAttribute(attribute,next);}
   }
  }
 }
 // Los ejercicios y enunciados originales se conservan sin alterar.
 const staticParts=[
  ".header",".tabs","#generator-controls","#threephase-controls",
  "#publications-controls","#practices-controls","#falstad-controls","#scope-panel","footer"
 ];
 const dynamicParts=[
  "#scope-subtitle","#spectrumInfo","#cursorsToggle","#bridge-status",
  "#practiceStatus","#wulflemmXmlStatus","#elementSelect","#publicationActivityCount",
  "#textbookScore","#practiceSummary","#metrics"
 ];
 const dynamicUiSelectors=[
  "button",".practice-subtitle",".practice-curriculum-title",".practice-ce-label",
  ".practice-source",".practice-feedback",".practice-summary",".practice-curriculum-limit",
  ".publication-field strong",".publication-note",".publication-unit-content h5",
  ".publication-muted","input[placeholder]"
 ].join(",");
 function applyAcademicUI(container){
  if(!container||!locale())return;
  for(const el of container.querySelectorAll(dynamicUiSelectors))apply(el);
 }
 function start(){
  if(!locale())return;
  document.title=t(document.title);
  const meta=document.querySelector('meta[name="description"]');
  if(meta)meta.content=t(meta.content);
  for(const selector of staticParts){const el=document.querySelector(selector);if(el)apply(el);}
  // Las fichas académicas se observan solo en sus controles y rótulos.
  const refs=dynamicParts.map(x=>document.querySelector(x)).filter(Boolean);
  const academic=["#practiceContent","#publicationContent","#textbookExercisePanel"].map(x=>document.querySelector(x)).filter(Boolean);
  for(const el of academic)applyAcademicUI(el);
  const observer=new MutationObserver(()=>{
   for(const el of refs)apply(el);
   for(const el of academic)applyAcademicUI(el);
  });
  for(const el of refs)observer.observe(el,{childList:true,subtree:true,characterData:true});
  for(const el of academic)observer.observe(el,{childList:true,subtree:true,characterData:true});
 }
 window.LabHostI18n=Object.freeze({t,apply});
 if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();

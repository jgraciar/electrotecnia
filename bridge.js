"use strict";
// Puente CircuitJS -> instrumentación virtual.
// Solo lee muestras si CircuitJS está alojado en el mismo origen.
// API pública documentada: github.com/pfalstad/circuitjs1/blob/master/war/jsinterface.html
(() => {
  const frame=document.getElementById("circuit-frame");
  const status=document.getElementById("bridge-status");
  const selector=document.getElementById("elementSelect");
  const windowInput=document.getElementById("sampleWindow");
  const quantity=document.getElementById("elementQuantity");
  const scope=window.LabScope;
  if(!frame || !selector || !scope)return;
  const defaultCircuit=new URL("./circuitjs/circuitjs.html",location.href).href;
  let sim=null,eligible=[],record=[],lastSample=-Infinity,lastPaint=0;
  let localAvailable=false;
  let selectedExample=null;
  let pendingModel=null;
  let lastImportDiagnostic=null;
  let measuredWattmeter=null, wattSamples=[];
  let wattmeters=[];
  const WATT_WINDOW_S=0.1;
  function wattPowerInstant(element){
    if(!element || element.getPostCount()<4)return NaN;
    if(element.getType()==="WattmeterElm")return element.getVoltageDiff()*element.getCurrent();
    if(typeof element.getVoltage!=="function")return NaN;
    // WattmeterTrueElm: bobina voltimétrica en 0-1; bobina amperimétrica en 2-3.
    // El motor define getVoltageDiff() como V1-V0 y getCurrent() como corriente de la bobina.
    const voltage=element.getVoltageDiff();
    const current=element.getCurrent();
    return Number.isFinite(voltage) && Number.isFinite(current) ? voltage*current : NaN;
  }
  function captureWattmeter(t){
    if(!measuredWattmeter || !Number.isFinite(t))return;
    if(wattSamples.length && t<=wattSamples[wattSamples.length-1].t){
      if(t<wattSamples[wattSamples.length-1].t)wattSamples=[];
      else return;
    }
    const power=wattPowerInstant(measuredWattmeter);
    if(!Number.isFinite(power))return;
    wattSamples.push({t,power});
    const cutoff=t-WATT_WINDOW_S;
    while(wattSamples.length>2 && wattSamples[1].t<cutoff)wattSamples.shift();
  }
  function wattPowerAverage(samples=wattSamples){
    if(samples.length<2)return NaN;
    const last=samples[samples.length-1],start=last.t-WATT_WINDOW_S;
    if(samples[0].t>start){
      // En CC estable no es necesario esperar los 100 ms reservados para CA.
      // Solo se adelanta la lectura cuando TODAS las muestras coinciden.
      // Una señal variable sigue exigiendo la ventana de integración completa.
      if(last.t-samples[0].t<0.02)return NaN;
      const reference=samples[0].power;
      const tolerance=Math.max(1e-9,Math.abs(reference)*1e-8);
      return samples.every(s=>Math.abs(s.power-reference)<=tolerance)
        ? reference : NaN;
    }
    let area=0;
    for(let i=1;i<samples.length;i++){
      const a=samples[i-1],b=samples[i];
      if(b.t<=start)continue;
      const t0=Math.max(a.t,start),frac=(t0-a.t)/(b.t-a.t);
      const p0=a.power+(b.power-a.power)*frac;
      area+=(p0+b.power)*(b.t-t0)/2;
    }
    return area/WATT_WINDOW_S;
  }
  const windowSeconds=()=>Math.max(.001,Math.min(10,Number(windowInput.value)||.1));
  function message(text){status.textContent=text;}
  function clear(){
    record=[];lastSample=-Infinity;lastPaint=0;
    wattSamples=[];
    wattmeters.forEach(m=>m.samples=[]);
    scope.clearCircuit();
  }
  function updateSelection(){
    clear();
    if(!sim)return;
    let elements=[];
    try{elements=Array.from(sim.getElements()||[]);}catch(err){message("Error al consultar los componentes: "+err.message);return;}
    wattmeters=elements.filter(el=>{try{return ["WattmeterTrueElm","WattmeterElm"].includes(el.getType());}catch(_){return false;}}).map(element=>({element,samples:[]}));
    measuredWattmeter=wattmeters[0]?.element || null;
    wattSamples=[];
    eligible=elements.filter(el=>{
      try{return el.getPostCount()>=2 && typeof el.getVoltageDiff==="function" &&
        typeof el.getCurrent==="function" && el.getType()!=="WireElm";}
      catch(_){return false;}
    });
    const oldIndex=Number(selector.value);
    selector.replaceChildren();
    if(eligible.length===0){
      const option=document.createElement("option");
      option.value="";option.textContent="No hay componentes de dos terminales";
      selector.append(option);selector.disabled=true;
      message("CircuitJS conectado; añade un componente medible al circuito.");
      return;
    }
    eligible.forEach((element,index)=>{
      const option=document.createElement("option");
      option.value=String(index);
      option.textContent=(index+1)+". "+element.getType().replace(/Elm$/,"");
      selector.append(option);
    });
    selector.disabled=false;
    selector.value=String(Number.isInteger(oldIndex)&&oldIndex>=0&&oldIndex<eligible.length?oldIndex:0);
    message("CircuitJS conectado: selecciona un componente y observa su tensión o corriente en el osciloscopio.");
  }
  function capture(){
    if(!sim)return;
    let t;
    try{t=sim.getTime();}catch(_){return;}
    if(!Number.isFinite(t))return;
    captureWattmeter(t);
    for(const meter of wattmeters){
      if(meter.element===measuredWattmeter)continue;
      const p=wattPowerInstant(meter.element);
      if(!Number.isFinite(p))continue;
      const samples=meter.samples;
      if(samples.length && t<=samples[samples.length-1].t){
        if(t<samples[samples.length-1].t)samples.length=0;
        else continue;
      }
      samples.push({t,power:p});
      while(samples.length>2 && samples[1].t<t-WATT_WINDOW_S)samples.shift();
    }
    if(selector.disabled)return;
    if(t<lastSample)clear();
    const step=Math.max(.000002,windowSeconds()/1200);
    if(t-lastSample<step)return;
    let element=eligible[Number(selector.value)];
    if(!element)return;
    let v,i;
    try{v=element.getVoltageDiff();i=element.getCurrent();}catch(_){return;}
    if(!Number.isFinite(v) || !Number.isFinite(i))return;
    record.push({t,v,i});
    lastSample=t;
    if(record.length>5000)record.splice(0,600);
    const oldest=t-Math.max(windowSeconds()*1.5,.08);
    if(record.length>1800 && record[0].t<oldest){
      let cut=0;while(cut<record.length-1600 && record[cut].t<oldest)cut++;
      if(cut>0)record.splice(0,cut);
    }
  }
  function update(){
    if(!sim || record.length<2)return;
    const stamp=performance.now();
    if(stamp-lastPaint<150)return;
    lastPaint=stamp;
    scope.setCircuitRecords(record);
  }
  function attach(instance){
    if(!instance || sim===instance || typeof instance.getElements!=="function" ||
       typeof instance.importCircuit!=="function")return;
    sim=instance;
    sim.ontimestep=capture;
    sim.onupdate=update;
    sim.onanalyze=updateSelection;
    updateSelection();
    message("CircuitJS conectado. Los datos se obtienen del simulador, no del hardware.");
    if(pendingModel){
      const model=pendingModel;pendingModel=null;
      // CircuitJS puede restaurar su circuito de demostración después del callback
      // inicial. Esperar a que termine su arranque antes de importar el XML.
      setTimeout(()=>{
        if(sim===instance && selectedExample===null)
          importModel(model.filename,model.dump);
      },1200);
    }else{
      document.dispatchEvent(new CustomEvent("lab:circuit-ready",{detail:{example:selectedExample}}));
    }
  }
  const examples=new Set([
    "ohms.txt","voltdivide.txt","capac.txt","fullrect.txt","3phasewye.txt","xor.txt",
    "inductac.txt","lrc.txt","transformer.txt","amp-noninvert.txt"
  ]);
  // Navegar a una plantilla del catálogo incluido en CircuitJS reinicia
  // la simulación y los datos medidos; no altera otros circuitos guardados.
  // Reconoce los archivos originales sin confundir XML con texto CircuitJS.
  // Tras importar, comprueba el inventario de elementos: el deserializador
  // XML upstream puede ignorar etiquetas desconocidas sin lanzar un error.
  function inspectCircuitFile(raw){
    if(typeof raw!=="string")throw Error("El archivo no contiene texto CircuitJS.");
    const dump=raw.replace(/^\uFEFF/,"").trimStart();
    const xmlHeader=dump.replace(/^<\?xml\s+[^>]*\?>\s*/i,"");
    if(/^<cir(?:\s|>)/.test(xmlHeader)){
      const doc=new DOMParser().parseFromString(dump,"application/xml");
      if(doc.querySelector("parsererror")||doc.documentElement?.tagName!=="cir")
        throw Error("El archivo XML está mal formado o no es CircuitJS.");
      // Tipos que maneja aparte el propio CircuitXMLDeserializer; nunca
      // se cuentan como componentes eléctricos de cuatro coordenadas.
      const metadata=new Set(["o","dm","rlm","tm","mm","clm","ccm","h",
        "adj","test","switchevent","scopedata"]);
      let count=0;
      for(const el of doc.documentElement.children){
        if(metadata.has(el.tagName))continue;
        const coords=el.getAttribute("x");
        if(coords===null)
          throw Error("Etiqueta XML no reconocida sin posición: "+el.tagName+
            ". No se puede asegurar que se importe íntegramente.");
        if(!/^-?\d+(?:\s+-?\d+){3}$/.test(coords.trim()))
          throw Error("Coordenadas eléctricas inválidas en "+el.tagName+": "+coords);
        count++;
      }
      return {dump,format:"circuitjs-xml",elements:count};
    }
    if(/^\$\s+/.test(dump)){
      let count=0;
      const metadata=new Set(["o","h","$","!","%","?","B",".","&",'"']);
      for(const line of dump.split(/\r?\n|\r/)){
        const value=line.trim();
        if(!value)continue;
        const fields=value.split(/\s+/);
        if(metadata.has(fields[0].charAt(0)) || ["32","34","38"].includes(fields[0]))continue;
        if(fields.length<6 || fields.slice(1,6).some(n=>!/^[-]?\d+$/.test(n)))
          throw Error("Línea de componente no reconocida en texto Falstad: "+value.slice(0,90));
        count++;
      }
      return {dump,format:"circuitjs-text",elements:count};
    }
    throw Error("Formato no reconocido. Se admiten XML de CircuitJS/Wulflemm y archivos TXT de Falstad con cabecera $.");
  }
  function importModel(filename,raw){
    let info;
    try{info=inspectCircuitFile(raw);}
    catch(error){
      lastImportDiagnostic={ok:false,filename,format:null,message:error.message};
      message(error.message);
      return {ok:false,message:error.message};
    }
    if(!sim){
      pendingModel={filename,dump:info.dump};
      lastImportDiagnostic={ok:false,pending:true,filename,format:info.format};
      message("CircuitJS está inicializando; el archivo se cargará al terminar.");
      return {ok:true,pending:true,simulated:false,format:info.format};
    }
    if(typeof sim.exportCircuit!=="function" || typeof sim.getElements!=="function")
      return {ok:false,message:"El motor integrado no permite verificar la importación."};
    let backup;
    const previousExample=selectedExample;
    try{backup=sim.exportCircuit();}
    catch(error){return {ok:false,message:"No se puede proteger el circuito anterior: "+error.message};}
    try{
      sim.importCircuit(info.dump,false);
      const actual=Array.from(sim.getElements()||[]).length;
      if(actual!==info.elements)
        throw Error("Circuito incompleto: se esperaban "+info.elements+
          " elementos y CircuitJS solo ha reconocido "+actual+
          ". Puede contener componentes no admitidos por esta versión.");
      clear();
      selectedExample=filename;
      updateSelection();
      lastImportDiagnostic={ok:true,filename,format:info.format,expected:info.elements,recognized:actual};
      message("Circuito importado: "+filename+". "+actual+" elementos reconocidos.");
      document.dispatchEvent(new CustomEvent("lab:circuit-ready",{detail:{example:filename}}));
      return {ok:true,format:info.format,simulated:true,elements:actual};
    }catch(error){
      let restored=false;
      try{sim.importCircuit(backup,false);selectedExample=previousExample;updateSelection();restored=true;}
      catch(recovery){message("Error al restaurar el circuito previo: "+recovery.message);}
      const warning="No se ha podido abrir el circuito completo: "+error.message+
        (restored?" Se ha restaurado el circuito anterior.":"");
      lastImportDiagnostic={ok:false,filename,format:info.format,message:warning,restored};
      document.dispatchEvent(new CustomEvent("lab:circuit-import-error",{detail:{example:filename,message:warning}}));
      message(warning);
      return {ok:false,message:warning};
    }
  }
  function loadExample(filename){
    if(!localAvailable)return {ok:false,message:"CircuitJS integrado aún no está disponible."};
    const dump=window.LabCircuitModels?.[filename];
    if(typeof dump==="string" && dump.startsWith("$ "))return importModel(filename,dump);
    if(!examples.has(filename))return {ok:false,message:"Plantilla no autorizada."};
    if(!localAvailable)return {ok:false,message:"La copia integrada de CircuitJS aún no está disponible."};
    clear();sim=null;pendingModel=null;eligible=[];selector.disabled=true;
    measuredWattmeter=null;wattmeters=[];
    selector.replaceChildren();
    const option=document.createElement("option");
    option.value="";option.textContent="Cargando práctica…";selector.append(option);
    selectedExample=filename;
    const address=new URL("./circuitjs/circuitjs.html",location.href);
    address.searchParams.set("startCircuit",filename);
    frame.src=address.href;
    message("Cargando "+filename+" en CircuitJS…");
    return {ok:true};
  }
  function loadExerciseCircuit(id,dump){
    if(!localAvailable)return {ok:false,message:"CircuitJS integrado no está disponible."};
    if(!/^PN-\d{1,2}-(?:resuelta|practica|comprobacion|evaluacion|propuesta|ampliacion|experimental)-\d{1,3}$/.test(id)){
      return {ok:false,message:"Identificador de ejercicio no válido."};
    }
    if(typeof dump!=="string" || dump.length>30000 || !dump.startsWith("$ ") ||
       !dump.split("\n").slice(1).every(line=>line==="" || /^(?:v|r|l|c|w|g|T|x|p|370|420) /.test(line))){
      return {ok:false,message:"Formato de circuito no válido."};
    }
    return importModel(id,dump);
  }
  // Lectura en vivo de instrumentos nativos de CircuitJS. No implica
  // validación de resultados hasta disponer de suficientes pasos de simulación.
  function getInstrumentReadings(){
    if(!sim || !selectedExample || !/^PN-/.test(selectedExample))return null;
    let elements,time;
    try{elements=Array.from(sim.getElements()||[]);time=sim.getTime();}catch(_){return null;}
    if(!Number.isFinite(time))return null;
    const get=type=>elements.find(el=>{try{return el.getType()===type;}catch(_){return false;}});
    const probes=elements.filter(el=>{try{return el.getType()==="ProbeElm";}catch(_){return false;}});
    const ammeter=get("AmmeterElm"),voltmeter=probes[0],
      wattmeter=get("WattmeterTrueElm") || get("WattmeterElm");
    let current=NaN,voltage=NaN,power=NaN;
    try{if(ammeter)current=ammeter.getCurrent();}catch(_){}
    try{if(voltmeter)voltage=voltmeter.getVoltageDiff();}catch(_){}
    // Potencia activa media; NaN si no hay cuatro bornes o faltan muestras.
    if(wattmeter && wattmeter===measuredWattmeter)power=wattPowerAverage();
    const wattmeterPowers=wattmeters.map((m,i)=>({index:i+1,power:wattPowerAverage(m.element===measuredWattmeter?wattSamples:m.samples)}));
    const totalWattmeterPower=wattmeterPowers.length>0 && wattmeterPowers.every(m=>Number.isFinite(m.power))
      ? wattmeterPowers.reduce((sum,m)=>sum+m.power,0):NaN;
    const probeVoltages=probes.map((el,index)=>{let value=NaN;try{value=el.getVoltageDiff();}catch(_){}return {index,value};});
    const resistorReadings=elements.filter(el=>{try{return el.getType()==="ResistorElm";}catch(_){return false;}}).map((el,index)=>{let voltage=NaN,current=NaN;try{voltage=el.getVoltageDiff();current=el.getCurrent();}catch(_){}return {index:index+1,voltage,current,power:Math.abs(voltage*current)};});
    return {id:selectedExample,time,current,voltage,probeVoltages,resistorReadings,power,wattmeterPowers,totalWattmeterPower,
      hasAmmeter:!!ammeter,hasVoltmeter:!!voltmeter,hasWattmeter:!!wattmeter};
  }
  // Lectura independiente de los dos vatímetros del método Aron.
  // Los valores son NaN hasta completar la ventana de integración.
  function getAronReadings(){
    if(!sim || wattmeters.length!==2)return null;
    const readings=wattmeters.map(m=>wattPowerAverage(m.element===measuredWattmeter?wattSamples:m.samples));
    const valid=readings.every(Number.isFinite);
    return {w1:readings[0],w2:readings[1],total:valid?readings[0]+readings[1]:NaN,valid};
  }
  // Intercambio bidireccional del formato textual nativo de CircuitJS.
  // No se presenta como XML de wulflemm: son formatos diferentes.
  function exportNativeCircuit(){
    if(!sim || typeof sim.exportCircuit!=="function")
      return {ok:false,message:"CircuitJS no está inicializado o no expone exportCircuit."};
    try{
      const dump=sim.exportCircuit();
      if(typeof dump!=="string" || !(dump.trimStart().startsWith("$ ") || /^<cir(?:\s|>)/.test(dump.trimStart())))
        return {ok:false,message:"El simulador devolvió un formato de exportación inesperado."};
      return {ok:true,format:dump.trimStart().startsWith("$ ")?"circuitjs-text":"circuitjs-xml",dump};
    }catch(error){
      return {ok:false,message:"Error al exportar: "+error.message};
    }
  }
  // Exportación explícita sin pérdida silenciosa: la impedancia Z local se
  // descompone en elementos estándar R/L/C que admiten Falstad y Wulflemm.
  function exportStandardRLC(){
    const live=exportNativeCircuit();
    if(!live.ok)return live;
    if(live.format!=="circuitjs-xml")
      return {ok:false,message:"La conversión RLC requiere el XML actual del circuito."};
    if(!window.LabImpedanceExport?.convert)
      return {ok:false,message:"No está cargado el exportador de impedancias CA."};
    try {
      const result=window.LabImpedanceExport.convert(live.dump);
      return {ok:true,...result,format:"circuitjs-xml",simulated:true};
    }catch(error){
      return {ok:false,message:"No se ha exportado el circuito: "+error.message};
    }
  }

  function importNativeCircuit(filename,dump){
    return importModel(filename,dump);
  }
  // Intercambio XML sin pérdida. No modifica el motor hasta que exista
  // soporte de importación y exportación eléctrica compatible.
  let wulflemmDocument=null;
  function importWulflemmXml(xml){
    if(!window.WulflemmXml)return {ok:false,message:"El módulo XML no está cargado."};
    try{
      const nodes=window.WulflemmXml.parse(xml);
      const meters=nodes.filter(n=>n.name==="WattmeterTrue");
      // El motor debe reconocer todos los componentes del documento externo.
      // No se comunica éxito si ha descartado etiquetas que no conoce.
      const loaded=importModel("Wulflemm-XML",xml);
      if(!loaded.ok)return loaded;
      wulflemmDocument={xml,nodes};
      return {...loaded,format:"wulflemm-xml",wattmeters:meters.length,
        message:loaded.pending?"Archivo recibido; esperando al motor CircuitJS.":"Archivo XML importado y componentes comprobados."};
    }catch(error){return {ok:false,message:error.message};}
  }
  function getWulflemmComponents(){
    return wulflemmDocument?window.WulflemmXml.getComponents(wulflemmDocument.nodes):[];
  }
  function updateWulflemmAttribute(index,key,value){
    if(!wulflemmDocument)return {ok:false,message:"No hay documento XML cargado."};
    try{
      // Validar índice, nombre y valor antes de tocar la simulación.
      window.WulflemmXml.updateAttribute(wulflemmDocument.nodes,index,key,value);
      const selected=wulflemmDocument.nodes[index];
      if(!selected || selected.depth!==1 || !selected.attrs.x)
        throw Error("Selecciona un componente eléctrico del circuito.");
      // Usar el XML vivo, no la copia importada: el usuario puede haber hecho
      // cambios adicionales desde el editor gráfico.
      const live=exportNativeCircuit();
      if(!live.ok)throw Error(live.message);
      if(live.format!=="circuitjs-xml")
        throw Error("La edición XML solo está disponible con un circuito XML abierto.");
      const doc=new DOMParser().parseFromString(live.dump,"application/xml");
      if(doc.querySelector("parsererror")||doc.documentElement?.tagName!=="cir")
        throw Error("El motor no devuelve un documento XML válido.");
      const matches=Array.from(doc.documentElement.children).filter(el=>
        el.tagName===selected.name && el.getAttribute("x")===selected.attrs.x);
      if(matches.length!==1)
        throw Error("El componente original se ha movido o no se identifica de forma única. Vuelve a importar el archivo antes de editarlo.");
      const requested=String(value);
      const previous=matches[0].getAttribute(key);
      if(previous!==null && previous.trim()!=="" && Number.isFinite(Number(previous)) &&
          (requested.trim()==="" || !Number.isFinite(Number(requested))))
        throw Error("El atributo "+key+" requiere un valor numérico.");
      matches[0].setAttribute(key,requested);
      const modified=new XMLSerializer().serializeToString(doc);
      const reload=importModel("Wulflemm-XML",modified);
      if(!reload.ok || !reload.simulated)
        return {ok:false,simulated:false,message:reload.message||"No se pudo aplicar el cambio al circuito."};
      // Un importador puede ignorar un atributo desconocido sin lanzar error:
      // verificar su persistencia para no anunciar modificaciones inexistentes.
      const result=exportNativeCircuit();
      const after=result.ok && result.format==="circuitjs-xml"
        ? new DOMParser().parseFromString(result.dump,"application/xml"):null;
      const newPosition=key==="x" ? requested : selected.attrs.x;
      const persisted=after && Array.from(after.documentElement.children).filter(el=>
        el.tagName===selected.name && el.getAttribute("x")===newPosition);
      const actual=persisted?.length===1 ? persisted[0].getAttribute(key) : null;
      const equalNumeric=requested.trim()!=="" && actual!==null &&
        Number.isFinite(Number(requested)) && Number.isFinite(Number(actual)) &&
        Math.abs(Number(actual)-Number(requested))<=1e-9*Math.max(1,Math.abs(Number(requested)));
      if(actual!==requested && !equalNumeric){
        const rollback=importModel("Wulflemm-XML",live.dump);
        return {ok:false,simulated:false,message:"CircuitJS no admite o no conserva el atributo "+key+
          ". "+(rollback.ok?"Se ha restaurado el circuito anterior.":"No ha sido posible restaurar el circuito anterior.")};
      }
      wulflemmDocument={xml:result.dump,nodes:window.WulflemmXml.parse(result.dump)};
      return {ok:true,simulated:true,message:"Atributo aplicado al circuito en funcionamiento: "+key+" = "+value+"."};
    }catch(error){return {ok:false,simulated:false,message:error.message};}
  }
  function exportWulflemmXml(){
    if(!wulflemmDocument)return {ok:false,message:"No se ha importado un documento XML de wulflemm."};
    // La exportación debe proceder del motor, nunca de una copia obsoleta.
    // Rechazar formatos distintos del XML compatible para evitar pérdidas silenciosas.
    const live=exportNativeCircuit();
    if(!live.ok)return {ok:false,message:"No se puede exportar el estado actual: "+live.message};
    if(live.format!=="circuitjs-xml")
      return {ok:false,message:"El motor exporta texto CircuitJS, no XML Wulflemm; se rechaza una copia obsoleta.",
        availableFormat:live.format};
    try{
      // No reconstruir ni simplificar el XML con un analizador limitado:
      // se deben conservar también datos internos, modelos y osciloscopios.
      const doc=new DOMParser().parseFromString(live.dump,"application/xml");
      if(doc.querySelector("parsererror")||doc.documentElement?.tagName!=="cir")
        throw Error("El motor no devuelve un documento XML válido.");
      return {ok:true,format:"wulflemm-xml",xml:live.dump,
        simulated:true,message:"Exportación íntegra del estado actual de CircuitJS."};
    }catch(error){return {ok:false,message:"El XML exportado no es compatible: "+error.message};}
  }
  // Diagnóstico real de las funciones que expone la versión compilada,
  // sin asumir que sus métodos XML son accesibles desde JavaScript.
  function getCompatibilityDiagnostics(){
    if(!sim)return {ready:false,message:"Motor CircuitJS aún no conectado."};
    const names=["importCircuit","exportCircuit","importCircuitFromXml",
      "exportCircuitAsXml","importXML","exportXML","loadCircuit","getElements"];
    const methods=Object.fromEntries(names.map(name=>[name,typeof sim[name]==="function"]));
    let types=[];
    try{types=Array.from(sim.getElements?.()||[]).map(e=>e.getType?.()).filter(Boolean);}
    catch(error){return {ready:true,methods,error:error.message};}
    return {ready:true,methods,elementTypes:[...new Set(types)],
      wattmeterTruePresent:types.includes("WattmeterTrueElm"),
      xmlImportVerified:!!lastImportDiagnostic?.ok && lastImportDiagnostic.format==="circuitjs-xml",
      lastImport:lastImportDiagnostic};
  }
  window.LabCircuit={
    loadExample,
    loadExerciseCircuit,
    getInstrumentReadings,
    getAronReadings,
    exportNativeCircuit,
    exportStandardRLC,
    importNativeCircuit,
    importWulflemmXml,
    exportWulflemmXml,
    getWulflemmComponents,
    updateWulflemmAttribute,
    getCompatibilityDiagnostics,
    // Estar publicado no implica que el motor ya esté conectado.
    isIntegrated:()=>localAvailable && !!sim &&
      frame.contentWindow?.CircuitJS1===sim,
    currentExample:()=>selectedExample
  };
  selector.addEventListener("change",clear);
  quantity.addEventListener("change",()=>scope.refresh());
  windowInput.addEventListener("change",clear);
  function openRemote(){
    message("No se ha detectado la copia local de Falstad. Comprueba la publicación de GitHub Pages y sus archivos de CircuitJS.");
    selector.disabled=true;
    frame.removeAttribute("src");
  }
  // Para que las API compartan origen, el sitio desplegado mediante Actions
  // tiene que incluir ./circuitjs/circuitjs.html y sus recursos compilados.
  const localUrl=new URL("./circuitjs/circuitjs.html",location.href);
  fetch(localUrl.href,{cache:"no-store"}).then(async res=>{
    if(!res.ok)return false;
    const html=await res.text();
    return /<script\b[^>]*type=["\x27]module["\x27][^>]*src=["\x27][^"\x27]+\.js["\x27]/i.test(html) || html.includes("circuitjs1.nocache.js");
  }).then(async available=>{
    localAvailable=available;
    if(!localAvailable){openRemote();return;}
    frame.addEventListener("load",()=>{
      try{
        const w=frame.contentWindow;
        if(w.CircuitJS1)attach(w.CircuitJS1);
        else w.oncircuitjsloaded=()=>attach(w.CircuitJS1);
      }catch(err){message("No se puede establecer comunicación con CircuitJS: "+err.message);}
    });
    // En algunas compilaciones, el callback oncircuitjsloaded se ejecuta
    // antes de que termine de cargar el iframe. Recuperar la instancia si
    // la notificación se ha perdido, también al cambiar de circuito.
    setInterval(()=>{
      try{
        const current=frame.contentWindow?.CircuitJS1;
        if(localAvailable && current && current!==sim)attach(current);
      }catch(_){/* El iframe puede estar navegando. */}
    },250);
    // El XML original de Aron está incorporado en el propio CircuitJS compilado.
    // No se descarga ni se importa ningún archivo durante el arranque.
    frame.src=localUrl.href;
    message("CircuitJS disponible en el mismo origen. Esperando a que inicialice…");
  }).catch(()=>openRemote());
})();

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
    if(!instance || sim===instance)return;
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
  function importModel(filename,dump){
    // CircuitJS importCircuit recibe un volcado textual, no el XML de wulflemm.
    // Rechazarlo antes de modificar el circuito actualmente abierto.
    if(typeof dump!=="string" || !(dump.trimStart().startsWith("$ ") || /^<cir(?:\s|>)/.test(dump.trimStart()))){
      const xml=typeof dump==="string" && /^<cir(?:\s|>)/.test(dump.trimStart());
      const reason=xml
        ? "El archivo XML de wulflemm necesita un importador compatible; no se puede pasar directamente a importCircuit."
        : "El modelo no tiene el formato de texto de CircuitJS (cabecera $).";
      message(reason);
      return {ok:false,message:reason};
    }
    if(!sim){
      pendingModel={filename,dump};
      message("CircuitJS está inicializando; el modelo se cargará automáticamente.");
      return {ok:true};
    }
    try{
      clear();
      selectedExample=filename;
      sim.importCircuit(dump,false);
      updateSelection();
      message("Modelo equivalente cargado: "+filename+". Puedes editar sus elementos y medir las señales simuladas.");
      document.dispatchEvent(new CustomEvent("lab:circuit-ready",{detail:{example:filename}}));
      return {ok:true};
    }catch(error){
      message("No se pudo cargar el modelo: "+error.message);
      return {ok:false,message:"Error en importación CircuitJS: "+error.message};
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
    return {id:selectedExample,time,current,voltage,probeVoltages,power,wattmeterPowers,totalWattmeterPower,
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
      wulflemmDocument={xml,nodes};
      // El motor CircuitJS actual admite XML con raíz <cir> mediante importCircuit.
      // Conservar el original permite comprobar por separado el intercambio sin pérdida.
      const loaded=importModel("Wulflemm-XML",xml);
      return {ok:loaded.ok,format:"wulflemm-xml",elements:nodes.length-1,wattmeters:meters.length,
        simulated:loaded.ok,message:loaded.ok
          ?"XML cargado en el motor CircuitJS; verificar equivalencia eléctrica por componentes."
          :loaded.message};
    }catch(error){return {ok:false,message:error.message};}
  }
  function getWulflemmComponents(){
    return wulflemmDocument?window.WulflemmXml.getComponents(wulflemmDocument.nodes):[];
  }
  function updateWulflemmAttribute(index,key,value){
    if(!wulflemmDocument)return {ok:false,message:"No hay documento XML cargado."};
    try{
      const nodes=window.WulflemmXml.updateAttribute(wulflemmDocument.nodes,index,key,value);
      wulflemmDocument={...wulflemmDocument,nodes};
      return {ok:true,simulated:false,message:"Atributo XML modificado; no se ha actualizado el motor eléctrico."};
    }catch(error){return {ok:false,message:error.message};}
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
      const nodes=window.WulflemmXml.parse(live.dump);
      return {ok:true,format:"wulflemm-xml",xml:window.WulflemmXml.serialize(nodes),
        simulated:true,message:"Exportación XML desde el estado actual de CircuitJS."};
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
      xmlImportVerified:false,xmlExportVerified:false};
  }
  window.LabCircuit={
    loadExample,
    loadExerciseCircuit,
    getInstrumentReadings,
    getAronReadings,
    exportNativeCircuit,
    importNativeCircuit,
    importWulflemmXml,
    exportWulflemmXml,
    getWulflemmComponents,
    updateWulflemmAttribute,
    getCompatibilityDiagnostics,
    isIntegrated:()=>localAvailable,
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
    // El XML original de Aron está incorporado en el propio CircuitJS compilado.
    // No se descarga ni se importa ningún archivo durante el arranque.
    frame.src=localUrl.href;
    message("CircuitJS disponible en el mismo origen. Esperando a que inicialice…");
  }).catch(()=>openRemote());
})();

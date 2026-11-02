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
  const windowSeconds=()=>Math.max(.001,Math.min(10,Number(windowInput.value)||.1));
  function message(text){status.textContent=text;}
  function clear(){
    record=[];lastSample=-Infinity;lastPaint=0;
    scope.clearCircuit();
  }
  function updateSelection(){
    clear();
    if(!sim)return;
    let elements=[];
    try{elements=Array.from(sim.getElements()||[]);}catch(err){message("Error al consultar los componentes: "+err.message);return;}
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
    if(!sim || selector.disabled)return;
    let t;
    try{t=sim.getTime();}catch(_){return;}
    if(!Number.isFinite(t))return;
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
      importModel(model.filename,model.dump);
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
    const ammeter=get("AmmeterElm"),voltmeter=get("ProbeElm"),
      wattmeter=get("WattmeterTrueElm") || get("WattmeterElm");
    let current=NaN,voltage=NaN,power=NaN;
    try{if(ammeter)current=ammeter.getCurrent();}catch(_){}
    try{if(voltmeter)voltage=voltmeter.getVoltageDiff();}catch(_){}
    // Preferir la bobina de tensión independiente cuando el elemento expone 4 bornes.
    // Esta lectura es potencia INSTANTÁNEA; la activa requiere promediarla.
    try {
      if(wattmeter){
        const count=wattmeter.getPostCount();
        const v= count>=4
          ? wattmeter.getPostVoltage(2)-wattmeter.getPostVoltage(3)
          : wattmeter.getVoltageDiff();
        power=v*wattmeter.getCurrent();
      }
    } catch(_) {}
    return {id:selectedExample,time,current,voltage,power,
      hasAmmeter:!!ammeter,hasVoltmeter:!!voltmeter,hasWattmeter:!!wattmeter};
  }
  window.LabCircuit={
    loadExample,
    loadExerciseCircuit,
    getInstrumentReadings,
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
    return html.includes("circuitjs1.nocache.js");
  }).then(available=>{
    localAvailable=available;
    if(!localAvailable){openRemote();return;}
    frame.addEventListener("load",()=>{
      try{
        const w=frame.contentWindow;
        if(w.CircuitJS1)attach(w.CircuitJS1);
        else w.oncircuitjsloaded=()=>attach(w.CircuitJS1);
      }catch(err){message("No se puede establecer comunicación con CircuitJS: "+err.message);}
    });
    frame.src=localUrl.href;
    message("CircuitJS disponible en el mismo origen. Esperando a que inicialice…");
  }).catch(()=>openRemote());
})();

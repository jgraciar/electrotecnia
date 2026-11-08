"use strict";
(() => {
  const $ = id => document.getElementById(id);
  let mode = "generator";
  let externalRecords = [];
  let cursorEnabled = false;
  let spectrumEnabled = false;
  let cursors = [0.25,0.75];
  let draggingCursor = -1;
  const COLORS = ["#65c3f8","#f9b866","#72deb1"];
  const TAU = Math.PI * 2;
  const num = id => Number($(id).value);
  const finite = (value,fallback) => Number.isFinite(value) ? value : fallback;
  const clamp = (v,min,max) => Math.max(min,Math.min(max,v));
  const fmt = (v,digits=3) => Number.isFinite(v) ?
    v.toLocaleString("es-ES",{maximumFractionDigits:digits}) : "—";
  const wrap = x => ((x % TAU) + TAU) % TAU;
  function wave(phase,kind,duty) {
    const p = wrap(phase) / TAU;
    if (kind === "sine") return Math.sin(phase);
    if (kind === "triangle") return 1 - 4 * Math.abs(p - 0.5);
    if (kind === "saw") return 2 * p - 1;
    if (kind === "pulse") return p < duty ? 1 : 0;
    return p < duty ? 1 : -1;
  }
  function metric(label,value) {
    const box = document.createElement("div");
    box.className = "metric";
    const key = document.createElement("small");
    key.textContent = window.LabHostI18n?.t(label)??label;
    const content = document.createElement("strong");
    content.textContent = value;
    box.append(key,content);
    return box;
  }
  function showMetrics(items) {
    $("metrics").replaceChildren(...items.map(([k,v])=>metric(k,v)));
  }
  function getGenerator() {
    return {
      shape: $("waveform").value,
      frequency: clamp(finite(num("frequency"),50),0.1,100000),
      amplitude: clamp(finite(num("amplitude"),5),0,100000),
      offset: finite(num("offset"),0),
      phase: finite(num("phase"),90) * Math.PI / 180,
      duty: clamp(finite(num("duty"),50)/100,0.01,0.99)
    };
  }
  function getThreephase() {
    const uLine = clamp(finite(num("lineVoltage"),400),0,10000);
    const frequency = clamp(finite(num("threeFrequency"),50),0.1,10000);
    const r = Math.max(0.01,finite(num("resistance"),100));
    const l = Math.max(0,finite(num("inductance"),0)) / 1000;
    const c = Math.max(0,finite(num("capacitance"),0)) * 1e-6;
    const omega = TAU * frequency;
    // c = 0 significa condensador omitido, no circuito abierto.
    const x = omega*l - (c > 0 ? 1/(omega*c) : 0);
    const z = Math.hypot(r,x);
    const phi = Math.atan2(x,r);
    const ur = uLine/Math.sqrt(3);
    const ir = z > 0 ? ur/z : 0;
    const sequence = Number($("sequence").value) === -1 ? -1 : 1;
    const angles = [0,-sequence*TAU/3,sequence*TAU/3];
    return {uLine,frequency,ur,ir,z,phi,x,r,angles};
  }
  function sampleSet() {

    if (mode === "falstad" || mode === "practices" || (mode==="publications" && window.LabPublicationCircuitOpen)) {
      const windowSec = clamp(finite(num("sampleWindow"),100),1,10000)/1000;
      if(externalRecords.length<2) {
        showMetrics([["Estado","Sin muestras"],["Ventana",fmt(windowSec*1000)+" ms"]]);
        return {frequency:2/windowSec,traces:[],unit:"V"};
      }
      const end = externalRecords[externalRecords.length-1].t, start=end-windowSec;
      const samples = externalRecords.filter(p=>p.t>=start && p.t<=end);
      const quantity = $("elementQuantity").value==="current"?"i":"v";
      const unit=quantity==="i"?"A":"V";
      const values=samples.map(p=>p[quantity]).filter(Number.isFinite);
      if(values.length<2) {
        showMetrics([["Estado","Esperando adquisición"]]);
        return {frequency:2/windowSec,traces:[],unit};
      }
      const min=Math.min(...values), max=Math.max(...values);
      const average=values.reduce((a,b)=>a+b,0)/values.length;
      const rms=Math.sqrt(values.reduce((a,b)=>a+b*b,0)/values.length);
      const interpolate=(t)=>{
        const absolute=end-windowSec+t;
        if(absolute<=samples[0].t)return samples[0][quantity];
        if(absolute>=samples[samples.length-1].t)return samples[samples.length-1][quantity];
        let low=0,high=samples.length-1;
        while(high-low>1){const mid=(low+high)>>1;if(samples[mid].t<absolute)low=mid;else high=mid;}
        const p=samples[low],q=samples[high];
        return p[quantity]+(q[quantity]-p[quantity])*((absolute-p.t)/(q.t-p.t));
      };
      showMetrics([["Vpp",fmt(max-min)+" "+unit],["RMS",fmt(rms)+" "+unit],
        ["Valor medio",fmt(average)+" "+unit],["Muestras",String(samples.length)],
        ["Ventana",fmt(windowSec*1000)+" ms"]]);
      return {frequency:2/windowSec,traces:[{
        name:quantity==="i"?"Corriente del componente":"Tensión del componente",
        color:COLORS[0],value:interpolate
      }],unit};
    }
    if (mode === "threephase") {
      const s = getThreephase();
      const peak = Math.SQRT2*s.ur, currentPeak = Math.SQRT2*s.ir;
      const t = $("traceMode").value;
      let traces;
      if (t === "current") {
        traces = s.angles.map((angle,i)=>({
          name:"I" + (i+1),color:COLORS[i],
          value:time=>currentPeak*Math.sin(TAU*s.frequency*time+angle-s.phi)
        }));
      } else if (t === "line") {
        traces = s.angles.map((angle,i)=>({
          name:["U12","U23","U31"][i],color:COLORS[i],
          value:time=>peak*(Math.sin(TAU*s.frequency*time+angle) -
            Math.sin(TAU*s.frequency*time+s.angles[(i+1)%3]))
        }));
      } else {
        traces = s.angles.map((angle,i)=>({
          name:"U" + (i+1) + "N",color:COLORS[i],
          value:time=>peak*Math.sin(TAU*s.frequency*time+angle)
        }));
      }
      const p = 3*s.ur*s.ir*Math.cos(s.phi);
      const q = 3*s.ur*s.ir*Math.sin(s.phi);
      const apparent = 3*s.ur*s.ir;
      const fp = apparent>0 ? p/apparent : 0;
      showMetrics([
        ["U fase RMS",fmt(s.ur)+" V"],
        ["U línea RMS",fmt(s.uLine)+" V"],
        ["I fase RMS",fmt(s.ir)+" A"],
        ["|Z| por fase",fmt(s.z)+" Ω"],
        ["Ángulo de carga",fmt(s.phi*180/Math.PI)+"°"],
        ["Potencia activa P",fmt(p)+" W"],
        ["Potencia reactiva Q",fmt(q)+" var"],
        ["Potencia aparente S",fmt(apparent)+" VA"],
        ["Factor de potencia",fmt(fp,4)],
        ["Reactancia X",fmt(s.x)+" Ω"],
        ["Secuencia",Number($("sequence").value)===1?"ABC":"ACB"]
      ]);
      return {frequency:s.frequency,traces,unit:t==="current"?"A":"V"};
    }
    const s = getGenerator();
    const traces = [
      {name:"CH1",color:COLORS[0],value:time=>s.offset+s.amplitude*wave(TAU*s.frequency*time,s.shape,s.duty)},
      {name:"CH2",color:COLORS[1],value:time=>s.offset+s.amplitude*wave(TAU*s.frequency*time+s.phase,s.shape,s.duty)}
    ];
    let mean,acSquare;
    if(s.shape==="pulse") {
      mean=s.amplitude*s.duty;
      acSquare=s.amplitude*s.amplitude*s.duty;
    } else if(s.shape==="square") {
      mean=s.amplitude*(2*s.duty-1);
      acSquare=s.amplitude*s.amplitude;
    } else {
      mean=0;
      acSquare=s.amplitude*s.amplitude*(s.shape==="sine"?0.5:1/3);
    }
    const rms=Math.sqrt(Math.max(0,acSquare+2*s.offset*mean+s.offset*s.offset));
    const vpp=s.shape==="pulse"?s.amplitude:2*s.amplitude;
    showMetrics([
      ["Frecuencia",fmt(s.frequency)+" Hz"],
      ["Periodo",fmt(1000/s.frequency,5)+" ms"],
      ["V pico",fmt(s.amplitude)+" V"],
      ["Vpp",fmt(vpp)+" V"],
      ["V RMS",fmt(rms)+" V"],
      ["Valor medio",fmt(mean+s.offset)+" V"],
      ["Desfase CH2",fmt(s.phase*180/Math.PI)+"°"]
    ]);
    return {frequency:s.frequency,traces,unit:"V"};
  }

  function paintCursors(ctx,w,h,gw,gh,padLeft,padTop,frequency,traces,unit){
    if(!cursorEnabled || traces.length===0) {$("cursorReadout").textContent="";return;}
    const dt=Math.abs(cursors[1]-cursors[0])*2/frequency;
    ctx.save();ctx.setLineDash([5,5]);
    cursors.forEach((position,i)=>{
      ctx.strokeStyle=i===0?"#e7e8ff":"#ffe08d";ctx.lineWidth=1.4;
      const x=padLeft+gw*position;
      ctx.beginPath();ctx.moveTo(x,padTop);ctx.lineTo(x,padTop+gh);ctx.stroke();
    });
    ctx.restore();
    const a=traces[0].value(2*cursors[0]/frequency);
    const b=traces[0].value(2*cursors[1]/frequency);
    $("cursorReadout").textContent="Δt "+fmt(dt*1000,5)+" ms · 1/Δt "+
      (dt>1e-12?fmt(1/dt,5)+" Hz":"—")+" · Δ"+unit+" "+fmt(b-a,5)+" "+unit;
  }
  function renderSpectrum(values,frequency){
    const panel=$("spectrum-panel");
    panel.hidden=!spectrumEnabled;
    if(!spectrumEnabled)return;
    const spectrum=$("spectrum"),rect=spectrum.getBoundingClientRect();
    if(rect.width<2)return;
    const dpi=Math.min(2.5,window.devicePixelRatio||1);
    spectrum.width=Math.round(rect.width*dpi);spectrum.height=Math.round(rect.height*dpi);
    const ctx=spectrum.getContext("2d");ctx.setTransform(dpi,0,0,dpi,0,0);
    const w=rect.width,h=rect.height;
    ctx.clearRect(0,0,w,h);
    if(!values || values.length<20){
      $("spectrumInfo").textContent="Selecciona una señal para analizar.";
      return;
    }
    const data=values.slice(0,-1),n=data.length;
    const mean=data.reduce((a,b)=>a+b,0)/n;
    const harmonics=[];
    for(let harmonic=1;harmonic<=15;harmonic++){
      let real=0,imag=0;
      for(let i=0;i<n;i++){
        const angle=4*Math.PI*harmonic*i/n;
        real+=(data[i]-mean)*Math.cos(angle);
        imag-=(data[i]-mean)*Math.sin(angle);
      }
      harmonics.push(Math.hypot(real,imag)*2/n);
    }
    const fundamental=harmonics[0];
    const thd=fundamental>1e-9 ?
      Math.sqrt(harmonics.slice(1).reduce((sum,v)=>sum+v*v,0))/fundamental*100:NaN;
    const max=Math.max(...harmonics,1e-9);
    const left=38,top=10,plotH=h-35,plotW=w-left-10;
    ctx.strokeStyle="#55718d";ctx.beginPath();ctx.moveTo(left,top);ctx.lineTo(left,top+plotH);
    ctx.lineTo(left+plotW,top+plotH);ctx.stroke();
    const slot=plotW/15;
    harmonics.forEach((value,i)=>{
      const barH=plotH*(value/max);
      ctx.fillStyle=i===0?"#65c3f8":"#f9b866";
      ctx.fillRect(left+slot*i+slot*0.17,top+plotH-barH,slot*0.66,barH);
      ctx.fillStyle="#aebed3";ctx.font="10px system-ui";ctx.textAlign="center";
      ctx.fillText("H"+(i+1),left+slot*(i+.5),top+plotH+14);
    });
    ctx.textAlign="left";
    $("spectrumInfo").textContent=(mode==="falstad" || mode==="practices" || (mode==="publications" && window.LabPublicationCircuitOpen))?
      "Espectro por armónicos de la ventana: la frecuencia fundamental real no está verificada; no se presenta THD.":
      "Fundamental: "+fmt(frequency)+" Hz · H1 (pico): "+fmt(fundamental,5)+" · THD aproximada (H2–H15): "+fmt(thd,3)+" %";
  }
  function exportCsv(){
    const {frequency,traces,unit}=sampleSet();
    if(traces.length===0)return;
    const n=1000,duration=2/frequency;
    const rows=[["t_s",...traces.map(tr=>tr.name+"_"+unit)].join(",")];
    for(let i=0;i<=n;i++){
      const time=duration*i/n;
      rows.push([time,...traces.map(tr=>tr.value(time))].map(n=>Number(n).toPrecision(12)).join(","));
    }
    const blob=new Blob([rows.join("\n")+"\n"],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;
    a.download="laboratorio_"+mode+"_"+Date.now()+".csv";
    document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function draw() {
    const {frequency,traces,unit} = sampleSet();
    const canvas = $("scope");
    const bounds = canvas.getBoundingClientRect();
    if(bounds.width < 1 || bounds.height < 1) return;
    const dpi = Math.min(2.5,window.devicePixelRatio||1);
    canvas.width = Math.round(bounds.width*dpi);
    canvas.height = Math.round(bounds.height*dpi);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpi,0,0,dpi,0,0);
    const w=bounds.width, h=bounds.height;
    ctx.clearRect(0,0,w,h);
    const padLeft=49,padRight=14,padTop=14,padBottom=30;
    const gw=w-padLeft-padRight, gh=h-padTop-padBottom;
    ctx.font="11px system-ui";
    ctx.lineWidth=1;
    ctx.strokeStyle="#24374b";
    ctx.fillStyle="#96aec9";
    for(let i=0;i<=10;i++){
      const x=padLeft+gw*i/10;
      ctx.beginPath();ctx.moveTo(x,padTop);ctx.lineTo(x,padTop+gh);ctx.stroke();
    }
    for(let i=0;i<=8;i++){
      const y=padTop+gh*i/8;
      ctx.beginPath();ctx.moveTo(padLeft,y);ctx.lineTo(padLeft+gw,y);ctx.stroke();
    }
    const duration=2/frequency;
    const samples=550;
    let max=0;
    const tracePoints=traces.map(tr=>Array.from({length:samples+1},(_,i)=>{
      const val=tr.value(duration*i/samples);
      max=Math.max(max,Math.abs(val));
      return val;
    }));
    max=Math.max(max*1.12,0.001);
    ctx.fillStyle="#9bb0c8";
    ctx.fillText(fmt(max)+" "+unit,4,padTop+9);
    ctx.fillText("0",28,padTop+gh/2+4);
    ctx.fillText(fmt(-max)+" "+unit,4,padTop+gh-2);
    ctx.fillText("0",padLeft,padTop+gh+17);
    ctx.textAlign="right";
    ctx.fillText(fmt(1000*duration,5)+" ms",padLeft+gw,padTop+gh+17);
    ctx.textAlign="left";
    ctx.strokeStyle="#61758a";
    ctx.beginPath();ctx.moveTo(padLeft,padTop+gh/2);ctx.lineTo(padLeft+gw,padTop+gh/2);ctx.stroke();
    tracePoints.forEach((values,i)=>{
      ctx.beginPath();ctx.strokeStyle=traces[i].color;ctx.lineWidth=2;
      for(let j=0;j<=samples;j++){
        const x=padLeft+gw*j/samples;
        const y=padTop+gh/2-values[j]/max*(gh/2);
        if(j===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
      }
      ctx.stroke();
    });
    paintCursors(ctx,w,h,gw,gh,padLeft,padTop,frequency,traces,unit);
    renderSpectrum(tracePoints[0],frequency);
    const legend=$("legend");
    legend.replaceChildren(...traces.map(t=>{
      const span=document.createElement("span"),bar=document.createElement("i");
      bar.style.background=t.color;
      span.append(bar,document.createTextNode(t.name));return span;
    }));
    $("scope-subtitle").textContent=(mode==="falstad" || mode==="practices" || (mode==="publications" && window.LabPublicationCircuitOpen))?
      "Señal de CircuitJS · ventana "+fmt(2000/frequency)+" ms · valores simulados":
      "Dos periodos · "+fmt(frequency)+" Hz · "+(mode==="threephase"?"red equilibrada":"funciones virtuales");
  }
  function setMode(next) {
    mode=next;
    document.querySelectorAll("[data-mode]").forEach(button=>{
      const active=button.dataset.mode===mode;
      button.classList.toggle("active",active);
      button.setAttribute("aria-pressed",String(active));
    });
    $("generator-controls").hidden=mode!=="generator";
    $("threephase-controls").hidden=mode!=="threephase";
    const practiceNeedsCircuit=window.LabPracticeHasCircuit!==false;
    $("falstad-controls").hidden=mode!=="falstad" && !(mode==="practices" && practiceNeedsCircuit) && !(mode==="publications" && window.LabPublicationCircuitOpen);
    $("practices-controls").hidden=mode!=="practices";
    $("publications-controls").hidden=mode!=="publications";
    $("scope-panel").hidden=(mode==="publications" && !window.LabPublicationCircuitOpen) || (mode==="practices" && !practiceNeedsCircuit);
    $("trace-mode-label").hidden=mode!=="threephase";

    draw();
  }
  document.querySelectorAll("[data-mode]").forEach(button=>{
    button.addEventListener("click",()=>setMode(button.dataset.mode));
  });
  const controls=[
    "waveform","frequency","amplitude","offset","phase","duty",
    "lineVoltage","threeFrequency","sequence","resistance","inductance","capacitance","traceMode"
  ];
  controls.forEach(id=>$(id).addEventListener("input",draw));

  $("cursorsToggle").addEventListener("click",()=>{
    cursorEnabled=!cursorEnabled;
    $("cursorsToggle").setAttribute("aria-pressed",String(cursorEnabled));
    $("cursorsToggle").textContent=cursorEnabled?"Cursores: activados":"Cursores: desactivados";
    draw();
  });
  $("spectrumToggle").addEventListener("click",()=>{
    spectrumEnabled=!spectrumEnabled;
    $("spectrumToggle").setAttribute("aria-pressed",String(spectrumEnabled));
    $("spectrum-panel").hidden=!spectrumEnabled;
    draw();
  });
  $("exportCsv").addEventListener("click",exportCsv);
  ["elementQuantity","sampleWindow"].forEach(id=>$(id).addEventListener("input",draw));
  const canvas=$("scope");
  const getCursorPos=event=>{
    const rect=canvas.getBoundingClientRect(),left=49,width=rect.width-49-14;
    return clamp((event.clientX-rect.left-left)/width,0,1);
  };
  canvas.addEventListener("pointerdown",event=>{
    if(!cursorEnabled)return;
    const pos=getCursorPos(event);
    draggingCursor=Math.abs(cursors[0]-pos)<Math.abs(cursors[1]-pos)?0:1;
    cursors[draggingCursor]=pos;
    canvas.setPointerCapture(event.pointerId);
    draw();
  });
  canvas.addEventListener("pointermove",event=>{
    if(draggingCursor<0)return;
    cursors[draggingCursor]=getCursorPos(event);draw();
  });
  const release=()=>{draggingCursor=-1;};
  canvas.addEventListener("pointerup",release);
  canvas.addEventListener("pointercancel",release);
  window.LabScope={
    setCircuitRecords(records){
      externalRecords=Array.isArray(records)?records.slice(-5000):[];
      if(mode==="falstad" || mode==="practices" || (mode==="publications" && window.LabPublicationCircuitOpen))draw();
    },
    clearCircuit(){
      externalRecords=[];if(mode==="falstad")draw();
    },
    refresh:draw,
    setMode
  };
  window.addEventListener("resize",draw);
  setMode(new URLSearchParams(location.search).has("abrir-falstad") ? "falstad" : "generator");
})();

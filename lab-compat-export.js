"use strict";
// Exportaciones independientes del formato eléctrico; nunca modifica el circuito activo.
// Falstad clásico: texto con cabecera "$". Wulflemm: XML con <cir>.
(function(root, factory) {
  const parser = typeof module === "object" && module.exports
    ? require("./wulflemm-xml.js") : root.WulflemmXml;
  const api = factory(parser);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.LabCompatibilityExport = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function(parser) {
  if (!parser) throw Error("Falta el analizador XML de Wulflemm");

  function parse(xml) {
    if (typeof xml !== "string" || !/^<cir(?:\s|>)/.test(xml.trimStart()))
      throw Error("El circuito no está en formato XML CircuitJS");
    return parser.parse(xml);
  }

  // Eliminar solo los metadatos que pertenecen al laboratorio. Usar el analizador
  // XML del navegador para no alterar modelos, textos, osciloscopios ni subcircuitos.
  function forWulflemm(xml) {
    const nodes=parse(xml);
    if (typeof DOMParser !== "undefined" && typeof XMLSerializer !== "undefined") {
      const doc=new DOMParser().parseFromString(xml,"application/xml");
      if (doc.querySelector("parsererror")) throw Error("XML no válido");
      for (const element of Array.from(doc.querySelectorAll("WattmeterTrue"))) {
        element.removeAttribute("labCurrentMode");
        element.removeAttribute("labPowerMask");
      }
      return {ok:true,format:"wulflemm-xml",text:new XMLSerializer().serializeToString(doc),
        watts:nodes.filter(n=>n.name==="WattmeterTrue").length,warnings:[]};
    }
    const clean=nodes.map(n=>({name:n.name,depth:n.depth,attrs:{...n.attrs}}));
    clean.filter(n=>n.name==="WattmeterTrue").forEach(n=>{
      delete n.attrs.labCurrentMode; delete n.attrs.labPowerMask;
    });
    return {ok:true,format:"wulflemm-xml",text:parser.serialize(clean),
      watts:nodes.filter(n=>n.name==="WattmeterTrue").length,warnings:[]};
  }

  const nearZero=x=>Math.abs(x)<1e-14;
  function forFalstad(xml) {
    const all=parse(xml);
    const root=all[0].attrs;
    const options=["$",root.f ?? "1",root.ts ?? "0.000005",root.ic ?? "10",
      root.cb ?? "50",root.vr ?? "5",root.pb ?? "50",root.mts ?? "5e-11"].join(" ");
    const lines=[options], warnings=[],unsupported=[];
    let metersReplaced=0;
    function num(v,label) {
      const n=Number(v);
      if(!Number.isFinite(n))throw Error("Valor no numérico "+label+": "+v);
      return n;
    }
    function push(tag,xy,flags,...params) {
      lines.push([tag,...xy,flags,...params].join(" "));
    }
    for(const element of all.filter(n=>n.depth===1)) {
      const tag=element.name,a=element.attrs;
      if(tag==="o"){warnings.push("Osciloscopio omitido: Falstad debe configurar sus propias trazas");continue;}
      if(tag==="h"){lines.push("h "+[a.t??-1,a.i1??0,a.i2??0].join(" "));continue;}
      if(tag==="test"||tag==="scopedata"||tag==="switchevent") {
        warnings.push("Estado de pruebas no exportado: "+tag);continue;
      }
      // Los modelos personalizados no pueden suprimirse sin revisar dependencias.
      if(!a.x){unsupported.push(tag+" (sin coordenadas)");continue;}
      const coords=a.x.trim().split(/\s+/).map(v=>num(v,"coordenada"));
      if(coords.length!==4 || !coords.every(Number.isInteger))
        throw Error("Coordenadas inválidas para "+tag);
      const f=num(a.f??"0","flags");
      const warn=(msg)=>warnings.push(tag+": "+msg);
      if(tag==="w"){
        if(Number(a.bw??1)!==1){unsupported.push("bus multiconductor w");continue;}
        push("w",coords,f);
      }else if(tag==="g"){
        push("g",coords,f,a.sy??0);
      }else if(tag==="r"){
        push("r",coords,f,num(a.r??1000,"resistencia"));
      }else if(tag==="c"){
        const sr=num(a.sr??0,"resistencia serie de condensador");
        const flags=sr!==0?f|4:f&~4;
        push("c",coords,flags,num(a.c??1e-5,"capacitancia"),
          num(a.vd??0,"tensión inicial"),num(a.iv??0.001,"voltaje inicial"),
          ...(sr!==0?[sr]:[]));
      }else if(tag==="l"){
        if(!nearZero(num(a.sr??0,"resistencia serie de bobina"))) {
          unsupported.push("l con resistencia serie (no admite texto equivalente exacto)");continue;
        }
        push("l",coords,f,num(a.l??1,"inductancia"),
          num(a.i??0,"corriente"),num(a.ic??0,"corriente inicial"),
          num(a.isat??0,"saturación"));
      }else if(tag==="v"){
        if(!nearZero(num(a.ir??0,"resistencia interna")) ||
           !nearZero(num(a.riseTime??0,"tiempo de subida"))) {
          unsupported.push("v con resistencia interna o tiempo de subida");continue;
        }
        const wf=num(a.wf??0,"forma de onda");
        const flags=wf===5?f|4:f;
        push("v",coords,flags,wf,num(a.fr??40,"frecuencia"),
          num(a.maxv??5,"tensión"),num(a.bias??0,"offset"),
          num(a.phaseShift??0,"desfase"),num(a.dutyCycle??0.5,"dutyCycle"));
      }else if(tag==="Ammeter"){
        push("370",coords,f,a.me??0,a.sc??0);
        if(a.lb)warn("Se omite la etiqueta adicional del amperímetro");
      }else if(tag==="p"){
        push("p",coords,f,a.me??0,a.sc??0,a.re??0);
        if(a.lb)warn("Se omite la etiqueta adicional de la sonda");
      }else if(tag==="Wattmeter"){
        push("420",coords,f,num(a.w??32,"anchura"),num(a.meter??0,"modo"));
      }else if(tag==="WattmeterTrue"){
        // El Falstad clásico carece del tipo WattmeterTrue; convertimos las
        // bobinas originales sin inventar equivalencia de potencia:
        //   M-L = conductor ideal; C-V = resistencia de entrada 100 megaohmios.
        const [x1,y1,x2,y2]=coords,dx=x2-x1,dy=y2-y1;
        const length=Math.hypot(dx,dy);
        if(!length){unsupported.push("WattmeterTrue de longitud nula");continue;}
        const ds=dy===0?Math.sign(dx):-Math.sign(dy);
        const width=num(a.w??32,"anchura de vatímetro");
        const g=-width*ds;
        const gx=dy/length,gy=-dx/length;
        const x3=Math.floor(x1+g*gx+0.48),y3=Math.floor(y1+g*gy+0.48);
        const x4=Math.floor(x2+g*gx+0.48),y4=Math.floor(y2+g*gy+0.48);
        // CircuitJS True conecta corriente 2-3; tensión en 0-1.
        push("w",[x1,y1,x2,y2],0);
        push("r",[x4,y4,x3,y3],0,1e8);
        metersReplaced++;
        warn("Vatímetro sustituido por conductor M-L y entrada C-V de 100 MΩ: no mostrará P/Q/S");
      }else if(tag==="x"){
        // Texto de una sola línea; Falstad admite todos los tokens restantes.
        const label=String(a.te??"").replace(/\+/g,"%2B").replace(/[\r\n]+/g," ");
        push("x",coords,f&~4,a.si??24,label);
      }else if(tag==="s"){
        const isComplex=Boolean(a.lab||a.key||Number(a.r??0));
        if(isComplex){unsupported.push("s con etiqueta, atajo o resistencia");continue;}
        push("s",coords,f,(Number(a.p??0)===0)?"false":"true",
          String(a.mm??false)==="true"?"true":"false");
      }else {
        unsupported.push(tag);
      }
    }
    if(unsupported.length)return {ok:false,format:"falstad-text",text:"",
      unsupported:[...new Set(unsupported)],warnings,metersReplaced,
      message:"No se exporta para Falstad: componentes sin conversión segura: "+
        [...new Set(unsupported)].join(", ")};
    return {ok:true,format:"falstad-text",text:lines.join("\n")+"\n",
      unsupported:[],warnings,metersReplaced};
  }

  return {forWulflemm,forFalstad};
});

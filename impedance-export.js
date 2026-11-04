"use strict";
// Exportación del nuevo componente Z de CA a componentes R, L y C comunes
// de CircuitJS/Wulflemm. No simplifica impedancias ni altera el circuito vivo.
(function(root){
  const excluded=new Set(["o","h","ccm","scopes","scope","title","hint"]);
  const electrical=el=>el.nodeType===1 && !excluded.has(el.tagName);
  const number=(el,name)=> {
    const n=Number(el.getAttribute(name));
    if(!Number.isFinite(n)) throw Error("Atributo "+name+" inválido en la impedancia");
    return n;
  };
  function convert(source){
    if(typeof source!=="string")throw Error("Falta el XML del circuito");
    const doc=new DOMParser().parseFromString(source,"application/xml");
    if(doc.querySelector("parsererror")||doc.documentElement?.tagName!=="cir")
      throw Error("El circuito no es un XML válido de CircuitJS");
    const top=Array.from(doc.documentElement.children).filter(electrical);
    const impedances=top.filter(el=>el.tagName==="Impedance");
    if(!impedances.length)return {xml:source,converted:0,added:0};
    const mapping=new Map(),oldImpedanceIndices=new Set();
    let next=0;
    const plans=new Map();
    for(let i=0;i<top.length;i++){
      const element=top[i];
      if(element.tagName!=="Impedance"){
        mapping.set(i,next++);
        continue;
      }
      oldImpedanceIndices.add(i);
      const f0=number(element,"f0");
      const r=number(element,"r"),l=number(element,"l"),c=number(element,"c");
      if(f0<=0||r<0||l<0||c<0)throw Error("Impedancia Z inválida: solo CA y componentes no negativos");
      const pieces=[];
      if(r>0)pieces.push({tag:"r",name:"r",value:r});
      if(l>0)pieces.push({tag:"l",name:"l",value:l});
      if(c>0)pieces.push({tag:"c",name:"c",value:c});
      if(!pieces.length)throw Error("Impedancia nula no admitida");
      const coords=(element.getAttribute("x")||"").trim().split(/\s+/).map(Number);
      if(coords.length!==4||coords.some(x=>!Number.isInteger(x)))
        throw Error("Impedancia sin coordenadas válidas");
      const [x1,y1,x2,y2]=coords;
      if(x1!==x2&&y1!==y2)
        throw Error("Para exportar Z descompuesta, colócala horizontal o vertical");
      const length=Math.abs(x2-x1)+Math.abs(y2-y1);
      if(length<pieces.length*20)
        throw Error("Amplía el símbolo Z a "+(pieces.length*20)+" píxeles o más para exportar sus componentes sin solapamientos");
      plans.set(element,{pieces,coords});
      mapping.set(i,next);
      next+=pieces.length;
    }
    // La selección de osciloscopio refiere índices de elementos. Si estaba
    // apuntando a Z no existe sustitución exacta de una única curva de
    // tensión total: mejor explicar que perderla silenciosamente.
    for(const scoped of doc.querySelectorAll("o p[e]")){
      const old=Number(scoped.getAttribute("e"));
      if(oldImpedanceIndices.has(old))
        throw Error("Hay una sonda asociada directamente a Z. Retírala antes de exportar RLC estándar para no cambiar su significado");
      if(mapping.has(old))scoped.setAttribute("e",String(mapping.get(old)));
    }
    let added=0;
    for(const [element,plan] of plans){
      const {pieces,coords}=plan;
      const [x1,y1,x2,y2]=coords;
      const positions=[];
      for(let i=0;i<=pieces.length;i++)positions.push([
        Math.round(x1+(x2-x1)*i/pieces.length),
        Math.round(y1+(y2-y1)*i/pieces.length)
      ]);
      const fragment=doc.createDocumentFragment();
      for(let i=0;i<pieces.length;i++){
        const piece=pieces[i];
        const el=doc.createElement(piece.tag);
        el.setAttribute("x",positions[i].join(" ")+" "+positions[i+1].join(" "));
        el.setAttribute("f","0");
        el.setAttribute(piece.name,String(piece.value));
        if(piece.tag==="l"){
          el.setAttribute("ic","0");
          const state=Array.from(element.children).find(child=>child.getAttribute("ix")===String(i));
          if(state?.tagName==="l"&&state.hasAttribute("i"))
            el.setAttribute("i",state.getAttribute("i"));
        }
        if(piece.tag==="c"){
          el.setAttribute("iv","0");
          el.setAttribute("sr","0");
          const state=Array.from(element.children).find(child=>child.getAttribute("ix")===String(i));
          if(state?.tagName==="c"&&state.hasAttribute("vd"))
            el.setAttribute("vd",state.getAttribute("vd"));
        }
        fragment.appendChild(el);
      }
      added+=pieces.length-1;
      element.replaceWith(fragment);
    }
    return {xml:new XMLSerializer().serializeToString(doc),
      converted:impedances.length,added};
  }
  root.LabImpedanceExport={convert};
})(typeof window!=="undefined"?window:globalThis);

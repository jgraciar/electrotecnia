"use strict";
(() => {
  const file=document.getElementById("wulflemmXmlFile");
  const save=document.getElementById("wulflemmXmlSave");
  const standard=document.getElementById("impedanceStandardSave");
  const status=document.getElementById("wulflemmXmlStatus");
  const component=document.getElementById("wulflemmComponent");
  const attribute=document.getElementById("wulflemmAttribute");
  const value=document.getElementById("wulflemmValue");
  const apply=document.getElementById("wulflemmApply");
  if(!file||!save||!status)return;
  let pendingFile=null;
  document.addEventListener("lab:circuit-ready",event=>{
    if(!pendingFile || event.detail?.example!==pendingFile.example)return;
    status.textContent="Circuito cargado y comprobado: "+pendingFile.filename+".";
    if(pendingFile.xml){
      save.disabled=false;
      if(component)component.disabled=false;
      if(apply)apply.disabled=false;
    }
    pendingFile=null;
  });
  document.addEventListener("lab:circuit-import-error",event=>{
    if(!pendingFile || event.detail?.example!==pendingFile.example)return;
    status.textContent=event.detail.message||"No se pudo importar el circuito.";
    save.disabled=true;
    if(component)component.disabled=true;
    if(apply)apply.disabled=true;
    pendingFile=null;
  });
  file.addEventListener("change",async()=>{
    const selected=file.files?.[0];
    if(!selected)return;
    if(selected.size>10_000_000){status.textContent="Archivo demasiado grande (máximo 10 MB).";return;}
    try{
      const source=await selected.text();
      const content=source.replace(/^\uFEFF/,"").trimStart();
      const isXml=content.startsWith("<");
      pendingFile=null;
      const result=isXml
        ? window.LabCircuit?.importWulflemmXml(content)
        : window.LabCircuit?.importNativeCircuit(selected.name,content);
      if(result?.pending)
        pendingFile={filename:selected.name,example:isXml?"Wulflemm-XML":selected.name,xml:isXml};
      if(!result?.ok){status.textContent=result?.message||"No se pudo leer el XML.";return;}
      status.textContent=result.pending
        ?"Archivo recibido, pendiente de inicialización de CircuitJS: "+selected.name
        :"Circuito cargado y comprobado: "+selected.name+".";
      save.disabled=result.format!=="wulflemm-xml" || result.pending;
      if(component && result.format!=="wulflemm-xml"){
        component.replaceChildren();
        component.disabled=true;
        if(apply)apply.disabled=true;
      }
      if(component && result.format==="wulflemm-xml"){
        component.replaceChildren();
        for(const el of window.LabCircuit.getWulflemmComponents()){
          const option=document.createElement("option");option.value=String(el.index);
          option.textContent=el.index+". "+el.name;component.append(option);
        }
        component.disabled=!!result.pending;if(apply)apply.disabled=!!result.pending;
      }
    }catch(error){status.textContent="Error al leer el archivo: "+error.message;}
  });
  if(apply)apply.addEventListener("click",()=>{
    const result=window.LabCircuit?.updateWulflemmAttribute(Number(component.value),attribute.value.trim(),value.value);
    status.textContent=result?.message||"No se pudo modificar el atributo.";
  });
  if(standard)standard.addEventListener("click",()=>{
    const result=window.LabCircuit?.exportStandardRLC?.();
    if(!result?.ok){status.textContent=result?.message||"No se puede exportar el circuito.";return;}
    const url=URL.createObjectURL(new Blob([result.xml],{type:"application/xml;charset=utf-8"}));
    const link=document.createElement("a");
    link.href=url;link.download="circuito-RLC-estandar.xml";
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent="XML compatible exportado: "+result.converted+
      " impedancia(s) Z convertida(s) en componentes R, L y C estándar.";
  });
  save.addEventListener("click",()=>{
    const result=window.LabCircuit?.exportWulflemmXml();
    if(!result?.ok){status.textContent=result?.message||"No hay XML para exportar.";return;}
    const url=URL.createObjectURL(new Blob([result.xml],{type:"application/xml;charset=utf-8"}));
    const link=document.createElement("a");
    link.href=url;link.download="circuito-wulflemm.xml";
    link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    status.textContent="XML exportado desde el estado actual del simulador.";
  });
})();

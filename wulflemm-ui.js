"use strict";
(() => {
  const file=document.getElementById("wulflemmXmlFile");
  const save=document.getElementById("wulflemmXmlSave");
  const status=document.getElementById("wulflemmXmlStatus");
  const component=document.getElementById("wulflemmComponent");
  const attribute=document.getElementById("wulflemmAttribute");
  const value=document.getElementById("wulflemmValue");
  const apply=document.getElementById("wulflemmApply");
  if(!file||!save||!status)return;
  file.addEventListener("change",async()=>{
    const selected=file.files?.[0];
    if(!selected)return;
    if(selected.size>2_000_000){status.textContent="Archivo demasiado grande (máximo 2 MB).";return;}
    try{
      const source=await selected.text();
      const content=source.replace(/^\uFEFF/,"").trimStart();
      const isXml=content.startsWith("<");
      const result=isXml
        ? window.LabCircuit?.importWulflemmXml(content)
        : window.LabCircuit?.importNativeCircuit(selected.name,content);
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
        component.disabled=false;if(apply)apply.disabled=false;
      }
    }catch(error){status.textContent="Error al leer el archivo: "+error.message;}
  });
  if(apply)apply.addEventListener("click",()=>{
    const result=window.LabCircuit?.updateWulflemmAttribute(Number(component.value),attribute.value.trim(),value.value);
    status.textContent=result?.message||"No se pudo modificar el atributo.";
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

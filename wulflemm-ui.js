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
      const result=window.LabCircuit?.importWulflemmXml(await selected.text());
      if(!result?.ok){status.textContent=result?.message||"No se pudo leer el XML.";return;}
      status.textContent="XML conservado: "+result.wattmeters+" vatímetros. No se ha cargado en el simulador.";
      save.disabled=false;
      if(component){
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
    status.textContent="XML conservado exportado. No incluye cambios hechos en el motor CircuitJS.";
  });
})();

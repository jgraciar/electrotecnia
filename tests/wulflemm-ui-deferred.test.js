"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");

class Element {
  constructor(){this.events={};this.disabled=true;this.textContent="";this.options=[];}
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);}
  append(node){this.options.push(node);}
  replaceChildren(){this.options=[];}
  async fire(type){for(const fn of this.events[type]||[])await fn();}
}
const ids=["wulflemmXmlFile","wulflemmXmlSave","wulflemmXmlStatus",
  "wulflemmComponent","wulflemmAttribute","wulflemmValue","wulflemmApply"];
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
const doc={
  events:{},
  getElementById(id){return elements[id];},
  createElement(){return new Element();},
  addEventListener(type,fn){(this.events[type]??=[]).push(fn);},
  dispatchEvent(event){for(const fn of this.events[event.type]||[])fn(event);}
};
const api={
  importWulflemmXml(){return {ok:true,pending:true,format:"wulflemm-xml"};},
  importNativeCircuit(){return {ok:true,pending:true,format:"circuitjs-text"};},
  getWulflemmComponents(){return [{index:1,name:"WattmeterTrue"}]}
};
new Function("window","document","setTimeout","Blob","URL",
  fs.readFileSync(__dirname+"/../wulflemm-ui.js","utf8"))(
  {LabCircuit:api},doc,()=>{},class{},{}
);

(async()=>{
  const input=elements.wulflemmXmlFile;
  input.files=[{name:"aron.xml",size:100,text:async()=>"<cir/>"}];
  await input.fire("change");
  assert.match(elements.wulflemmXmlStatus.textContent,/pendiente de inicialización/);
  assert.equal(elements.wulflemmXmlSave.disabled,true);
  assert.equal(elements.wulflemmApply.disabled,true);
  doc.dispatchEvent({type:"lab:circuit-ready",detail:{example:"Wulflemm-XML"}});
  assert.match(elements.wulflemmXmlStatus.textContent,/cargado y comprobado/);
  assert.equal(elements.wulflemmXmlSave.disabled,false);
  assert.equal(elements.wulflemmApply.disabled,false);

  input.files=[{name:"falstad.txt",size:100,text:async()=>"$ 1 0.000005 10 50 5 50"}];
  await input.fire("change");
  assert.match(elements.wulflemmXmlStatus.textContent,/pendiente/);
  assert.equal(elements.wulflemmXmlSave.disabled,true);
  doc.dispatchEvent({type:"lab:circuit-import-error",
    detail:{example:"falstad.txt",message:"Archivo no admitido"}});
  assert.equal(elements.wulflemmXmlStatus.textContent,"Archivo no admitido");
  assert.equal(elements.wulflemmApply.disabled,true);
  console.log("OK: importación diferida y notificación del resultado de XML/TXT.");
})().catch(err=>{console.error(err);process.exitCode=1;});

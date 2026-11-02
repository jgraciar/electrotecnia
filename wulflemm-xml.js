"use strict";
// Conserva el documento original de wulflemm sin inventar equivalencias eléctricas.
// La serialización se limita al subconjunto XML utilizado en los circuitos de referencia.
(function(root,factory){
  const api=factory();
  if(typeof module==="object" && module.exports)module.exports=api;
  else root.WulflemmXml=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(){
  const escape=s=>String(s).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
  function parse(xml){
    if(typeof xml!=="string" || !/^<cir(?:\s|>)/.test(xml.trim()))throw Error("No es un circuito XML wulflemm");
    const stack=[],nodes=[];
    const token=/<\/?[A-Za-z][\w-]*(?:\s+[^<>]*?)?\s*\/?>/g;
    let m;
    while((m=token.exec(xml))){
      const t=m[0],closing=t.startsWith("</"),self=t.endsWith("/>");
      const name=t.match(/^<\/?([\w-]+)/)[1];
      if(closing){if(stack.pop()!==name)throw Error("Cierre XML incorrecto: "+name);continue;}
      const raw=t.slice(name.length+1,t.length-(self?2:1));
      const attrs={};
      for(const a of raw.matchAll(/([\w-]+)="([^"]*)"/g))attrs[a[1]]=a[2];
      nodes.push({name,attrs,depth:stack.length});
      if(!self)stack.push(name);
    }
    if(stack.length || !nodes.length || nodes[0].name!=="cir")throw Error("XML incompleto");
    return nodes;
  }
  function serialize(nodes){
    if(!Array.isArray(nodes)||!nodes.length||nodes[0].name!=="cir")throw Error("Árbol XML no válido");
    const lines=[],stack=[];
    for(let i=0;i<nodes.length;i++){
      const node=nodes[i],next=nodes[i+1],depth=node.depth;
      while(stack.length>depth){const prev=stack.pop();lines.push("  ".repeat(stack.length)+"</"+prev+">");}
      if(depth>stack.length)throw Error("Jerarquía XML inválida");
      const attrs=Object.entries(node.attrs).map(([k,v])=>" "+k+'="'+escape(v)+'"').join("");
      const hasChildren=!!next && next.depth>depth;
      lines.push("  ".repeat(depth)+"<"+node.name+attrs+(hasChildren?">":"/>"));
      if(hasChildren)stack.push(node.name);
    }
    while(stack.length){const prev=stack.pop();lines.push("  ".repeat(stack.length)+"</"+prev+">");}
    return lines.join("\n")+"\n";
  }
  // Edición controlada de atributos del documento XML, conservando todos
  // los demás elementos y parámetros, incluidos los vatímetros de cuatro bornes.
  function updateAttribute(nodes,index,key,value){
    if(!Array.isArray(nodes)||!Number.isInteger(index)||index<1||index>=nodes.length)
      throw Error("Índice de componente incorrecto");
    if(!/^[A-Za-z_][\\w-]*$/.test(key))throw Error("Nombre de atributo incorrecto");
    if(value===undefined||value===null)throw Error("Valor de atributo obligatorio");
    const next=nodes.map(n=>({name:n.name,depth:n.depth,attrs:{...n.attrs}}));
    next[index].attrs[key]=String(value);
    return next;
  }
  function getComponents(nodes){
    return nodes.map((n,index)=>({...n,index})).filter(n=>n.depth===1 && n.name!=="o");
  }
  return {parse,serialize,updateAttribute,getComponents};
});

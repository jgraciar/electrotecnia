"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const code=fs.readFileSync(path.join(__dirname,"..","host-valencian.js"),"utf8");
const document={
 documentElement:{lang:"ca-es-valencia"},
 readyState:"loading",
 addEventListener(name,handler){assert.equal(name,"DOMContentLoaded");assert.equal(typeof handler,"function");}
};
const context={window:{},document};
vm.runInNewContext(code,context,{filename:"host-valencian.js"});
const t=context.window.LabHostI18n.t;
assert.equal(typeof t,"function");
for(const [input,expected] of [
 ["Laboratorio virtual","Laboratori virtual"],
 ["Publicaciones","Publicacions"],
 ["Frecuencia · Hz","Freqüència · Hz"],
 ["Trifásica","Trifàsica"],
 ["Generador de funciones","Generador de funcions"],
 ["Cursores: activados","Cursors: activats"],
 ["Señal de CircuitJS · ventana 100 ms · valores simulados","Senyal de CircuitJS · finestra 100 ms · valors simulats"],
 ["Dos periodos · 50 Hz · red equilibrada","Dos períodes · 50 Hz · xarxa equilibrada"],
 ["Práctica GM01 preparada. Pulsa «Cargar montaje en CircuitJS».","Pràctica GM01 preparada. Prem «Carrega el muntatge en CircuitJS»."],
 ["3 actividades originales disponibles en esta unidad. El resto solo se incorporará tras resolver y contrastar los ejercicios.","3 activitats originals disponibles en esta unitat. La resta només s'incorporarà després de resoldre i contrastar els exercicis."],
 ["Resultados de aprendizaje y criterios de evaluación vinculados","Resultats d'aprenentatge i criteris d'avaluació vinculats"],
 ["Error al leer el archivo: no válido","Error en llegir el fitxer: no válido"]
 ]) assert.equal(t(input),expected,"Traducción incorrecta: "+input);
for(const original of ["SPST","SPDT","DPDT","THD","RMS","MOSFET",
 "Enunciado del ejercicio editorial conservado literalmente.",
 "La ley de Ohm se aplica según el apartado 3.1.","Falstad"]){
 assert.equal(t(original),original,"No debe alterar terminología internacional ni contenido editorial");
}
document.documentElement.lang="es";
assert.equal(t("Laboratorio virtual"),"Laboratorio virtual","No modificar la interfaz española");
document.documentElement.lang="ca";
assert.equal(t("Laboratorio virtual"),"Laboratorio virtual","No modificar el catalán con un diccionario valenciano");
console.log("OK: interfaz valenciana, estados dinámicos y términos técnicos conservados");

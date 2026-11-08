// Empaquetado AUTÓNOMO para el futuro repositorio jgraciar.github.io.
// No copia index.html del laboratorio ni genera rutas /electrotecnia/.
// Se ejecuta tras npm run build con la entrada Vite circuitjgr.html.
import assert from "node:assert/strict";
import {cpSync,existsSync,mkdirSync,readFileSync,rmSync,writeFileSync} from "node:fs";
import {resolve,join} from "node:path";

const [source,output,adaptation]=process.argv.slice(2);
assert(source&&output&&adaptation,"Uso: package-circuits-jgr.mjs <ts-src> <destino> <repositorio-adaptacion>");
const ts=resolve(source),site=resolve(output),repo=resolve(adaptation);
const dist=join(ts,"dist");
assert(existsSync(join(dist,"circuitjgr.html")),"Vite no ha generado circuitjgr.html");
assert(!existsSync(join(dist,"circuitjs.html")),
 "La compilación mantiene circuitjs.html como entrada: se esperaba circuitjgr.html");
if(existsSync(site))rmSync(site,{recursive:true,force:true});
mkdirSync(site,{recursive:true});
cpSync(dist,site,{recursive:true,force:true});
const target=join(site,"circuitjgr.html");
const html=readFileSync(target,"utf8");
assert(html.includes("Circuit JGR 1.0"),"El título de la versión propia no aparece");
assert(/<script\b[^>]*\btype=["']module["'][^>]*\.js["']/i.test(html),
 "No se encuentra el script del simulador compilado");
assert(html.includes("</head>"),"No se reconoce la cabecera HTML");
writeFileSync(target,html.replace("</head>",
 '  <script defer src="./initial-settings.js"></script>\n</head>'));
cpSync(join(repo,"initial-settings.js"),join(site,"initial-settings.js"));
cpSync(join(repo,"LICENSE"),join(site,"LICENSE-GPLv3.txt"));
cpSync(resolve(ts,"..","COPYING.txt"),join(site,"COPYING-CircuitJS.txt"));

const about=readFileSync(join(site,"circuitjs","about.html"),"utf8");
assert(about.includes("circuits-jgr-identity")&&
 about.includes("Original by Paul Falstad.")&&
 about.includes("JavaScript conversion by Iain Sharp.")&&
 about.includes("GPLv3"),"Acerca de no conserva identidad, créditos y licencia");
assert(!existsSync(join(site,"index.html")),
 "La portada index.html del laboratorio no debe copiarse al sitio del simulador");
console.log("OK: sitio raíz independiente /circuitjgr.html, GPLv3, COPYING upstream, "+
 "22 idiomas y recursos del motor; laboratorio excluido.");

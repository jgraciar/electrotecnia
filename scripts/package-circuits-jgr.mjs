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
// La portada de la web personal es independiente de la del laboratorio:
// su única función es permitir elegir entre ambos destinos.
const index=\`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Acceso a Circuit JGR y al Laboratorio de Electrotecnia.">
  <title>Circuit JGR | Inicio</title>
  <style>
    :root{color-scheme:light dark;font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
    body{margin:0;min-height:100vh;display:grid;place-items:center;background:#f4f6f8;color:#17212c}
    main{width:min(740px,calc(100% - 36px));padding:46px 0}
    h1{font-size:clamp(2rem,5vw,3.1rem);margin:0 0 10px}
    p{line-height:1.5;color:#435061;margin:0 0 28px}
    .links{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:16px}
    a{display:block;background:#fff;color:#17212c;border:1px solid #d7dfe6;border-radius:12px;
      text-decoration:none;padding:24px;box-shadow:0 3px 12px #14263b09}
    a:hover,a:focus-visible{border-color:#3566a5;outline:2px solid transparent}
    strong{display:block;font-size:1.22rem;margin-bottom:10px}
    span{color:#435061;line-height:1.5}
    footer{font-size:.85rem;margin-top:38px;color:#546171}
    @media(prefers-color-scheme:dark){
      body{background:#12171e;color:#edf3fa}p,span,footer{color:#b8c5d1}
      a{background:#202a35;color:#edf3fa;border-color:#425061}
      a:hover,a:focus-visible{border-color:#9dc3f5}
    }
  </style>
</head>
<body>
  <main>
    <h1>Circuit JGR</h1>
    <p>Selecciona el entorno de trabajo.</p>
    <nav class="links" aria-label="Aplicaciones">
      <a href="./circuitjgr.html"><strong>Circuit JGR 1.0</strong>
        <span>Simulador de circuitos eléctricos y electrónicos.</span></a>
      <a href="./electrotecnia/"><strong>Laboratorio de Electrotecnia</strong>
        <span>Prácticas, actividades e instrumentación virtual.</span></a>
    </nav>
    <footer>Desarrollo y adaptación: Jesús Gracia Ruiz · 2026</footer>
  </main>
</body>
</html>\`;
assert(!existsSync(join(site,"index.html")),
 "No se debe sobrescribir una portada existente del sitio del simulador");
writeFileSync(join(site,"index.html"),index);
assert(index.includes('href="./circuitjgr.html"')&&index.includes('href="./electrotecnia/"'),
 "La portada debe enlazar las dos aplicaciones");
console.log("OK: sitio raíz independiente /circuitjgr.html, GPLv3, COPYING upstream, "+
 "22 idiomas y recursos del motor; portada de selección independiente.");

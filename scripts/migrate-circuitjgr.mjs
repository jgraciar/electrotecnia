// Migración de la página pública de CircuitJS a circuitjgr.html.
// El motor Vite se compila con su entrada upstream habitual para conservar
// compatibilidad. Solo cambia la URL pública tras la compilación.
import assert from "node:assert/strict";
import {existsSync,readFileSync,writeFileSync} from "node:fs";
import {join,resolve} from "node:path";

const publicDir=resolve(process.argv[2]||"public");
const simulatorDir=join(publicDir,"circuitjs");
const original=join(simulatorDir,"circuitjs.html");
const primary=join(simulatorDir,"circuitjgr.html");
assert(existsSync(original),"Falta la página compilada de CircuitJS");
const page=readFileSync(original,"utf8");
assert(/<script\b[^>]*\btype=["']module["'][^>]*\.js["']/i.test(page),
 "La página original no contiene el módulo compilado: no se sustituirá por un enlace");
assert(page.includes('../initial-settings.js'),
 "La migración debe conservar la pantalla de configuración compartida");
writeFileSync(primary,page);

function redirect(to){
 const jsPath=JSON.stringify(to);
 return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex">
  <title>Circuits JGR — nueva dirección</title>
  <script>
    // Conservar startCircuit, otros parámetros y fragmentos de enlaces antiguos.
    const target = new URL(${jsPath}, location.href);
    target.search = location.search;
    target.hash = location.hash;
    location.replace(target.href);
  </script>
</head>
<body>
  <p>La página del simulador se ha trasladado a
     <a href="${to}">circuitjgr.html</a>.</p>
</body>
</html>
`;
}
// Mantener intactos los enlaces antiguos compartidos con alumnos u otras webs.
writeFileSync(original,redirect("./circuitjgr.html"));
// Acceso abreviado en la raíz de este repositorio (sin cambiar index.html).
writeFileSync(join(publicDir,"circuitjgr.html"),redirect("./circuitjs/circuitjgr.html"));

// Dos páginas de ejemplo de la distribución original enlazan a circuitjs.html.
for(const name of ["iframe.html","jsinterface.html"]){
 const path=join(simulatorDir,name);
 if(!existsSync(path))continue;
 const before=readFileSync(path,"utf8");
 if(before.includes("circuitjs.html"))
  writeFileSync(path,before.replaceAll("circuitjs.html","circuitjgr.html"));
}

assert(readFileSync(primary,"utf8")===page,"La página principal ha cambiado durante la migración");
assert(readFileSync(original,"utf8").includes("location.replace(target.href)"),
 "Falta la redirección compatible");
console.log("OK: circuitjs/circuitjgr.html es la página real; circuitjs.html "+
 "conserva enlaces antiguos, parámetros y fragmentos.");

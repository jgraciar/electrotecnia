// Preparar Circuit JGR 1.0 como entrada REAL de Vite, no como copia ni
// redirección de la versión compilada de circuitjs.html.
// Ejecutar tras los parches del motor y las traducciones, antes de npm run build.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,existsSync} from "node:fs";
import {resolve,join} from "node:path";

const dir=resolve(process.argv[2]||"");
assert(process.argv[2] && existsSync(join(dir,"vite.config.ts")),
 "Uso: node prepare-circuits-jgr.mjs <directorio-ts-de-CircuitJS>");
const htmlPath=join(dir,"circuitjs.html");
const src=readFileSync(htmlPath,"utf8");
assert(src.includes("<title>CircuitJS</title>") && src.includes('src="/main.ts"'),
 "La página de origen ya no tiene la estructura esperada");
const branded=src
 .replace("<title>CircuitJS</title>","<title>Circuit JGR 1.0</title>")
 .replace("<head>","<head>\n  <meta name=\"application-name\" content=\"Circuit JGR\">");
writeFileSync(join(dir,"circuitjgr.html"),branded);
const viteFile=join(dir,"vite.config.ts");
const vite=readFileSync(viteFile,"utf8");
const entry="circuitjs: 'circuitjs.html',";
assert(vite.split(entry).length===2,"No se encuentra una única entrada Vite de CircuitJS");
writeFileSync(viteFile,vite.replace(entry,"circuitjgr: 'circuitjgr.html',"));

// Los ejemplos públicos de la distribución original se conservan,
// pero su iframe apunta ahora a la página específica de Circuit JGR.
for(const name of ["iframe.html","jsinterface.html"]){
 const target=join(dir,name);
 if(!existsSync(target))continue;
 const text=readFileSync(target,"utf8");
 writeFileSync(target,text.replaceAll("circuitjs.html","circuitjgr.html"));
}
const serviceWorker=join(dir,"service-worker.template.js");
if(existsSync(serviceWorker)){
 const text=readFileSync(serviceWorker,"utf8");
 writeFileSync(serviceWorker,text.replace("'circuitjs.html',","'circuitjgr.html',"));
}

// Identidad propia sin borrar el bloque original de créditos ni sus licencias;
// el bloque se inserta como <section> para no alterar los índices de <p>
// que usan las traducciones existentes de «Acerca de».
const about=join(dir,"circuitjs","about.html");
const html=readFileSync(about,"utf8");
assert(html.includes("<div>") && html.includes("Original by Paul Falstad."),
 "No se reconoce la página original Acerca de");
const identity=`
<section id="circuits-jgr-identity" style="padding:8px 10px;margin-bottom:12px;border-bottom:1px solid #888">
  <h2 style="margin:0 0 6px">Circuit JGR 1.0</h2>
  <p style="margin:3px 0"><span id="jgr-development">Desarrollo y adaptación</span>:
    <strong>Jesús Gracia Ruiz</strong> · 2026</p>
  <p style="margin:3px 0"><span id="jgr-based">Basado en</span>
    <strong>CircuitJS1 5.0.4ts</strong> (Paul Falstad, Iain Sharp y colaboradores).</p>
  <p style="margin:3px 0"><span id="jgr-license">Adaptaciones propias: GNU GPLv3</span>.
    <a href="../LICENSE-GPLv3.txt" target="_blank" rel="noopener">GPLv3</a>.
    <span id="jgr-code">Código fuente</span>:
    <a href="https://github.com/jgraciar/electrotecnia/tree/circuits-jgr-1.0" target="_blank" rel="noopener">jgraciar/electrotecnia</a>.
    <span id="jgr-credits">Los créditos y las licencias originales figuran a continuación.</span></p>
</section>
<script>
(() => {
 const requested=new URLSearchParams(location.search).get("lang")||navigator.language||"es";
 const lang=requested.toLowerCase().replace(/_/g,"-");
 const code=lang.startsWith("ca-es-valencia")?"ca-es-valencia":lang.split("-")[0];
 const languages={
  es:["Desarrollo y adaptación","Basado en","Adaptaciones propias: GNU GPLv3","Código fuente","Se conservan a continuación los créditos y las licencias originales."],
  en:["Development and adaptation","Based on","Original adaptations: GNU GPLv3","Source code","The original credits and licenses follow."],
  ca:["Desenvolupament i adaptació","Basat en","Adaptacions pròpies: GNU GPLv3","Codi font","A continuació es conserven els crèdits i les llicències originals."],
  "ca-es-valencia":["Desenvolupament i adaptació","Basat en","Adaptacions pròpies: GNU GPLv3","Codi font","A continuació es conserven els crèdits i les llicències originals."],
  gl:["Desenvolvemento e adaptación","Baseado en","Adaptacións propias: GNU GPLv3","Código fonte","A continuación consérvanse os créditos e as licenzas orixinais."],
  eu:["Garapena eta egokitzapena","Oinarritua","Norberaren egokitzapenak: GNU GPLv3","Iturburu-kodea","Jatorrizko kredituak eta lizentziak jarraian ageri dira."],
  fr:["Développement et adaptation","Basé sur","Adaptations propres : GNU GPLv3","Code source","Les crédits et licences d’origine figurent ci-dessous."],
  de:["Entwicklung und Anpassung","Basierend auf","Eigene Anpassungen: GNU GPLv3","Quellcode","Ursprüngliche Urheberangaben und Lizenzen folgen."],
  it:["Sviluppo e adattamento","Basato su","Adattamenti propri: GNU GPLv3","Codice sorgente","Seguono i riconoscimenti e le licenze originali."],
  pt:["Desenvolvimento e adaptação","Baseado em","Adaptações próprias: GNU GPLv3","Código-fonte","Seguem-se os créditos e as licenças originais."],
  nl:["Ontwikkeling en aanpassing","Gebaseerd op","Eigen aanpassingen: GNU GPLv3","Broncode","De oorspronkelijke vermeldingen en licenties volgen."],
  sv:["Utveckling och anpassning","Baserad på","Egna anpassningar: GNU GPLv3","Källkod","Ursprungliga upphovsuppgifter och licenser följer."],
  da:["Udvikling og tilpasning","Baseret på","Egne tilpasninger: GNU GPLv3","Kildekode","Originale krediteringer og licenser følger."],
  nb:["Utvikling og tilpasning","Basert på","Egne tilpasninger: GNU GPLv3","Kildekode","Opprinnelige bidragsytere og lisenser følger."],
  fi:["Kehitys ja mukautus","Perustuu ohjelmistoon","Omat mukautukset: GNU GPLv3","Lähdekoodi","Alkuperäiset tekijätiedot ja lisenssit seuraavat."],
  pl:["Rozwój i adaptacja","Na podstawie","Własne modyfikacje: GNU GPLv3","Kod źródłowy","Oryginalne informacje o autorach i licencjach znajdują się poniżej."],
  csx:["Vývoj a úpravy","Založeno na","Vlastní úpravy: GNU GPLv3","Zdrojový kód","Původní autoři a licence jsou uvedeni níže."],
  ru:["Разработка и адаптация","На основе","Собственные изменения: GNU GPLv3","Исходный код","Сведения об авторах и исходных лицензиях приведены ниже."],
  zh:["开发与改编","基于","自行修改部分：GNU GPLv3","源代码","原始作者和许可信息见下文。"],
  "zh-tw":["開發與改編","基於","自行修改部分：GNU GPLv3","原始碼","原始作者與授權資訊見下文。"],
  ja:["開発と改変","基盤","独自の変更部分：GNU GPLv3","ソースコード","元の著作者とライセンス情報は以下に記載されています。"],
  kr:["개발 및 수정","기반","독자적 변경 사항: GNU GPLv3","소스 코드","원저작자 및 라이선스 정보는 아래에 있습니다."]
 };
 const t=languages[lang]||languages[code]||languages.en;
 ["jgr-development","jgr-based","jgr-license","jgr-code","jgr-credits"]
  .forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=t[i]});
})();
</script>
`;
assert(!html.includes("circuits-jgr-identity"),"La identidad se ha insertado dos veces");
writeFileSync(about,html.replace("<div>","<div>\n"+identity));
console.log("OK: entrada Vite circuitjgr.html, Circuit JGR 1.0 y Acerca de conservando todos los créditos.");

// Embed the user-supplied Aron circuit directly into CircuitJS at build time.
// No runtime fetch, iframe race or external startup file is involved.
import { readFileSync, writeFileSync } from 'node:fs';
const source=process.argv[2], fixture=process.argv[3];
if(!source||!fixture)throw Error('Usage: node embed-default-aron.mjs CirSim.ts circuit.xml');
let ts=readFileSync(source,'utf8');
const originalXml=readFileSync(fixture,'utf8');
if(!/^<cir(?:\s|>)/.test(originalXml.trimStart()))throw Error('Invalid original XML');
// Solo en el diseño de arranque: ambos vatímetros muestran P, Q y S.
// El archivo de referencia externo permanece intacto para comprobar su importación.
let meterCount=0;
const maskedXml=originalXml.replace(/<WattmeterTrue\b[^>]*\/>/g, tag=>{
  meterCount++;
  if(!/\bmeter="1"/.test(tag))throw Error('Modo de vatímetro inesperado en el circuito Aron');
  return tag.replace(/\s*\/>$/, ' labCurrentMode="2" labPowerMask="7"/>');
});
if(meterCount!==2)throw Error('El diseño inicial debe contener exactamente dos vatímetros de Aron');
// El fichero Wulflemm original usa un paso de 1 µs: medir unos tres periodos
// a 60 Hz exige decenas de miles de iteraciones. Solo para el diseño inicial,
// 10 µs permite 1667 muestras por periodo sin ralentizar Q ni S.
const xml=maskedXml.replace(/^(<cir\b[^>]*\bts=")0\.000001(")/,
  '$10.00001$2');
if(xml===maskedXml)throw Error('No se ha localizado el paso de simulación del diseño inicial');
const anchor='        this.transform = [0, 0, 0, 0, 0, 0];';
if(!ts.includes(anchor))throw Error('Upstream CircuitJS startup hook has changed');
const injection=`        // Laboratory default: embedded Aron circuit with P, Q and S on both wattmeters.
        if (this.startCircuitText == null && this.startCircuit == null &&
            this.startCircuitLink == null && !((window as any).TestManager?.loadingTestCircuit)) {
            this.startCircuitText = ${JSON.stringify(xml)};
        }

`;
ts=ts.replace(anchor,injection+anchor);
// A startup circuit normally hides the toolbar in upstream CircuitJS.
// Keep it visible by default in both embedded and standalone views.
const uiSource=source.replace(/CirSim\.ts$/, 'UIManager.ts');
let ui=readFileSync(uiSource,'utf8');
const toolbarStart='        this.menus.toolbarCheckItem.setState(';
const a=ui.indexOf(toolbarStart);
const b=ui.indexOf(');',a+toolbarStart.length);
if(a<0||b<0||!ui.slice(a,b).includes('startCircuitText'))throw Error('Toolbar startup block not found');
ui=ui.slice(0,a)+toolbarStart+'!this.hideMenu && !noEditing && !hideSidebar'+ui.slice(b);
writeFileSync(uiSource,ui);
// La API opcional de Dropbox se descargaba de forma síncrona antes del motor.
// En móviles o redes donde el recurso externo no responde bloqueaba la carga
// del CircuitJS incrustado. "async" mantiene Dropbox sin bloquear el HTML.
const htmlSource=source.replace(/CirSim\\.ts$/, 'circuitjs.html');
if(htmlSource===source)throw Error('No se encuentra circuitjs.html');
let html=readFileSync(htmlSource,'utf8');
const dropbox='<script type="text/javascript" src="https://www.dropbox.com/static/api/2/dropins.js"';
if(html.split(dropbox).length!==2)
    throw Error('Ha cambiado el script de Dropbox en circuitjs.html');
html=html.replace(dropbox,'<script type="text/javascript" async src="https://www.dropbox.com/static/api/2/dropins.js"');
writeFileSync(htmlSource,html);
writeFileSync(source,ts);
console.log('Embedded Aron startup with',meterCount,'wattmeters showing P/Q/S:',xml.length,'bytes; Dropbox no bloqueante');

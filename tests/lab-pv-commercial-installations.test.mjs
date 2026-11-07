import assert from "node:assert/strict";
import {pvGridBalance} from "../scripts/LabPVGridBalance.ts";
import {selectCapacitorSteps} from "../scripts/LabPVCapacitorController.ts";
import {gridFollowingSample} from "../scripts/LabPVInverter.ts";

// Instalaciones de referencia a 50 Hz. P en kW; Q en kVAr; U en V.
// Fuentes de los valores comerciales:
// Fronius Primo 5.0-1 (5 kW/5 kVA, 230 V):
// https://www.fronius.com/es/latin-america/energia-solar/instaladores-y-socios/datos-tecnicos/todos-los-productos/inversor/fronius-primo/fronius-primo-5-0-1
// Fronius Symo 10.0-3-M (10 kW/10 kVA, 400/230 V):
// https://manuals.fronius.com/html/4204101909/es.html
// CIRCUTOR OPTIM HYB, manual M059B01-01, tabla 8 (2,5 kVAr 1x230 V;
// 12,5 y 25 kVAr 3x400 V):
// https://docs.circutor.com/docs/M059B01-01.pdf
// Valores ideales de componentes; no modela pérdidas, tolerancias, armónicos,
// protecciones, regulación real del inversor ni resonancias de la red.

const frequency=50, omega=2*Math.PI*frequency;
const installations={
 mono:{phases:1,voltage:230,inverterP:5,inverterS:5,steps:[2.5]},
 tri:{phases:3,voltage:400,inverterP:10,inverterS:10,steps:[12.5,25]}
};
const close=(a,b,eps=1e-8)=>{
 assert(Number.isFinite(a),`Valor no finito: ${a}`);
 assert(Math.abs(a-b)<=eps,`${a} != ${b}`);
};

// Comprobar dimensionamiento físico de condensadores comerciales (50 Hz).
const cMono=2500/(omega*230**2);
close(omega*cMono*230**2,2500);
close(omega*cMono*230,2500/230);
close(2500/230,10.869565217391305,1e-9); // Tabla CIRCUTOR: 10,9 A.
for(const kvar of installations.tri.steps){
 const deltaC=kvar*1000/(3*omega*400**2); // Triángulo: C por rama.
 close(3*omega*deltaC*400**2,kvar*1000);
 close(Math.sqrt(3)*omega*deltaC*400,kvar*1000/(Math.sqrt(3)*400));
}
close(12500/(Math.sqrt(3)*400),18.042195912175806,1e-8);
close(25000/(Math.sqrt(3)*400),36.08439182435161,1e-8);

const scenarios=[
 {name:"monofásica, importación con 2,5 kVAr",site:"mono",
  loadP:7,loadQ:4,pvP:3,pvQ:0,capacitorQ:2.5,gridP:4,gridQ:1.5,reactive:"inductive"},
 {name:"monofásica, autoconsumo completo con escalón retenido",site:"mono",
  loadP:4,loadQ:2,pvP:4,pvQ:0,capacitorQ:2.5,gridP:0,gridQ:-0.5,reactive:"capacitive"},
 {name:"monofásica, vertido con escalón retenido",site:"mono",
  loadP:2,loadQ:1.5,pvP:4.5,pvQ:0,capacitorQ:2.5,gridP:-2.5,gridQ:-1,reactive:"capacitive"},
 {name:"monofásica, vertido con Q del inversor",site:"mono",
  loadP:2,loadQ:1.5,pvP:4.5,pvQ:1,capacitorQ:2.5,gridP:-2.5,gridQ:-2,reactive:"capacitive"},
 {name:"trifásica, taller con escalón de 25 kVAr",site:"tri",
  loadP:45,loadQ:32,pvP:10,pvQ:0,capacitorQ:25,gridP:35,gridQ:7,reactive:"inductive"},
 {name:"trifásica, autoconsumo completo con escalón retenido",site:"tri",
  loadP:8,loadQ:6,pvP:8,pvQ:0,capacitorQ:12.5,gridP:0,gridQ:-6.5,reactive:"capacitive"},
 {name:"trifásica, vertido con FV aportando Q",site:"tri",
  loadP:4,loadQ:5,pvP:8,pvQ:2,capacitorQ:12.5,gridP:-4,gridQ:-9.5,reactive:"capacitive"},
 {name:"trifásica, vertido sin condensadores",site:"tri",
  loadP:4,loadQ:5,pvP:8,pvQ:2,capacitorQ:0,gridP:-4,gridQ:3,reactive:"inductive"}
];
for(const c of scenarios){
 const cfg=installations[c.site];
 assert(c.pvP<=cfg.inverterP,`Inversor ${c.name}: P excedida`);
 assert(Math.hypot(c.pvP,c.pvQ)<=cfg.inverterS+1e-10,
  `Inversor ${c.name}: potencia aparente excedida`);
 const result=pvGridBalance({...c,voltage:cfg.voltage,phases:cfg.phases});
 close(result.gridP,c.gridP);
 close(result.gridQ,c.gridQ);
 close(result.gridS,Math.hypot(c.gridP,c.gridQ));
 const lineCurrent=1000*Math.hypot(c.gridP,c.gridQ)/
  (cfg.voltage*(cfg.phases===3?Math.sqrt(3):1));
 close(result.gridCurrent,lineCurrent);
 assert.equal(result.gridDirection,c.gridP>0?"import":c.gridP<0?"export":"zero");
 assert.equal(result.reactiveDirection,c.reactive);
 close(result.selfConsumedP+result.importedP,c.loadP);
 close(result.selfConsumedP+result.exportedP,c.pvP);
 // Fasores orientados en la misma tensión: red + FV = carga + condensadores.
 // La corriente del condensador es capacitiva (su Q absorbida es negativa).
 const denom=cfg.voltage*(cfg.phases===3?Math.sqrt(3):1);
 close((c.gridP+c.pvP-c.loadP)*1000/denom,0);
 close((c.gridQ+c.pvQ+c.capacitorQ-c.loadQ)*1000/denom,0);
 if(c.gridP===0){
  assert(result.activeZeroReactiveNonzero);
  assert(result.gridCurrent>0,"P=0 pero Q distinto de cero debe dar I>0");
 }
 // La generación de un inversor real de 1 o 3 fases debe reproducir P/Q
 // mediante integración en el ciclo; se contrasta también la corriente RMS.
 const sampleCount=1024;
 const phaseAngles=cfg.phases===3?[0,-2*Math.PI/3,2*Math.PI/3]:[0];
 const phaseV=cfg.phases===3?cfg.voltage/Math.sqrt(3):cfg.voltage;
 let sumP=0,sumQ=0;
 const rmsByPhase=[];
 for(const phase of phaseAngles){
  let p=0,q=0,iSquared=0;
  for(let j=0;j<sampleCount;j++){
   const time=j/(sampleCount*frequency),angle=2*Math.PI*frequency*time+phase;
   const {voltage,current}=gridFollowingSample({
    voltageRms:phaseV,frequency,power:c.pvP*1000/cfg.phases,
    reactivePower:c.pvQ*1000/cfg.phases,phase,time
   });
   p+=voltage*current/sampleCount;
   q+=(-Math.SQRT2*phaseV*Math.cos(angle))*current/sampleCount;
   iSquared+=current*current/sampleCount;
  }
  sumP+=p;sumQ+=q;rmsByPhase.push(Math.sqrt(iSquared));
 }
 close(sumP,c.pvP*1000,1e-6);
 close(sumQ,c.pvQ*1000,1e-6);
 const expectedPVCurrent=Math.hypot(c.pvP,c.pvQ)*1000/denom;
 rmsByPhase.forEach(current=>close(current,expectedPVCurrent,1e-6));
 console.log("OK",c.name,JSON.stringify({
  redP_kW:result.gridP,redQ_kVAr:result.gridQ,
  corrienteRed_A:Number(result.gridCurrent.toFixed(3)),
  corrienteFV_A:Number(expectedPVCurrent.toFixed(3))
 }));
}

// Regulación de escalones en presencia de FV y cosphi objetivo 0,95.
for(const [site,loadP,loadQ,pvP,expected] of [
 ["mono",7,4,3,[0]],["tri",45,32,10,[1]]
]){
 const cfg=installations[site];
 const unregulated=pvGridBalance({
  loadP,loadQ,pvP,voltage:cfg.voltage,phases:cfg.phases
 });
 const selection=selectCapacitorSteps({
  gridP:unregulated.gridP,reactiveBeforeCapacitors:unregulated.gridQ,
  steps:cfg.steps,targetCosPhi:0.95
 });
 assert.equal(selection.action,"recommend");
 assert.deepEqual(selection.selected,expected);
 const after=pvGridBalance({
  loadP,loadQ,pvP,capacitorQ:selection.capacitorQ,
  voltage:cfg.voltage,phases:cfg.phases
 });
 assert(after.gridQ>=0,"No permitir sobrecompensación en importación");
 assert(after.gridCurrent<unregulated.gridCurrent);
}
for(const [site,loadP,loadQ,pvP,pvQ,existing,expectedQ] of [
 ["mono",2,1.5,4.5,0,[0],-1],
 ["tri",4,5,8,2,[0],-9.5]
]){
 const cfg=installations[site];
 const before=pvGridBalance({
  loadP,loadQ,pvP,pvQ,voltage:cfg.voltage,phases:cfg.phases
 });
 const held=selectCapacitorSteps({
  gridP:before.gridP,reactiveBeforeCapacitors:before.gridQ,
  steps:cfg.steps,currentSelected:existing
 });
 assert.equal(held.action,"hold");
 assert.deepEqual(held.selected,existing);
 close(held.gridQ,expectedQ);
}
console.log("OK: ocho escenarios comerciales mono/trifásicos, capacidad, intensidades, Q, límites y regulador");

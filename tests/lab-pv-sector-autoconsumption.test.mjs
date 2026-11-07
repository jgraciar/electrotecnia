import assert from "node:assert/strict";
import {pvGridBalance} from "../scripts/LabPVGridBalance.ts";
import {selectCapacitorSteps} from "../scripts/LabPVCapacitorController.ts";

// Escenarios didácticos, NO certificación legal ni ensayo de anti-vertido.
// Marco: Ley 24/2013 art. 9; RD 244/2019 arts. 3-5, 10-14
// y anexo I de ITC-BT-40; RD 1183/2020 art. 17; CTE DB-HE 5 (RD 450/2022).
// Potencias kW/kVAr, tensiones RMS, 50 Hz y cargas sinusoidales equilibradas.
// Los tamaños son hipótesis de ingeniería, no datos de demanda medidos.
const cases=[
 {sector:"vivienda",system:"1F",voltage:230,phases:1,
  installedPV:5,availablePV:4.1,loadP:1.4,loadQ:0.35,capacitorQ:0,
  mode:"sin excedentes",expectedPv:1.4,expectedGridP:0,expectedGridQ:0.35},
 {sector:"vivienda",system:"1F",voltage:230,phases:1,
  installedPV:5,availablePV:4.1,loadP:1.4,loadQ:0.35,capacitorQ:0,
  mode:"con excedentes y compensacion",expectedPv:4.1,expectedGridP:-2.7,expectedGridQ:0.35},
 {sector:"comercio",system:"1F",voltage:230,phases:1,
  installedPV:5,availablePV:5,loadP:6,loadQ:3,capacitorQ:2.5,
  mode:"con excedentes y compensacion",expectedPv:5,expectedGridP:1,expectedGridQ:0.5},
 {sector:"comercio",system:"1F",voltage:230,phases:1,
  installedPV:5,availablePV:5,loadP:2.2,loadQ:1.0,capacitorQ:2.5,
  mode:"sin excedentes",expectedPv:2.2,expectedGridP:0,expectedGridQ:-1.5},
 {sector:"terciario",system:"3F",voltage:400,phases:3,
  installedPV:70,availablePV:60,loadP:35,loadQ:25,capacitorQ:12.5,
  mode:"con excedentes y compensacion",expectedPv:60,expectedGridP:-25,expectedGridQ:12.5},
 {sector:"terciario",system:"3F",voltage:400,phases:3,
  installedPV:70,availablePV:60,loadP:35,loadQ:25,capacitorQ:12.5,
  mode:"sin excedentes",expectedPv:35,expectedGridP:0,expectedGridQ:12.5},
 {sector:"industria",system:"3F",voltage:400,phases:3,
  installedPV:160,availablePV:145,loadP:140,loadQ:100,capacitorQ:75,
  mode:"con excedentes sin compensacion",expectedPv:145,expectedGridP:-5,expectedGridQ:25},
 {sector:"industria",system:"3F",voltage:400,phases:3,
  installedPV:160,availablePV:145,loadP:80,loadQ:60,capacitorQ:75,
  mode:"sin excedentes",expectedPv:80,expectedGridP:0,expectedGridQ:-15}
];
const close=(actual,expected,tol=1e-8)=>{
 assert(Number.isFinite(actual), "Magnitud no finita");
 assert(Math.abs(actual-expected)<tol,actual+" != "+expected);
};
for(const c of cases){
 assert(c.availablePV<=c.installedPV,"FV disponible supera capacidad del inversor");
 if(c.mode.includes("compensacion")&&!c.mode.includes("sin compensacion"))
  assert(c.installedPV<=100,"No corresponde la compensación simplificada a más de 100 kW");
 // Limitación ideal de P: sirve para comprobar balances estacionarios.
 // Un sistema real requiere dispositivo antivertido certificado y ensayos ITC-BT-40.
 const appliedPV=c.mode==="sin excedentes"?
  Math.min(c.availablePV,c.loadP):c.availablePV;
 close(appliedPV,c.expectedPv);
 const curtailedPV=c.availablePV-appliedPV;
 assert(curtailedPV>=0);
 const result=pvGridBalance({
  loadP:c.loadP,loadQ:c.loadQ,pvP:appliedPV,capacitorQ:c.capacitorQ,
  phases:c.phases,voltage:c.voltage
 });
 close(result.gridP,c.expectedGridP);
 close(result.gridQ,c.expectedGridQ);
 close(result.gridS,Math.hypot(c.expectedGridP,c.expectedGridQ));
 const denominator=c.voltage*(c.phases===3?Math.sqrt(3):1);
 close(result.gridCurrent,1000*Math.hypot(c.expectedGridP,c.expectedGridQ)/denominator);
 close(result.importedP-result.exportedP,result.gridP);
 close(result.selfConsumedP+result.importedP,c.loadP);
 close(result.selfConsumedP+result.exportedP,appliedPV);
 if(c.mode==="sin excedentes"){
  close(result.exportedP,0);
  assert(result.gridP>=0);
  if(c.availablePV>c.loadP)close(curtailedPV,c.availablePV-c.loadP);
  if(result.gridP===0&&c.expectedGridQ!==0){
   assert(result.activeZeroReactiveNonzero);
   assert(result.gridCurrent>0);
  }
 }else{
  close(curtailedPV,0);
 }
 console.log("OK:",c.sector,c.system,c.mode,
  JSON.stringify({pvAplicada_kW:appliedPV,limitada_kW:curtailedPV,
   redP_kW:result.gridP,redQ_kVAr:result.gridQ,
   redI_A:Number(result.gridCurrent.toFixed(3))}));
}

// Curva temporal de demanda residencial: limitación de producción sin excedentes
// en régimen ideal. No representa la respuesta dinámica real ni valida los 2 s.
const loadProfile=[0.35,1.2,3,0.5,4.8,2];
const solarProfile=[0,3.5,4.8,4.8,4.8,0.5];
for(let i=0;i<loadProfile.length;i++){
 const pv=Math.min(solarProfile[i],loadProfile[i],5);
 const res=pvGridBalance({
  loadP:loadProfile[i],loadQ:0.12,pvP:pv,phases:1,voltage:230
 });
 assert(res.gridP>=0);
 close(res.exportedP,0);
 close(res.importedP,Math.max(0,loadProfile[i]-solarProfile[i]));
}

// Simulación económica ilustrativa: la compensación simplificada no convierte
// kWh excedentarios en consumo instantáneo ni anula peajes, potencia o impuestos.
for(const [consumoEnergiaEuros,excedenteValorizadoEuros,descuento] of [
 [35,45,35],[45,12,12],[0,10,0]
]){
 close(Math.min(consumoEnergiaEuros,excedenteValorizadoEuros),descuento);
 assert(consumoEnergiaEuros-descuento>=0);
}

// CTE HE-5: ámbito y potencia mínima distintos de la definición de potencia
// instalada a efectos de autoconsumo (RD 244/2019: suma máximos inversores).
const he5=(surface,roof,thermalOnRoof,residential)=>{
 const factor=residential?0.005:0.010;
 return Math.min(factor*surface,0.1*(0.5*roof-thermalOnRoof));
};
close(he5(1500,200,0,true),7.5);   // residencial privado, supuesto >1000 m2
close(he5(1200,300,0,false),12);    // comercio nuevo, supuesto >1000 m2
close(he5(5000,1200,200,false),40);// terciario nuevo, supuesto >1000 m2

// Escalones representativos de compensación en importación, sin invertir Q.
const selection=selectCapacitorSteps({
 gridP:35,reactiveBeforeCapacitors:32,steps:[12.5,25],targetCosPhi:0.95
});
assert.deepEqual(selection.selected,[1]);
close(selection.capacitorQ,25);
close(selection.gridQ,7);
console.log("OK: vivienda, comercio, terciario e industria; 1F/3F; sin y con excedentes; HE5");

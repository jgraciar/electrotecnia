// Secuenciador didáctico de contactores para escalones de condensadores.
// No representa una protección ni gobierna equipos físicos.
// now y lastSwitchAt expresados en segundos; tiempos no negativos.
export function capacitorContactorTransition({
 currentSelected,requestedSelected,stepCount,now,lastSwitchAt=-Infinity,
 minimumDwell=5,minimumDischarge=60,lastOpenedAt=[]
}){
 if(!Number.isInteger(stepCount)||stepCount<0||stepCount>16||
  !Array.isArray(currentSelected)||!Array.isArray(requestedSelected)||
  !Array.isArray(lastOpenedAt)||!Number.isFinite(now)||
  !Number.isFinite(minimumDwell)||minimumDwell<0||
  !Number.isFinite(minimumDischarge)||minimumDischarge<0||
  !(Number.isFinite(lastSwitchAt)||lastSwitchAt===-Infinity))
  throw Error("Parámetros de maniobra no válidos");
 for(const a of [currentSelected,requestedSelected]){
  if(new Set(a).size!==a.length||a.some(i=>!Number.isInteger(i)||i<0||i>=stepCount))
   throw Error("Índices de escalones no válidos");
 }
 if(lastOpenedAt.some(t=>t!==undefined&&!Number.isFinite(t)))
  throw Error("Tiempos de descarga no válidos");
 const current=[...currentSelected].sort((a,b)=>a-b);
 const requested=[...requestedSelected].sort((a,b)=>a-b);
 const additions=requested.filter(i=>!current.includes(i));
 const removals=current.filter(i=>!requested.includes(i));
 if(!additions.length&&!removals.length)
  return {selected:current,action:"none",step:null,lastSwitchAt,lastOpenedAt:[...lastOpenedAt]};
 if(now-lastSwitchAt<minimumDwell)
  return {selected:current,action:"wait-dwell",step:null,lastSwitchAt,lastOpenedAt:[...lastOpenedAt]};
 // Desconectar antes de conectar, para evitar sobrecompensaciones transitorias.
 if(removals.length){
  const step=removals[0],nextOpened=[...lastOpenedAt];
  nextOpened[step]=now;
  return {selected:current.filter(i=>i!==step),action:"open",step,
   lastSwitchAt:now,lastOpenedAt:nextOpened};
 }
 const step=additions.find(i=>lastOpenedAt[i]===undefined||
  now-lastOpenedAt[i]>=minimumDischarge);
 if(step===undefined)
  return {selected:current,action:"wait-discharge",step:null,lastSwitchAt,lastOpenedAt:[...lastOpenedAt]};
 return {selected:[...current,step].sort((a,b)=>a-b),action:"close",step,
  lastSwitchAt:now,lastOpenedAt:[...lastOpenedAt]};
}

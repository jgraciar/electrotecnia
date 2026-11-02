// Prueba independiente del promedio temporal, NO valida el modelo CircuitJS.
// Ejecutar: node tests/wattmeter-average.test.js
const assert=require('node:assert/strict');
function avg(samples,start,end){
  let area=0;
  for(let i=1;i<samples.length;i++){
    const a=samples[i-1],b=samples[i];
    if(b.t<=start)continue;
    const t0=Math.max(start,a.t);
    const p0=a.p+(b.p-a.p)*(t0-a.t)/(b.t-a.t);
    area+=(p0+b.p)*(b.t-t0)/2;
  }
  return area/(end-start);
}
const f=50,dt=0.00001,T=0.1,N=Math.round(T/dt),Vr=230;
function check(label,fn,target,tol){
  const samples=Array.from({length:N+1},(_,k)=>{const t=k*dt;return {t,p:fn(t)};});
  const result=avg(samples,0,T);
  assert.ok(Math.abs(result-target)<=tol,label+': '+result+' W, referencia '+target+' W');
  console.log('OK '+label+': '+result.toFixed(5)+' W');
}
check('CC 24 V 12 ohm',()=>48,48,0.01);
check('CA R 100 ohm',t=>2*Vr**2/100*Math.sin(2*Math.PI*f*t)**2,529,0.01);
const R=100,L=0.31831,w=2*Math.PI*f,X=w*L,Z=Math.hypot(R,X),phi=Math.atan2(X,R);
check('CA RL',t=>2*Vr**2/Z*Math.sin(w*t)*Math.sin(w*t-phi),Vr**2*R/Z**2,0.01);
const C=10e-6;
check('CA C ideal',t=>2*Vr**2*w*C*Math.sin(w*t)*Math.cos(w*t),0,0.01);
check('Polaridad inversa CC',()=>-48,-48,0.01);

// Prueba de integración numérica independiente de CircuitJS para dos vatímetros.
const assert=require('node:assert/strict');
const f=60,omega=2*Math.PI*f,T=0.1,dt=1/60000;
function mean(fn){
  let sum=0;
  for(let k=0;k<Math.round(T/dt);k++){
    const t=k*dt;
    sum+=(fn(t)+fn(t+dt))*dt/2;
  }
  return sum/T;
}
function check(label,w1,w2,expected,tolerance=0.03){
  const a=mean(w1),b=mean(w2);
  assert.ok(Math.abs(a+b-expected)<tolerance,label+': W1='+a+', W2='+b+', total='+a+b+', esperado='+expected);
  console.log('OK '+label+': W1='+a.toFixed(3)+' W, W2='+b.toFixed(3)+' W, total='+(a+b).toFixed(3)+' W');
}
// Para carga trifásica equilibrada resistiva: Ptotal=3*Vfase^2/R.
const V=120,R=100,I=V/R;
const phase=(t,shift)=>Math.SQRT2*V*Math.sin(omega*t+shift);
const current=(t,shift)=>Math.SQRT2*I*Math.sin(omega*t+shift);
const w1=t=>(phase(t,2*Math.PI/3)-phase(t,0))*current(t,2*Math.PI/3);
const w2=t=>(phase(t,-2*Math.PI/3)-phase(t,0))*current(t,-2*Math.PI/3);
check('Aron trifásico equilibrado resistivo',w1,w2,3*V*V/R);
check('Aron con polaridad invertida',t=>-w1(t),t=>-w2(t),-3*V*V/R);
console.log('AVISO: prueba matemática independiente; no acredita funcionamiento del motor CircuitJS.');

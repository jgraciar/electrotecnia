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

// Carga equilibrada R-L: potencia total = 3 V I cos(phi).
const phi=Math.PI/3;
const lagged=(t,shift)=>Math.SQRT2*I*Math.sin(omega*t+shift-phi);
check('Aron trifásico equilibrado inductivo',t=>(phase(t,2*Math.PI/3)-phase(t,0))*lagged(t,2*Math.PI/3),
  t=>(phase(t,-2*Math.PI/3)-phase(t,0))*lagged(t,-2*Math.PI/3),3*V*I*Math.cos(phi));
// Una lectura debe ser negativa si el desfase de la carga supera 60 grados.
const phiHigh=75*Math.PI/180;
const lagHigh=(t,shift)=>Math.SQRT2*I*Math.sin(omega*t+shift-phiHigh);
const high1=t=>(phase(t,2*Math.PI/3)-phase(t,0))*lagHigh(t,2*Math.PI/3);
const high2=t=>(phase(t,-2*Math.PI/3)-phase(t,0))*lagHigh(t,-2*Math.PI/3);
check('Aron con factor de potencia bajo',high1,high2,3*V*I*Math.cos(phiHigh));
assert.ok(mean(high1)*mean(high2)<0,'Se esperaba un vatímetro con lectura negativa');
// Caso de tres hilos desequilibrado: iA+iB+iC=0.
// La suma de los vatímetros debe coincidir con la potencia instantánea de las tres fases.
const ia=t=>1.3*Math.sin(omega*t-.3);
const ib=t=>.8*Math.sin(omega*t+2.1);
const ic=t=>-ia(t)-ib(t);
const p3=t=>phase(t,0)*ia(t)+phase(t,2*Math.PI/3)*ib(t)+phase(t,-2*Math.PI/3)*ic(t);
const wa=t=>(phase(t,0)-phase(t,-2*Math.PI/3))*ia(t);
const wb=t=>(phase(t,2*Math.PI/3)-phase(t,-2*Math.PI/3))*ib(t);
check('Aron desequilibrado de tres hilos',wa,wb,mean(p3));
console.log('AVISO: prueba matemática independiente; no acredita funcionamiento del motor CircuitJS.');

"use strict";
/* Electrotecnia · Paraninfo 7.ª ed. (2022).
 * SOLO actividades reales extraídas del ejemplar aportado, NO ejercicios parametrizados.
 * Las magnitudes eléctricas se comprueban con instrumentos del CircuitJS integrado.
 */
(function(){
  "use strict";
  const HEADER="$ 1 0.000005 10 60 5.0 50";
  const decimal=x=>Number(x).toPrecision(12);
  // Opciones reales de los aparatos CircuitJS: 0=automática, 1=A/V,
  // 2=mA/mV, 3=µA/µV. Estas opciones afectan solo a la presentación,
  // nunca a la magnitud que mide el instrumento.
  function meterScale(value){
    const abs=Math.abs(value);
    return abs>=1 ? 1 : abs>=0.001 ? 2 : 3;
  }
  function meterUnit(value,kind){
    const scale=meterScale(value);
    const base=kind==="current"?"A":"V";
    return (scale===1?"":scale===2?"m":"µ")+base;
  }
  function circuit({v,r,watt=false}){
    // Modelo equivalente resistivo en CC. Para consumidores en CA puramente
    // resistivos, reproduce los valores eficaces U/I y la potencia media,
    // NO la variación instantánea sinusoidal.
    const currentScale=meterScale(v/r);
    const voltageScale=meterScale(v);
    const top=["v 96 352 96 96 0 0 40 "+decimal(v)+" 0",
      "w 96 96 144 96 0",
      "370 144 96 208 96 3 0 "+currentScale];
    if(watt){
      top.push("w 208 96 272 96 0","420 272 96 368 96 0 80 1",
        "g 272 16 272 -8 0","w 368 96 400 96 0",
        "r 400 96 400 352 0 "+decimal(r),
        "w 400 352 96 352 0","w 400 96 528 96 0",
        "p 528 96 528 352 3 0 "+voltageScale+" 0",
        "w 528 352 400 352 0");
    }else{
      top.push("w 208 96 384 96 0","r 384 96 384 352 0 "+decimal(r),
        "w 384 352 96 352 0","w 384 96 528 96 0",
        "p 528 96 528 352 3 0 "+voltageScale+" 0",
        "w 528 352 384 352 0");
    }
    top.push("g 96 352 96 376 0");
    return [HEADER,...top].join("\n")+"\n";
  }
  const q=(label,value,unit,formula,tolerance=0.005)=>
    ({label,value,unit,formula,tolerance:Math.max(tolerance,Math.abs(value)*0.005)});
  const page=p=>p+26;
  const ref=(unit,number,title,statement,questions,config={})=>({
    unit,kind:"resuelta",number,bookPage:config.bookPage||config.page,
    pdfPage:page(config.page),title:"Actividad resuelta "+unit+"."+number+" · "+title,
    statement,questions,
    circuit:config.circuit||null,
    meterScales:config.meterScales||null,
    measured:config.measured||[],
    scope:config.scope||"Sin circuito eléctrico único en el enunciado: se mantienen los datos del libro sin inventar tensión, corriente ni resistencia.",
    energyHours:config.energyHours??null,
    tariff:config.tariff??null,
    powerGiven:config.powerGiven??null,
    notes:config.notes||""
  });
  const load=(u,r)=>({circuit:circuit({v:u,r,watt:true}),
    meterScales:{
      current:meterUnit(u/r,"current"),
      voltage:meterUnit(u,"voltage"),
      power:Math.abs(u*u/r)>=1000?"kW":"W"
    },
    measured:[
      {label:"Amperímetro A1",type:"current",value:u/r,unit:"A"},
      {label:"Voltímetro V1",type:"voltage",value:u,unit:"V"},
      {label:"Vatímetro W1",type:"power",value:u*u/r,unit:"W"}
    ],scope:"Modelo CC equivalente de receptor óhmico a tensión eficaz nominal. Los valores de U, I y P son comparables al caso resistivo de CA, pero la forma de onda no es alterna."
  });
  function seriesCircuit(v,r1,r2){
    const i=v/(r1+r2);
    return [HEADER,"v 96 352 96 96 0 0 40 "+decimal(v)+" 0",
      "w 96 96 144 96 0","370 144 96 208 96 3 0 "+meterScale(i),
      "w 208 96 272 96 0","r 272 96 400 96 0 "+decimal(r1),
      "r 400 96 528 96 0 "+decimal(r2),
      "w 528 96 528 352 0","w 528 352 96 352 0",
      "p 272 96 272 352 3 0 "+meterScale(v)+" 0",
      "w 272 352 96 352 0","p 400 96 400 352 3 0 "+meterScale(v)+" 0",
      "w 400 352 528 352 0","g 96 352 96 376 0"].join("\n")+"\n";
  }
  function threeSeriesCircuit(v,r1,r2,r3){
    const i=v/(r1+r2+r3);
    return [HEADER,"v 96 352 96 96 0 0 40 "+decimal(v)+" 0",
      "w 96 96 144 96 0","370 144 96 208 96 3 0 "+meterScale(i),
      "w 208 96 272 96 0","r 272 96 400 96 0 "+decimal(r1),
      "r 400 96 528 96 0 "+decimal(r2),
      "r 528 96 656 96 0 "+decimal(r3),
      "w 656 96 656 352 0","w 656 352 96 352 0",
      "p 400 96 400 352 3 0 "+meterScale(v)+" 0",
      "w 400 352 96 352 0","g 96 352 96 376 0"].join("\n")+"\n";
  }
  function parallelCircuit(v,r1,r2){
    const i=v/r1+v/r2;
    return [HEADER,"v 96 352 96 96 0 0 40 "+decimal(v)+" 0",
      "w 96 96 144 96 0","370 144 96 208 96 3 0 "+meterScale(i),
      "w 208 96 304 96 0","w 304 96 496 96 0",
      "r 304 96 304 352 0 "+decimal(r1),
      "r 496 96 496 352 0 "+decimal(r2),
      "w 496 352 304 352 0","w 304 352 96 352 0",
      "w 496 96 624 96 0","p 624 96 624 352 3 0 "+meterScale(v)+" 0",
      "w 624 352 496 352 0","g 96 352 96 376 0"].join("\n")+"\n";
  }
  const entries=[
    ref(6,6,"Dos resistencias en paralelo",
      "A una pila de 9 V se conectan en paralelo dos resistencias de 6 Ω y 2 Ω. Calcula resistencia equivalente, corrientes de rama y total, y potencias individuales y total.",
      [q("Resistencia equivalente",1.5,"Ω","Req=1/(1/6+1/2)=1,5 Ω"),
       q("Corriente en 6 Ω",1.5,"A","I1=9/6=1,5 A"),
       q("Corriente en 2 Ω",4.5,"A","I2=9/2=4,5 A"),
       q("Corriente total",6,"A","I=1,5+4,5=6 A"),
       q("Potencia en 6 Ω",13.5,"W","P1=9·1,5=13,5 W"),
       q("Potencia en 2 Ω",40.5,"W","P2=9·4,5=40,5 W"),
       q("Potencia total",54,"W","P=9·6=54 W")],
      {page:81,circuit:parallelCircuit(9,6,2),
       meterScales:{current:"A",voltage:"V",power:"W"},
       measured:[{label:"Amperímetro de alimentación",type:"current",value:6,unit:"A"},
         {label:"Voltímetro de ramas",type:"voltage",value:9,unit:"V"}],
       scope:"Dos ramas resistivas en paralelo con amperímetro total y voltímetro común."}),

    ref(6,4,"Resistencia limitadora de una lámpara",
      "Una lámpara incandescente de 110 V y 40 W se alimenta desde 230 V mediante una resistencia en serie. Calcula el valor de la resistencia y la potencia que disipa.",
      [q("Intensidad nominal",40/110,"A","I=40/110≈0,363636 A"),
       q("Caída en la resistencia",120,"V","UR=230−110=120 V"),
       q("Resistencia limitadora",330,"Ω","R=120/(40/110)=330 Ω"),
       q("Potencia disipada",120*40/110,"W","P=120·(40/110)≈43,636 W")],
      {page:78,circuit:seriesCircuit(230,330,110**2/40),
       meterScales:{current:"A",voltage:"V",power:"W"},
       measured:[{label:"Amperímetro",type:"current",value:40/110,unit:"A"},
         {label:"Voltímetro de alimentación",type:"voltage",value:230,unit:"V"},
         {label:"Voltímetro de lámpara",type:"voltage",value:110,unit:"V"}],
       notes:"La solución editorial redondea I a 0,36 A y obtiene 333 Ω y 43,2 W. Sin redondeo intermedio se obtienen 330 Ω y 43,64 W.",
       scope:"Modelo resistivo nominal. La lámpara se representa por su resistencia a 110 V."}),

    ref(6,2,"Caídas de tensión en tres resistencias en serie",
      "En tres resistencias en serie de 20 Ω, 10 Ω y 30 Ω se miden 100 V en la segunda. Calcula intensidad, tensión y potencia de cada resistencia y del conjunto.",
      [q("Intensidad",10,"A","I=100/10=10 A"),
       q("Tensión R1",200,"V","U1=20·10=200 V"),
       q("Tensión R2",100,"V","U2=10·10=100 V"),
       q("Tensión R3",300,"V","U3=30·10=300 V"),
       q("Tensión total",600,"V","U=200+100+300=600 V"),
       q("Potencia R1",2000,"W","P1=200·10=2.000 W"),
       q("Potencia R2",1000,"W","P2=100·10=1.000 W"),
       q("Potencia R3",3000,"W","P3=300·10=3.000 W"),
       q("Potencia total",6000,"W","P=600·10=6.000 W")],
      {page:77,circuit:threeSeriesCircuit(600,20,10,30),
       meterScales:{current:"A",voltage:"V",power:"kW"},
       measured:[{label:"Amperímetro",type:"current",value:10,unit:"A"},
         {label:"Voltímetro R1+R2",type:"voltage",value:300,unit:"V"}],
       scope:"La fuente equivalente es 600 V, deducida de la lectura de 100 V en R2. El voltímetro del circuito mide 300 V en R1+R2."}),
    ref(6,3,"Lámparas idénticas conectadas en serie",
      "Lámparas de 115 V y 40 W conectadas a una red de 230 V. Calcula cuántas lámparas conectar en serie, intensidad, potencia total, resistencia de cada lámpara y equivalente.",
      [q("Número de lámparas",2,"lámparas","n=230/115=2"),
       q("Intensidad",80/230,"A","I=80/230≈0,347826 A"),
       q("Potencia total",80,"W","P=2·40=80 W"),
       q("Resistencia por lámpara",115**2/40,"Ω","R=115²/40=330,625 Ω"),
       q("Resistencia equivalente",2*115**2/40,"Ω","Req=2·330,625=661,25 Ω")],
      {page:78,circuit:seriesCircuit(230,115**2/40,115**2/40),
       meterScales:{current:"A",voltage:"V",power:"W"},
       measured:[{label:"Amperímetro",type:"current",value:80/230,unit:"A"},
         {label:"Voltímetro de alimentación",type:"voltage",value:230,unit:"V"},
         {label:"Voltímetro de segunda lámpara",type:"voltage",value:115,unit:"V"}],
       notes:"Se emplea la resistencia nominal a 115 V. El redondeo editorial de I a 0,35 A altera ligeramente el valor de R.",
       scope:"Modelo óhmico nominal de dos lámparas idénticas en serie; no simula la variación de resistencia del filamento con la temperatura."}),

    ref(6,1,"Dos resistencias en serie",
      "Batería de 24 V con resistencias de 20 Ω y 10 Ω en serie. Determina la corriente, las tensiones parciales, las potencias individuales y la potencia total (referencia: actividad resuelta 6.1, página 77).",
      [q("Resistencia equivalente",30,"Ω","R=20+10=30 Ω"),
       q("Intensidad",0.8,"A","I=24/30=0,8 A"),
       q("Tensión en R1",16,"V","U1=0,8·20=16 V"),
       q("Tensión en R2",8,"V","U2=0,8·10=8 V"),
       q("Potencia en R1",12.8,"W","P1=16·0,8=12,8 W"),
       q("Potencia en R2",6.4,"W","P2=8·0,8=6,4 W"),
       q("Potencia total",19.2,"W","P=24·0,8=19,2 W")],
      {page:77,circuit:seriesCircuit(24,20,10),
       meterScales:{current:"A",voltage:"V",power:"W"},
       measured:[{label:"Amperímetro A1",type:"current",value:0.8,unit:"A"},
         {label:"Voltímetro de alimentación",type:"voltage",value:24,unit:"V"},
         {label:"Voltímetro de R2",type:"voltage",value:8,unit:"V"}],
       scope:"Resistencias en serie; el voltímetro de la izquierda mide 24 V y el de la derecha mide 8 V. La caída de 16 V en R1 se obtiene por diferencia. Potencias calculadas."}),

    ref(2,1,"Ley de Ohm",
      "Calcula la intensidad que circula por el filamento de una lámpara incandescente de 10 Ω de resistencia, cuando está sometida a una tensión de 12 V.",
      [q("Intensidad del filamento",1.2,"A","I=U/R=12/10=1,2 A")],
      {...load(12,10),page:24}),
    ref(2,2,"Resistencia de una lámpara",
      "Se quiere determinar la resistencia eléctrica del filamento de una lámpara incandescente. Para ello, se somete a la lámpara a una tensión de 230 V y, mediante un amperímetro intercalado en serie, se mide el paso de una intensidad de corriente de 0,2 A (Figura 2.8).",
      [q("Resistencia del filamento",1150,"Ω","R=U/I=230/0,2=1.150 Ω")],
      {...load(230,1150),page:24}),
    ref(3,3,"Potencia de un horno",
      "Calcula la potencia que consume un horno eléctrico si se conecta a una tensión de 230 V y su resistencia es de 50 Ω.",
      [q("Intensidad del horno",4.6,"A","I=230/50=4,6 A"),
       q("Potencia consumida",1058,"W","P=230·4,6=1.058 W")],
      {...load(230,50),page:38}),
    ref(3,5,"Resistencia de caldeo",
      "La placa de características de una plancha eléctrica indica que su potencia es de 500 W y su corriente nominal de 4 A. Calcula el valor de la resistencia de caldeo.",
      [q("Tensión nominal",125,"V","U=P/I=500/4=125 V"),
       q("Resistencia de caldeo",31.25,"Ω","R=U/I=125/4=31,25 Ω")],
      {...load(125,31.25),page:39}),
    ref(3,6,"Tensión de un horno",
      "Se dispone de una resistencia calefactora para un horno eléctrico de la que solo se conoce su potencia de trabajo, 700 W, y el valor óhmico de la misma, 75,6 Ω. ¿A qué tensión se podrá conectar el horno para que funcione correctamente?",
      [q("Tensión de alimentación",Math.sqrt(700*75.6),"V","U=√(P·R)=√(700·75,6)≈230 V",0.1)],
      {...load(230,75.6),page:39,notes:"La solución editorial redondea 230,043 V a 230 V: el vatímetro de la simulación indicará 699,735 W, diferencia debida al redondeo."}),
    ref(3,9,"Energía eléctrica",
      "Calcula la energía, en kWh y julios, consumidos por un calefactor de 500 W en 8 horas de funcionamiento.",
      [q("Energía",4,"kWh","E=0,5 kW·8 h=4 kWh"),
       q("Energía en julios",14400000,"J","E=500 W·(8·3.600 s)=14.400.000 J")],
      {page:40,powerGiven:500,energyHours:8,
       notes:"Errata del solucionario: donde figura 28.000 s debe decir 28.800 s; el resultado final de 14,4 MJ es correcto."}),
    ref(3,10,"Gasto bimensual",
      "Se quiere determinar el gasto bimensual de un calefactor de 500 W, que funciona, por término medio, 4 horas al día. Precio del kWh: 0,09 €.",
      [q("Energía en 60 días",120,"kWh","E=0,5 kW·(60·4 h)=120 kWh"),
       q("Coste bimensual",10.8,"€","Gasto=120 kWh·0,09 €/kWh=10,80 €")],
      {page:40,powerGiven:500,energyHours:240,tariff:0.09}),
    ref(4,1,"Calor por efecto Joule",
      "Calcula el calor desprendido por un horno eléctrico de 2.000 W en 5 minutos de funcionamiento.",
      [q("Energía eléctrica",600000,"J","E=2.000 W·(5·60 s)=600.000 J"),
       q("Calor",144000,"cal","Q=0,24·E=144.000 cal=144 kcal")],
      {page:48,powerGiven:2000,energyHours:5/60,
       notes:"Se emplea el factor editorial aproximado de 0,24 cal/J."}),
    ref(4,4,"Termo eléctrico",
      "Determina la potencia que deberá tener un termo eléctrico de agua para calentar un depósito de 50 litros en 1 hora. El agua entra a 12 ºC y se desea calentarla hasta 60 ºC. Calcula también el valor óhmico de la resistencia de caldeo para una tensión de 230 V (Figura 4.1).",
      [q("Calor necesario",2400000,"cal","Q=50.000 g·1 cal/(g·°C)·(60−12)°C=2.400.000 cal"),
       q("Potencia necesaria",10000000/3600,"W","E=Q/0,24=10.000.000 J; P=E/3.600≈2.778 W",2),
       q("Resistencia de caldeo",230*230/(10000000/3600),"Ω","R=230²/(10.000.000/3.600)≈19 Ω",0.1)],
      {...load(230,230*230/(10000000/3600)),page:49,energyHours:1,
       notes:"El libro usa 0,24 cal/J y redondea a 2,8 kW y 19 Ω. No representa el calentamiento dinámico del agua ni las pérdidas térmicas."}),
    ref(4,5,"Coste de funcionamiento del termo",
      "Averigua cuál será el coste de la energía de la Actividad resuelta 4.4 si el precio del kWh es de 0,088 €.",
      [q("Energía redondeada en el libro",2.8,"kWh","E≈2,8 kW·1 h=2,8 kWh",0.03),
       q("Gasto energético",0.25,"€","Gasto≈2,8·0,088=0,2464 €≈0,25 €",0.01)],
      {...load(230,230*230/(10000000/3600)),page:49,energyHours:1,tariff:0.088,
       notes:"El libro redondea previamente la potencia a 2,8 kW. Sin ese redondeo: E≈2,7778 kWh y gasto≈0,2444 €, que puede redondearse a 0,24 €."}),
    ref(4,6,"Calor de una plancha",
      "Determina el aumento de temperatura que experimentará una plancha eléctrica de acero si se la calienta mediante una resistencia de caldeo de 10 ohmios a 125 V durante 10 minutos. La plancha posee una masa de 7 kg y se supone que se pierde un 25 % del calor generado.",
      [q("Intensidad eléctrica",12.5,"A","I=125/10=12,5 A"),
       q("Calor eléctrico",225000,"cal","Q=0,24·10·(12,5)²·600=225.000 cal"),
       q("Aumento de temperatura",168750/(7000*0.11),"°C","ΔT=(225.000·0,75)/(7.000·0,11)≈219 °C",1)],
      {...load(125,10),page:49,energyHours:1/6,
       notes:"Calor útil del 75 %: 168.750 cal; calor específico acero 0,11 cal/(g·°C). Falstad mide la potencia eléctrica, no simula las pérdidas térmicas."})
  ];
  const table=new Map(entries.map(e=>[[e.unit,e.kind,e.number].join(":"),e]));
  const get=a=>table.get([Number(a.unit),a.kind,Number(a.number)].join(":"));
  const fmtSteps=[
    "Identifica el dato y la magnitud solicitada en el enunciado de Paraninfo.",
    "Calcula la solución manualmente antes de mostrar el desarrollo.",
    "Si existe circuito, contrasta en Falstad el amperímetro, voltímetro y vatímetro.",
    "Distingue la medida instrumental de las magnitudes calculadas (tiempo, calor y tarifa)."
  ];
  function build(a){
    const e=get(a);if(!e)return null;
    return {...e,id:"PN-"+e.unit+"-"+e.kind+"-"+e.number,
      reference:a.id||("Actividad resuelta "+e.unit+"."+e.number),
      warning:e.circuit?
        "Enunciado y datos originales. Circuito equivalente para contrastar medidas; no representa fenómenos térmicos ni el filamento real.":
        "Enunciado original. No existe circuito eléctrico único con los datos proporcionados: solo cálculo de las magnitudes especificadas.",
      steps:fmtSteps};
  }
  window.LabTextbookExercises={
    build,has:a=>Boolean(get(a)),
    unitsSupported:[...new Set(entries.map(e=>e.unit))],
    totalCatalogued:entries.length,
    validate(a){
      const e=build(a);if(!e)return false;
      const good=e.questions.length>0&&e.questions.every(x=>Number.isFinite(x.value));
      return good && (!e.circuit || (e.circuit.startsWith("$ ")&&e.circuit.includes("370 ")&&e.circuit.includes("\np ")));
    }
  };
})();

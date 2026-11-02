"use strict";
// Inventario de localizadores bibliográficos contrastados en el ejemplar
// de Electrotecnia de Paraninfo 7a edición. No reproduce ejercicios.
// Los títulos de las prácticas de laboratorio son descriptores breves y propios.
(() => {
  const book=window.LabPublications?.find(x=>x.id==="paraninfo-electrotecnia-2022");
  if(!book)return;
  const loc={"1":{"practica":{"18":"1-2"},"comprobacion":{"19":"1-10"},"ampliacion":{"19":"1-2","20":"3"},"experimental":{"6":"1","10":"2","17":"4"}},"2":{"practica":{"33":"1-3"},"comprobacion":{"34":"1-16"},"ampliacion":{"35":"1","36":"2"},"propuesta":{"25":"1","27":"2","29":"3"},"experimental":{"27":"2"}},"3":{"practica":{"43":"1-2"},"comprobacion":{"44":"1-10"},"ampliacion":{"45":"1-3"},"propuesta":{"40":"1"}},"4":{"comprobacion":{"58":"1-12"},"evaluacion":{"59":"1-4"},"ampliacion":{"59":"1-2"},"propuesta":{"52":"1","56":"2","57":"3"}},"5":{"practica":{"72":"1"},"comprobacion":{"73":"1-14","74":"15-19"},"experimental":{"65":"1"}},"6":{"practica":{"87":"1-3"},"comprobacion":{"88":"1-13","89":"14-16"},"evaluacion":{"89":"1-2","90":"3-4"},"propuesta":{"80":"1","82":"2","86":"3"}},"7":{"practica":{"104":"1"},"comprobacion":{"105":"1-6"},"evaluacion":{"106":"1-5","107":"6-11","108":"12-13"},"propuesta":{"95":"1","98":"2"}},"8":{"practica":{"126":"1-4"},"comprobacion":{"127":"1-14","128":"15-17"},"propuesta":{"113":"1","120":"2"},"experimental":{"110":"1"}},"9":{"practica":{"140":"1-2"},"comprobacion":{"141":"1-13","142":"14-16"},"evaluacion":{"142":"1-5","143":"6-8"},"ampliacion":{"143":"1-3","144":"4"},"propuesta":{"139":"1-2"}},"10":{"practica":{"160":"1-2"},"comprobacion":{"161":"1-11","162":"12"},"evaluacion":{"162":"1-3","163":"4-5"},"ampliacion":{"163":"1","164":"2"},"propuesta":{"156":"1"},"experimental":{"146":"1"}},"11":{"practica":{"181":"1-3"},"comprobacion":{"182":"1-4","183":"5-10"},"evaluacion":{"184":"1-2"},"propuesta":{"176":"1-3"}},"12":{"practica":{"198":"1-2"},"comprobacion":{"200":"1-13","201":"14-18"},"ampliacion":{"201":"1"}},"13":{"practica":{"219":"1-2"},"comprobacion":{"220":"1-14"},"evaluacion":{"221":"1-5","222":"6-9"},"ampliacion":{"222":"1-2"},"propuesta":{"212":"1","217":"2"}},"14":{"practica":{"235":"1-2"},"comprobacion":{"235":"1-2","236":"3-15","237":"16-17"},"evaluacion":{"237":"1-7","238":"8-13","239":"14-18","240":"19-24"},"propuesta":{"226":"1","231":"2","232":"3"}},"15":{"practica":{"261":"1-2"},"comprobacion":{"262":"1-15","263":"16-19"},"evaluacion":{"263":"1-3","264":"4-11"},"propuesta":{"256":"1-2"}},"16":{"practica":{"290":"1-12","291":"13-16"},"comprobacion":{"292":"1-15","293":"16-23"},"evaluacion":{"293":"1-2","294":"3-4"},"ampliacion":{"294":"1-2"}},"17":{"practica":{"309":"1"},"comprobacion":{"310":"1-15"},"propuesta":{"308":"1"}},"18":{"practica":{"335":"1-5"},"comprobacion":{"336":"1-13","337":"14-20"},"evaluacion":{"337":"1-2","338":"3-7"},"propuesta":{"326":"1","332":"2"},"experimental":{"313":"1"}},"19":{"practica":{"360":"1-7"},"comprobacion":{"361":"1-14","362":"15-19"},"evaluacion":{"362":"1-5"},"propuesta":{"357":"1-2"}},"20":{"practica":{"390":"1-8"},"comprobacion":{"391":"1-16","392":"17-18"},"evaluacion":{"392":"1-2"},"ampliacion":{"392":"1-3"},"propuesta":{"374":"1","375":"2"}},"21":{"practica":{"419":"1-3"},"comprobacion":{"420":"1-13","421":"14-23"},"ampliacion":{"422":"1-4"},"propuesta":{"410":"1","411":"2"}}};
  const workedExamples={"1":{"8":"1","14":"2"},"2":{"24":"1-3","25":"4","26":"5,7-8","28":"9-11"},"3":{"38":"1-4","39":"5-8","40":"9-10","41":"11"},"4":{"48":"1-2","49":"3-6","50":"7-8","52":"9-10","53":"11","54":"12","55":"13-14","56":"15"},"5":{"65":"1","67":"2"},"6":{"77":"1-2","78":"3-4","79":"5","81":"6-7","82":"8","83":"9","84":"10","85":"11-12"},"7":{"94":"2-3","95":"4","96":"5","97":"6","99":"8","100":"9"},"8":{"113":"1","114":"2","117":"3","118":"4","119":"5-6"},"9":{"131":"1","132":"2","133":"3","137":"4-5","138":"6-7","139":"8-9"},"10":{"150":"1-2","151":"3-4","152":"5","153":"6","154":"7","155":"8","156":"9","157":"10-11"},"11":{"168":"1-2","175":"4-5","178":"6","180":"7"},"12":{"189":"1-3","190":"4-7","191":"8","192":"9","195":"10","197":"11"},"13":{"205":"1","207":"3","208":"4","209":"5-6","210":"7","212":"8","215":"9-10","218":"11"},"14":{"225":"1","227":"2","229":"3-4","230":"5","231":"6","233":"7","234":"8"},"15":{"245":"1","246":"2","247":"3-4","249":"5","250":"6-7","251":"8","252":"9","253":"10","255":"11"},"16":{"266":"1-4","269":"5","272":"6","273":"7","274":"8","275":"9","276":"10","278":"11","280":"12","283":"13","289":"14-15"},"17":{"298":"1-2","307":"3"},"18":{"314":"1-2","315":"3-4","316":"5","318":"6","321":"7","322":"8","323":"9","324":"10","325":"11","326":"12","330":"13","331":"14"},"19":{"351":"1-2","352":"3-5","355":"6","356":"7"},"20":{"366":"1-4","369":"5","371":"6","372":"7","373":"8-9","389":"10"},"21":{"397":"1","404":"2-4"}};
  for(const [unit,pages] of Object.entries(workedExamples))loc[unit].resuelta=pages;
  const practicalTopics={"5.1":"Comportamiento de un motor frente a la carga","6.1":"Medidas eléctricas en un circuito serie","6.2":"Medidas eléctricas en un circuito paralelo","6.3":"Medidas eléctricas en un circuito mixto","7.1":"Estudio experimental de circuitos de varias mallas","8.1":"Pila electroquímica elemental","8.2":"Asociación de pilas y acumuladores en serie","8.3":"Asociación de pilas y acumuladores en paralelo","8.4":"Verificación eléctrica de un panel fotovoltaico","9.1":"Identificación y medida de condensadores","9.2":"Carga y descarga de condensadores","10.1":"Propiedades de imanes y electroimanes","10.2":"Dispositivos electromagnéticos","11.1":"Experiencia de inducción de Faraday","11.2":"Inducción electromagnética entre circuitos próximos","11.3":"Fuerza sobre un conductor con corriente","12.1":"Osciloscopio y señal alterna senoidal","12.2":"Desfase en receptores inductivos y capacitivos","13.1":"Estudio experimental de circuitos RLC","13.2":"Corrección del factor de potencia","14.1":"Respuesta de un circuito oscilante","14.2":"Resonancia en un circuito serie","15.1":"Tensiones y corrientes de fase y de línea","15.2":"Medida mediante analizador trifásico","16.1":"Identificación de instrumentos de medida","16.2":"Medida de intensidad con derivación shunt","16.3":"Amperímetro con transformador de intensidad","16.4":"Voltímetro con transformador de tensión","16.5":"Uso del multímetro","16.6":"Vatímetro con transformadores de medida","16.7":"Medida de potencia reactiva","16.8":"Medida del factor de potencia","16.9":"Vatímetro trifásico","16.10":"Contador de energía trifásico","16.11":"Medida de frecuencia","16.12":"Manejo del fasímetro","16.13":"Medida resistiva por puente","16.14":"Medida de resistencia de aislamiento","16.15":"Medida de puesta a tierra con telurómetro","16.16":"Manejo del osciloscopio","17.1":"Análisis de tecnologías de lámparas","18.1":"Ensayo de vacío monofásico","18.2":"Ensayo de cortocircuito monofásico","18.3":"Ensayo de vacío trifásico","18.4":"Ensayo de cortocircuito trifásico","18.5":"Regulación y caída de tensión del transformador","19.1":"Constitución de una máquina de corriente continua","19.2":"Ensayos de una dinamo con excitación independiente","19.3":"Dinamos serie y derivación","19.4":"Corriente de arranque de motor de corriente continua","19.5":"Inversión de giro de motor de corriente continua","19.6":"Curvas de motor de excitación en derivación","19.7":"Curvas de motores serie e independiente","20.1":"Constitución de alternador trifásico","20.2":"Constitución de motores de corriente alterna","20.3":"Arranque directo de motor asíncrono","20.4":"Inversión de giro de motor asíncrono","20.5":"Arranque estrella-triángulo","20.6":"Ensayo del motor asíncrono","20.7":"Regulación de velocidad de motor asíncrono","20.8":"Arranque de motor monofásico de inducción","21.1":"Las cinco reglas de oro","21.2":"Seguridad eléctrica en el aula-taller","21.3":"Equipos de protección individual"};
  const types={
    practica:"Práctica",
    resuelta:"Actividad resuelta",
    comprobacion:"Actividad de comprobación",
    evaluacion:"Evaluación resuelta",
    ampliacion:"Actividad de ampliación",
    propuesta:"Actividad propuesta",
    experimental:"Actividad experimental"
  };
  function parseRanges(text){
    const numbers=[];
    text.split(",").forEach(section=>{
      const [from,to]=section.split("-").map(Number);
      const high=Number.isFinite(to)?to:from;
      for(let n=from;n<=high;n++)numbers.push(n);
    });
    return numbers;
  }
  const original=new Map(book.numberedActivities.map(a=>[a.id,a]));
  for(const [unitNo,groups] of Object.entries(loc)){
    const unit=book.units.find(x=>x.number===Number(unitNo));
    if(!unit)continue;
    for(const [type,byPage] of Object.entries(groups)){
      for(const [page,ranges] of Object.entries(byPage)){
        for(const n of parseRanges(ranges)){
          const code=unitNo+"."+n, id=types[type]+" "+code;
          const existing=original.get(id);
          const entry={
            unit:Number(unitNo),id,page:Number(page),
            kind:type,number:n,
            theme:type==="practica"?(practicalTopics[code]||unit.title):
              (type==="experimental"?"Experiencia sobre "+unit.title:unit.title),
            practiceCode:existing?.practiceCode||null,
            status:"referencia bibliográfica localizada"
          };
          if(existing)Object.assign(existing,entry);
          else original.set(id,entry);
        }
      }
    }
  }
  // Correspondencias de actividades resueltas de UD06, contrastadas con
  // Unidad 06 - Circuitos serie, paralelo y mixto - CE_optativos.pdf.
  // Catalogación curricular: NO implica que exista una simulación funcional.
  const u6={
    1:["1d","1g","1h"],2:["1d","1h"],3:["1d","1g","1h"],
    4:["1d","1h"],5:["1d","1g","1h"],6:["1d","1g","1h"],
    7:["1h"],8:["1g","1h"],9:["1d","1g","1h"],
    10:["1d","1g","1h"],11:["1d","1g","1h"],12:["1d","1g","1h"]
  };
  for(const [number,ce] of Object.entries(u6)){
    const activity=original.get("Actividad resuelta 6."+number);
    if(activity){
      activity.ce=ce;
      activity.curriculumCharacter="Necesario";
      activity.curriculumStatus="CE contrastados con UD06 CE_optativos; circuito no implementado";
    }
  }
  const sortType={resuelta:0,propuesta:1,experimental:2,practica:3,comprobacion:4,evaluacion:5,ampliacion:6};
  book.numberedActivities=[...original.values()].sort((a,b)=>
    a.unit-b.unit||(sortType[a.kind]??8)-(sortType[b.kind]??8)||a.number-b.number);
  book.status="Catalogadas individualmente las referencias numeradas de las 21 unidades del libro, con tipos y páginas de la edición impresa.";
  book.activitiesCatalogued=book.numberedActivities.length;
})();

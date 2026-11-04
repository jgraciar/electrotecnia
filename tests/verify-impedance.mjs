import assert from "node:assert/strict";
import {chromium} from "playwright";

const browser=await chromium.launch({headless:true});
const page=await browser.newPage({viewport:{width:1440,height:950}});
page.on("pageerror",e=>console.error("Error de navegador:",e.message));
try{
    await page.goto("http://127.0.0.1:8765/",{waitUntil:"domcontentloaded"});
    await page.locator('button[data-mode="falstad"]').click();
    await page.waitForFunction(()=>window.LabCircuit?.isIntegrated?.(),null,{timeout:150000});
    await page.waitForFunction(()=>{
        const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
        return sim?.getTime?.()>0.03;
    },null,{timeout:90000});
    // El circuito Aron de inicio NO se modifica al añadir un nuevo elemento.
    const startup=await page.evaluate(()=>{
        const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
        return Array.from(sim.getElements()).map(e=>e.getType());
    });
    assert.equal(startup.filter(x=>x==="WattmeterTrueElm").length,2);

    // El acceso rápido aparece a la derecha en el menú de pasivos.
    // Z mayúscula evita quitar la z minúscula al diodo Zener.
    const menuItem=await page.evaluate(()=>{
        const doc=document.querySelector("#circuit-frame")?.contentDocument;
        const label=Array.from(doc?.querySelectorAll(".itemLabel")??[])
            .find(e=>e.textContent?.includes("Add Impedance Z"));
        return {label:label?.textContent,shortcut:label?.parentElement
            ?.querySelector(".shortcutHint")?.textContent?.trim()};
    });
    assert.equal(menuItem.shortcut,"Z",
        "La impedancia debe mostrar Z a la derecha en Componentes pasivos: "+JSON.stringify(menuItem));
    console.log("Menú de pasivos: impedancia Z con acceso rápido Mayús+Z");

    const f0=50, l=5/(2*Math.PI*f0);
    const circuit=(attrs,waveform=1,frequency=50)=>{
        return '<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="20" mts="5e-11">'+
            '<v x="80 304 80 448" f="0" wf="'+waveform+'" fr="'+frequency+'" maxv="14.142135623730951"/>'+
            '<g x="80 448 80 480" f="0"/>'+
            '<w x="80 304 256 304" f="0"/>'+
            '<Impedance x="256 304 352 304" f="0" '+attrs+'/>'+
            '<w x="352 304 352 448" f="0"/>'+
            '<w x="352 448 80 448" f="0"/>'+
            '</cir>';
    };
    const load=async(xml)=>{
        const imported=await page.evaluate(xml=>window.LabCircuit.importNativeCircuit("Prueba impedancia CA",xml),xml);
        assert(imported.ok && imported.simulated && imported.elements===6,
            "No se importó la impedancia completa: "+JSON.stringify(imported));
        await page.waitForFunction(()=>{
            const s=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
            return s?.getTime?.()>0.1 && Array.from(s.getElements()).some(e=>e.getType()==="ImpedanceElm");
        },null,{timeout:60000});
        const check=await page.evaluate(()=>{
            const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
            const impedance=Array.from(sim.getElements()).find(x=>x.getType()==="ImpedanceElm");
            const xml=sim.exportCircuit();
            const tag=new DOMParser().parseFromString(xml,"application/xml").querySelector("Impedance");
            return {tag:tag?.outerHTML??"",info:impedance?.getInfo()??[],
                voltage:impedance?.getVoltageDiff(),current:impedance?.getCurrent(),
                posts:impedance?.getPostCount(),type:impedance?.getType()};
        });
        assert.equal(check.posts,2,"La impedancia debe tener dos bornes");
        assert.equal(check.type,"ImpedanceElm");
        assert(check.info.some(x=>x.startsWith("|Z| = ")),
            "No se informa del módulo de Z: "+JSON.stringify(check));
        assert(check.tag.includes('f0="50"'),"No se conserva frecuencia CA");
        return check;
    };

    const rect=await load(circuit('mode="1" f0="50" r="8" l="'+l+'" c="0"'));
    assert(rect.info.some(x=>x.startsWith("R = 8 Ω")));
    assert(rect.info.some(x=>x.startsWith("X = 5 Ω")));
    assert(Math.abs(rect.current)>1e-8 || Math.abs(rect.voltage)>1e-8,
        "El elemento Z no participa en la simulación: "+JSON.stringify(rect));
    const roundtrip=await page.evaluate(()=>{
        const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
        const before=sim.exportCircuit();
        sim.importCircuit(before);
        const after=sim.exportCircuit();
        const doc=new DOMParser().parseFromString(after,"application/xml");
        const impedance=doc.querySelector("Impedance");
        return {found:!!impedance,r:impedance?.getAttribute("r"),
            l:impedance?.getAttribute("l"),c:impedance?.getAttribute("c"),
            frequency:impedance?.getAttribute("f0"),mode:impedance?.getAttribute("mode")};
    });
    assert.deepEqual([roundtrip.found,roundtrip.r,roundtrip.c,roundtrip.frequency,roundtrip.mode],
        [true,"8","0","50","1"],"Se pierden atributos de impedancia al guardar y abrir");
    console.log("Impedancia RL: dos terminales, corriente real y XML conservado");

    // f0 del XML sigue siendo 50 Hz para la reproducibilidad, pero
    // los valores mostrados deben leer la fuente de alimentación real.
    const sixty=await load(circuit('mode="1" f0="50" r="8" l="'+l+'" c="0"',1,60));
    assert(sixty.info.some(x=>x==="f de red = 60 Hz"),
        "No se detecta automáticamente 60 Hz de la fuente: "+JSON.stringify(sixty.info));
    assert(sixty.info.some(x=>x==="X = 6 Ω"),
        "La reactancia mostrada debe variar con la frecuencia de red: "+JSON.stringify(sixty.info));
    console.log("Fuente 60 Hz: frecuencia automática; X = 6 Ω sin modificar R ni L");
    const rl50=await load(circuit('mode="1" f0="50" r="8" l="'+l+'" c="0"'));
    assert(rl50.info.some(x=>x==="f de red = 50 Hz") &&
        rl50.info.some(x=>x==="X = 5 Ω"),
        "No se recupera la frecuencia de red de 50 Hz al cambiar de circuito");

    const cap=await load(circuit('mode="1" f0="50" r="8" l="0" c="'+(1/(2*Math.PI*50*5))+'"'));
    assert(cap.info.some(x=>/^X = -5 Ω/.test(x)),
        "Reactancia capacitiva negativa incorrecta: "+JSON.stringify(cap.info));
    console.log("Impedancia RC: reactancia capacitiva negativa, solver operativo");

    const both=await load(circuit('mode="2" f0="50" r="8" l="0.1" c="0.0001"'));
    assert(both.info.some(x=>/^L = 100 mH/.test(x)||/^L = 0\.1 H/.test(x)),
        "No se conserva la inductancia física en la impedancia RLC");
    assert(both.info.some(x=>/^C = 100 .*F/.test(x)||/^C = 0\.0001 F/.test(x)),
        "No se conserva la capacidad física en la impedancia RLC: "+JSON.stringify(both.info));
    console.log("Impedancia RLC: R, L y C simultáneas, dos bornes y solución real");

    // Dos impedancias iguales en paralelo: ambas deben conducir corriente,
    // y la corriente total de la fuente debe ser la suma de las ramas.
    const parallel='<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="20" mts="5e-11">'+
        '<v x="80 304 80 448" f="0" wf="1" fr="50" maxv="14.142135623730951"/>'+
        '<g x="80 448 80 480" f="0"/>'+
        '<w x="80 304 256 304" f="0"/>'+
        '<Impedance x="256 304 352 304" f="0" mode="1" f0="50" r="8" l="'+l+'" c="0"/>'+
        '<w x="352 304 352 448" f="0"/>'+
        '<w x="352 448 80 448" f="0"/>'+
        '<w x="256 304 256 240" f="0"/>'+
        '<Impedance x="256 240 352 240" f="0" mode="1" f0="50" r="8" l="'+l+'" c="0"/>'+
        '<w x="352 240 352 304" f="0"/>'+
        '</cir>';
    const parallelImport=await page.evaluate(xml=>
        window.LabCircuit.importNativeCircuit("Dos impedancias Z en paralelo",xml),parallel);
    assert(parallelImport.ok && parallelImport.simulated,
        "No se importaron las impedancias en paralelo: "+JSON.stringify(parallelImport));
    await page.waitForFunction(()=>{
        const sim=document.querySelector("#circuit-frame")?.contentWindow?.CircuitJS1;
        return sim?.getTime?.()>0.1 &&
            Array.from(sim.getElements()).filter(e=>e.getType()==="ImpedanceElm").length===2;
    },null,{timeout:60000});
    const parallelRead=await page.evaluate(()=>{
        const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
        const z=Array.from(sim.getElements()).filter(e=>e.getType()==="ImpedanceElm");
        return z.map(e=>({current:e.getCurrent(),posts:e.getPostCount(),
            info:e.getInfo(),voltage:e.getVoltageDiff()}));
    });
    assert.equal(parallelRead.length,2);
    assert(parallelRead.every(z=>z.posts===2 && z.info.some(x=>x.startsWith("|Z| = "))),
        "Las ramas en paralelo no conservan los dos bornes y las lecturas de Z: "+
        JSON.stringify(parallelRead));
    assert(parallelRead.every(z=>Number.isFinite(z.current) && Number.isFinite(z.voltage)),
        "Corriente o tensión no finita en una rama paralela: "+JSON.stringify(parallelRead));
    // Verificación cuantitativa en régimen permanente: dos Z idénticas
    // comparten tensión, conducen la misma corriente y cumplen KCL.
    // Se leen todas las corrientes en el mismo instante de simulación.
    const kirchhoff=await page.evaluate(()=>{
        const sim=document.querySelector("#circuit-frame").contentWindow.CircuitJS1;
        const elements=Array.from(sim.getElements());
        const branches=elements.filter(e=>e.getType()==="ImpedanceElm");
        const source=elements.find(e=>e.getType()==="VoltageElm");
        return {time:sim.getTime(),branchCurrents:branches.map(e=>e.getCurrent()),
            branchVoltages:branches.map(e=>e.getVoltageDiff()),
            sourceCurrent:source?.getCurrent()};
    });
    const [i1,i2]=kirchhoff.branchCurrents;
    const [u1,u2]=kirchhoff.branchVoltages;
    const is=kirchhoff.sourceCurrent;
    assert([i1,i2,u1,u2,is].every(Number.isFinite),
        "Valores no finitos en la comprobación de Kirchhoff: "+JSON.stringify(kirchhoff));
    assert(Math.max(Math.abs(i1),Math.abs(i2))>0.01,
        "No circula corriente por las dos ramas: "+JSON.stringify(kirchhoff));
    const toleranceI=Math.max(0.005,0.02*Math.max(Math.abs(i1),Math.abs(i2)));
    assert(Math.abs(i1-i2)<toleranceI,
        "Dos Z iguales en paralelo deben conducir la misma corriente: "+JSON.stringify(kirchhoff));
    assert(Math.abs(u1-u2)<0.05,
        "Las dos Z en paralelo deben tener la misma tensión: "+JSON.stringify(kirchhoff));
    assert(Math.abs(Math.abs(is)-Math.abs(i1+i2))<Math.max(0.01,0.02*Math.abs(is)),
        "No se cumple la primera ley de Kirchhoff en el nodo: "+JSON.stringify(kirchhoff));
    console.log("Kirchhoff en paralelo: U1=U2, I1=I2 e |Ifuente|=|I1+I2|");


    const compatible=await page.evaluate(()=>window.LabCircuit.exportStandardRLC());
    assert(compatible.ok && compatible.converted===2 && compatible.added===2,
        "No se pueden exportar ambas Z como RLC estándar: "+JSON.stringify(compatible));
    const standard=await page.evaluate(xml=>{
        const doc=new DOMParser().parseFromString(xml,"application/xml");
        const el=Array.from(doc.documentElement.children);
        return {
            custom:el.filter(e=>e.tagName==="Impedance").length,
            resistance:el.filter(e=>e.tagName==="r").map(e=>e.getAttribute("r")),
            inductance:el.filter(e=>e.tagName==="l").map(e=>e.getAttribute("l")),
            capacitance:el.filter(e=>e.tagName==="c").map(e=>e.getAttribute("c")),
            joined:el.filter(e=>["r","l","c"].includes(e.tagName)).map(e=>e.getAttribute("x")),
            count:el.length
        };
    },compatible.xml);
    assert.equal(standard.custom,0);
    assert.deepEqual(standard.resistance,["8","8"]);
    assert.equal(standard.inductance.length,2);
    assert(standard.inductance.every(x=>Math.abs(Number(x)-l)<1e-10),
        "No se conservan las inductancias de las dos ramas: "+JSON.stringify(standard));
    assert.deepEqual(standard.capacitance,[]);
    assert.equal(standard.joined.length,4);
    const legacy=await page.evaluate(xml=>window.LabCircuit.importNativeCircuit("RLC estándar en paralelo",xml),compatible.xml);
    assert(legacy.ok && legacy.simulated && legacy.elements===standard.count,
        "La exportación estándar en paralelo no se puede volver a abrir: "+JSON.stringify(legacy));
    console.log("Dos Z en paralelo: exportadas como 2 R y 2 L nativos, XML recargado sin Z");


    // Una fuente únicamente de CC no debe iniciar la simulación de Z.
    const dc=circuit('mode="1" f0="50" r="8" l="'+l+'" c="0"',0);
    const dcLoaded=await page.evaluate(xml=>window.LabCircuit.importNativeCircuit("Z con fuente solo CC",xml),dc);
    assert(dcLoaded.ok && dcLoaded.simulated);
    await page.waitForTimeout(700);
    const dcTime=await page.evaluate(
        ()=>document.querySelector("#circuit-frame").contentWindow.CircuitJS1.getTime());
    assert(dcTime<0.005,
        "Se ha permitido simular impedancia Z con alimentación solo CC: t="+dcTime);
    console.log("CC rechazada: el circuito con únicamente fuente continua no arranca");

    const restored=await load(circuit('mode="0" f0="50" r="8" l="'+l+'" c="0"'));
    assert(restored.info.some(x=>x.startsWith("φ = ")));
    console.log("CA recuperada tras rechazar CC: edición e importación siguen disponibles");
}finally{
    await browser.close();
}

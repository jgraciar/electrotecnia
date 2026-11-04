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

    const f0=50, l=5/(2*Math.PI*f0);
    const circuit=(attrs,waveform=1)=>{
        return '<cir f="1" ts="0.00001" ic="12" cb="50" pb="50" vr="20" mts="5e-11">'+
            '<v x="80 304 80 448" f="0" wf="'+waveform+'" fr="50" maxv="14.142135623730951"/>'+
            '<g x="80 448 80 480" f="0"/>'+
            '<w x="80 304 256 304" f="0"/>'+
            '<Impedance x="256 304 352 304" f="0" '+attrs+'/>'+
            '<w x="352 304 352 448" f="0"/>'+
            '<w x="352 448 80 448" f="0"/>'+
            '</cir>';
    };
    const load=async(xml)=>{
        const imported=await page.evaluate(xml=>window.LabCircuit.importModel("Prueba impedancia CA",xml),xml);
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

    const compatible=await page.evaluate(()=>window.LabCircuit.exportStandardRLC());
    assert(compatible.ok && compatible.converted===1 && compatible.added===2,
        "No se puede exportar Z como RLC estándar: "+JSON.stringify(compatible));
    const standard=await page.evaluate(xml=>{
        const doc=new DOMParser().parseFromString(xml,"application/xml");
        const el=Array.from(doc.documentElement.children);
        return {
            custom:el.filter(e=>e.tagName==="Impedance").length,
            resistance:el.filter(e=>e.tagName==="r").map(e=>e.getAttribute("r")),
            inductance:el.filter(e=>e.tagName==="l").map(e=>e.getAttribute("l")),
            capacitance:el.filter(e=>e.tagName==="c").map(e=>e.getAttribute("c")),
            joined:el.filter(e=>["r","l","c"].includes(e.tagName)).map(e=>e.getAttribute("x"))
        };
    },compatible.xml);
    assert.equal(standard.custom,0);
    assert.deepEqual(standard.resistance,["8"]);
    assert.deepEqual(standard.inductance,["0.1"]);
    assert.deepEqual(standard.capacitance,["0.0001"]);
    assert.equal(standard.joined.length,3);
    const legacy=await page.evaluate(xml=>window.LabCircuit.importModel("RLC estándar",xml),compatible.xml);
    assert(legacy.ok && legacy.simulated && legacy.elements===8,
        "La exportación estándar no se puede volver a abrir: "+JSON.stringify(legacy));
    console.log("RLC estándar: exportación en 3 elementos nativos, XML recargado sin Z");


    // Una fuente únicamente de CC no debe iniciar la simulación de Z.
    const dc=circuit('mode="1" f0="50" r="8" l="'+l+'" c="0"',0);
    const dcLoaded=await page.evaluate(xml=>window.LabCircuit.importModel("Z con fuente solo CC",xml),dc);
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

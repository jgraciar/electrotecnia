import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
try {
  const response = await page.goto('https://wulflemm.com/circuitjs1/circuitjs.html', {
    waitUntil: 'domcontentloaded', timeout: 45000
  });
  await page.waitForTimeout(12000);
  const probe = await page.evaluate(() => ({
    title: document.title,
    circuitJS1: typeof window.CircuitJS1,
    circuitJSMethods: window.CircuitJS1 ? Object.keys(window.CircuitJS1).filter(k => /import|export|circuit/i.test(k)) : [],
    canvasCount: document.querySelectorAll('canvas').length,
    text: document.body?.innerText?.slice(0, 500)
  }));
  console.log('WULFLEMM EXTERNAL BROWSER PROBE', JSON.stringify({
    httpStatus: response?.status(), url: page.url(), ...probe
  }));

  const sourceXml = await readFile('tests/fixtures/wulflemm-aron.xml', 'utf8');
  const cross = await page.evaluate(async xml => {
    const api = window.CircuitJS1;
    if (!api?.importCircuit || !api?.exportCircuit)
      throw new Error('Wulflemm API unavailable');
    const inspect = raw => {
      const doc = new DOMParser().parseFromString(raw, 'application/xml');
      if (doc.querySelector('parsererror')) throw new Error('Malformed exported XML');
      return {
        wattmeters: Array.from(doc.querySelectorAll('WattmeterTrue')).map(e => ({
          x: e.getAttribute('x'), meter: e.getAttribute('meter')
        })),
        resistors: Array.from(doc.querySelectorAll('r')).map(e => ({
          x: e.getAttribute('x'), r: e.getAttribute('r')
        }))
      };
    };
    api.importCircuit(xml);
    await new Promise(resolve => setTimeout(resolve, 1500));
    const first = inspect(api.exportCircuit());
    api.importCircuit(api.exportCircuit());
    await new Promise(resolve => setTimeout(resolve, 500));
    return { first, second: inspect(api.exportCircuit()) };
  }, sourceXml);
  console.log('WULFLEMM NATIVE XML IMPORT ROUNDTRIP', JSON.stringify(cross));
  if (cross.first.wattmeters.length !== 2 ||
      cross.first.resistors.length !== 3 ||
      JSON.stringify(cross.first) !== JSON.stringify(cross.second))
    throw new Error('Wulflemm native import/export/reimport did not preserve circuit');

  const labEditedXml = await readFile('/tmp/lab-edited-wulflemm.xml','utf8');
  const importedFromLab = await page.evaluate(async xml => {
    const api=window.CircuitJS1;
    const inspect=()=>{
      const doc=new DOMParser().parseFromString(api.exportCircuit(),'application/xml');
      return {
        wattmeters:Array.from(doc.querySelectorAll('WattmeterTrue')).map(e=>e.getAttribute('meter')),
        resistor:Array.from(doc.querySelectorAll('r')).find(e=>
          e.getAttribute('x')==='752 304 720 352')?.getAttribute('r'),
        resistors:doc.querySelectorAll('r').length
      };
    };
    api.importCircuit(xml);
    await new Promise(resolve=>setTimeout(resolve,800));
    const first=inspect();
    api.importCircuit(api.exportCircuit());
    await new Promise(resolve=>setTimeout(resolve,500));
    return {first,second:inspect()};
  },labEditedXml);
  console.log('LAB TO ORIGINAL WULFLEMM XML CROSS IMPORT',JSON.stringify(importedFromLab));

  const fullCrossStructure = await page.evaluate(xml => {
    const normalized = raw => {
      const doc = new DOMParser().parseFromString(raw,'application/xml');
      if(doc.querySelector('parsererror')) throw Error('Invalid XML');
      return Array.from(doc.documentElement.children)
        .filter(e=>e.tagName!=='o')
        .map(e=>({
          tag:e.tagName,
          attrs:Object.fromEntries(Array.from(e.attributes)
            .filter(a=>!['i','vd'].includes(a.name))
            .map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0])))
        }));
    };
    const expected=normalized(xml);
    const actual=normalized(window.CircuitJS1.exportCircuit());
    return {
      equal:JSON.stringify(expected)===JSON.stringify(actual),
      expectedCount:expected.length,actualCount:actual.length,
      mismatch:expected.findIndex((e,i)=>JSON.stringify(e)!==JSON.stringify(actual[i]))
    };
  },labEditedXml);
  console.log('LAB TO WULFLEMM COMPLETE STRUCTURAL CROSS CHECK',JSON.stringify(fullCrossStructure));
  if(!fullCrossStructure.equal)
    throw new Error('Wulflemm changes circuit structure when importing lab-edited XML');

  if(importedFromLab.first.resistor!=='1137' ||
      importedFromLab.first.resistors!==3 ||
      JSON.stringify(importedFromLab.first.wattmeters)!==JSON.stringify(['0','1']) ||
      JSON.stringify(importedFromLab.first)!==JSON.stringify(importedFromLab.second))
    throw new Error('Wulflemm failed to preserve XML edited by laboratory CircuitJS');


} catch (e) {
  console.log('WULFLEMM EXTERNAL BROWSER PROBE', JSON.stringify({
    reachable: false, error: String(e)
  }));
} finally {
  await browser.close();
}

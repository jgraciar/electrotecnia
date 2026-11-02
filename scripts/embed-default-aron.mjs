// Embed the user-supplied Aron circuit directly into CircuitJS at build time.
// No runtime fetch, iframe race or external startup file is involved.
import { readFileSync, writeFileSync } from 'node:fs';
const source=process.argv[2], fixture=process.argv[3];
if(!source||!fixture)throw Error('Usage: node embed-default-aron.mjs CirSim.ts circuit.xml');
let ts=readFileSync(source,'utf8');
const xml=readFileSync(fixture,'utf8');
if(!/^<cir(?:\\s|>)/.test(xml.trimStart()))throw Error('Invalid original XML');
const anchor='        this.transform = [0, 0, 0, 0, 0, 0];';
if(!ts.includes(anchor))throw Error('Upstream CircuitJS startup hook has changed');
const injection=`        // Laboratory default: embedded original Aron circuit, not loaded from a file.
        if (this.startCircuitText == null && this.startCircuit == null &&
            this.startCircuitLink == null && !((window as any).TestManager?.loadingTestCircuit)) {
            this.startCircuitText = ${JSON.stringify(xml)};
        }

`;
ts=ts.replace(anchor,injection+anchor);
writeFileSync(source,ts);
console.log('Embedded original Aron XML in CircuitJS TypeScript:',xml.length,'bytes');

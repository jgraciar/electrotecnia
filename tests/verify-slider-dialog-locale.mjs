import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {join} from "node:path";
import {labTranslation} from "../scripts/LabTranslations.ts";

const dir=process.argv[2];
if(!dir)throw Error("Falta la ruta a los fuentes TypeScript de CircuitJS");
const slider=readFileSync(join(dir,"SliderDialog.ts"),"utf8");
const required=[
 'import { Locale } from "./Locale";',
 'title.textContent = Locale.LS("Add Sliders");',
 'applyButton.textContent = Locale.LS("Apply");',
 'okButton.textContent = Locale.LS("OK");',
 'cancelButton.textContent = Locale.LS("Cancel");',
 'let name = Locale.LS(ei.name.replace(/<[^>]*>/g, ""));',
 'opt0.textContent = Locale.LS("New Slider");',
 'opt.textContent = Locale.LS("Share Slider: ") + adji.sliderText;',
 'logLabel.appendChild(document.createTextNode(Locale.LS("Logarithmic")));',
 'el.textContent = Locale.LS(text);'
];
for(const needle of required)
 assert(slider.includes(needle),"Falta adaptación de SliderDialog: "+needle);
for(const key of ["Add Sliders","New Slider","Share Slider: ",
 "Min Value","Max Value","Step (0=continuous)","Logarithmic",
 "Label","Make Local","Make Global","Make Persistent",
 "Can't delete subcircuits in use in the current circuit: "])
 for(const lang of ["es","ca-es-valencia"])
  assert(labTranslation(lang,key)?.trim(),"Sin traducción: "+lang+" "+key);
console.log("OK: controles de deslizadores localizados sin modificar valores del usuario");

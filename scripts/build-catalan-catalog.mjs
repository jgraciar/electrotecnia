// Deriva el catálogo catalán de las traducciones valencianas revisadas.
// Solo afecta al simulador CircuitJS. Las claves originales no cambian.
import {readFileSync,writeFileSync} from "node:fs";
import {join} from "node:path";
const dir=process.argv[2];if(!dir)throw Error("Falta el directorio TypeScript de CircuitJS");
const original=readFileSync(join(dir,"public/locale/locale_ca-es-valencia.txt"),"utf8");
const lexicon=new Map(Object.entries({
 "eixida":"sortida","eixides":"sortides",
 "afig":"afegeix","afegix":"afegeix","afegir":"afegir",
 "compartix":"comparteix","imprimix":"imprimeix",
 "obri":"obre","obrir":"obrir","repetix":"repeteix",
 "restablix":"restableix","dividix":"divideix",
 "guarda":"desa","guardar":"desar","guardat":"desat","guardada":"desada",
 "guardats":"desats","guardades":"desades",
 "desenrotllament":"desenvolupament",
 "este":"aquest","esta":"aquesta","estos":"aquests","estes":"aquestes",
 "eixe":"aquest","eixa":"aquesta","eixos":"aquests","eixes":"aquestes",
 "ací":"aquí","açò":"això","aïna":"eina",
 "hui":"avui","proxim":"pròxim",
 "apega":"enganxa","apegar":"enganxar","apegat":"enganxat",
 "servici":"servei","servicis":"serveis",
 "tindre":"tenir","tens":"tens"
}));
const translate=v=>v.split(/(<[^>]*>|&[A-Za-z]+;)/g).map((chunk,index)=>{
 if(index%2)return chunk;
 return chunk.replace(/dos posicions/g,"dues posicions")
 .replace(/[A-Za-zÀ-ÿ·]+/g,word=>{
  const converted=lexicon.get(word.toLocaleLowerCase("ca"));
  if(!converted)return word;
  if(word===word.toLocaleUpperCase("ca"))return converted.toLocaleUpperCase("ca");
  if(word[0]===word[0].toLocaleUpperCase("ca")&&
   word.slice(1)===word.slice(1).toLocaleLowerCase("ca"))
   return converted[0].toLocaleUpperCase("ca")+converted.slice(1);
  return converted;
 });
}).join("");
let keys=0,changed=0;const lines=[];
for(const line of original.split(/\r?\n/)){
 const m=line.match(/^"(.*?)"="(.*)"$/);
 if(!m){if(line.trim())lines.push(line);continue;}
 const value=translate(m[2]);if(!value.trim()&&m[1].trim())throw Error("Traducció buida: "+m[1]);
 lines.push('"'+m[1]+'"="'+value+'"');
 keys++;if(m[2]!==value)changed++;
}
writeFileSync(join(dir,"public/locale/locale_ca.txt"),lines.join("\n")+"\n");
console.log("Català: "+keys+" entrades; "+changed+" adaptacions lèxiques respecte del valencià.");

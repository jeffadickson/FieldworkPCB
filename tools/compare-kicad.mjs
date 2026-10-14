#!/usr/bin/env node
/**
 * Read independently captured KiCad PCB Calculator outputs.
 * Intentionally NO dependency on KiCad GPL code.
 * Usage: node tools/compare-kicad.mjs path/to/verified-vectors.json
 * Exit 0 = all supported cases within declared tolerance
 * Exit 1 = comparison failures; 2 = invalid dataset
 */
import {readFileSync} from "node:fs";
import {microstrip,synthesizeMicrostrip} from "../src/models/microstrip-synthesis.mjs";
const file=process.argv[2];
if(!file){console.error("Usage: node tools/compare-kicad.mjs <captured-vectors.json>");process.exit(2);}
let vectors;
try{
 const raw=readFileSync(file,"utf8");
 if(raw.length>2_000_000)throw Error("Dataset too large");
 const obj=JSON.parse(raw);
 if(obj.schema!=="fieldwork.reference.kicad.v1"||!Array.isArray(obj.cases)||obj.cases.length===0||obj.cases.length>10000)throw Error("Invalid reference schema");
 vectors=obj.cases;
}catch(e){console.error("Invalid dataset:",e.message);process.exit(2);}
let fails=0,passes=0,skips=0;
for(const x of vectors){
 try{
  if(typeof x.id!=="string"||!x.id||!x.source||x.source.application!=="KiCad"||!x.source.version||!x.source.captureMethod||!x.source.calculator||!x.inputs||!x.expected)throw Error("Missing reference provenance");
  const {widthMm,heightMm,thicknessUm,er}=x.inputs;
  const actual=x.operation==="microstrip.analysis"?microstrip({widthMm,heightMm,thicknessUm,er}):
    x.operation==="microstrip.width-synthesis"?synthesizeMicrostrip({targetOhms:x.inputs.targetOhms,heightMm,thicknessUm,er,minWidthMm:x.inputs.minWidthMm??0.01,maxWidthMm:x.inputs.maxWidthMm??10}):null;
  if(!actual){console.log("SKIP",x.id,"unsupported operation");skips++;continue;}
  const key=x.output??(x.operation==="microstrip.analysis"?"impedanceOhms":"widthMm");
  if(!Object.hasOwn(actual,key)||typeof x.expected.value!=="number"||!Number.isFinite(x.expected.value)||!x.tolerance)throw Error("Invalid expected output");
  const absolute=x.tolerance.absolute??0,relative=x.tolerance.relative??0;
  if(absolute<0||relative<0||(!absolute&&!relative))throw Error("Invalid comparison tolerance");
  const error=Math.abs(actual[key]-x.expected.value);
  const threshold=Math.max(absolute,relative*Math.abs(x.expected.value));
  if(error<=threshold){passes++;console.log("PASS",x.id,key,actual[key],x.expected.value);}
  else{fails++;console.log("DIFF",x.id,key,"FIELDWORK",actual[key],"KiCad",x.expected.value,"delta",error,"limit",threshold);}
 }catch(e){fails++;console.log("INVALID",x?.id??"<missing>",e.message);}
}
console.log(JSON.stringify({passed:passes,different:fails,skipped:skips,total:vectors.length}));
process.exit(fails?1:0);

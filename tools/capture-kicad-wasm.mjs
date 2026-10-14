#!/usr/bin/env node
/* Runs an external KiCad C++ / WebAssembly port and captures REAL evaluated values.
 * The GPL WASM stays outside FIELDWORK and is never bundled into production output.
 * The caller provides an existing local .wasm produced by pinned ShinePCB/calculation.
 */
import {readFileSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
const [wasmPath,outputPath,revision] = process.argv.slice(2);
if(!wasmPath||!outputPath||!revision||!/^[0-9a-f]{40}$/i.test(revision))
 throw Error("Usage: node tools/capture-kicad-wasm.mjs external.wasm vectors.json <40-hex-source-revision>");
const binary=readFileSync(resolve(wasmPath));
const {instance}=await WebAssembly.instantiate(binary);
const e=instance.exports;
if(e.tl_abi_version()!==1)throw Error("Unsupported external KiCad bridge ABI");
const cases=[];
const dimensions=[
 {widthMm:1.875,heightMm:1,thicknessUm:35,er:4.4},
 {widthMm:.2,heightMm:.18,thicknessUm:35,er:4.2},
 {widthMm:.4,heightMm:.18,thicknessUm:18,er:3.66},
 {widthMm:.15,heightMm:.1,thicknessUm:35,er:3.4}
];
const scenarios=dimensions.flatMap((geometry)=>[0.1,1,10].map(frequencyGHz=>({...geometry,frequencyGHz})));
for(const [i,d] of scenarios.entries()){
 const h=e.tl_create(0);if(!h)throw Error("Could not create KiCad microstrip model");
 try{
  // Parameter enumeration mirrored from KiCad bridge; SI everywhere.
  const entries=new Map([[0,d.er],[1,.02],[3,d.heightMm/1000],[4,1e20],
   [5,d.thicknessUm/1e6],[6,d.widthMm/1000],[10,.1],[11,0],
   [12,1],[13,1],[14,d.frequencyGHz*1e9],[23,5.8e7],[44,0],[45,1e9],
   [46,0],[47,0],[48,3.5],[49,.025]]);
  for(const [k,v] of entries)if(e.tl_set_parameter(h,k,v)!==1)throw Error("Set KiCad property "+k+" failed");
  if(e.tl_analyse(h)!==1)throw Error("KiCad analysis failed on "+i);
  const z=e.tl_get_parameter(h,18);
  if(!Number.isFinite(z)||z<=0||z>1000)throw Error("KiCad impedance outside expected numeric domain");
  cases.push({id:"KICAD_WASM_MS_"+String(i+1).padStart(3,"0"),
   operation:"microstrip.analysis",output:"impedanceOhms",
   source:{application:"KiCad",version:revision,captureMethod:"ShinePCB KiCad-derived WebAssembly bridge, pinned revision",calculator:"Microstrip",frequencyGHz:d.frequencyGHz,
    notes:"KiCad C++ port with tanD=0.02, copper sigma=5.8e7 S/m, no soldermask, roughness=0, substrate muR=1; quasi-static FIELDWORK may legitimately differ from frequency-dependent KiCad model"},
   inputs:{widthMm:d.widthMm,heightMm:d.heightMm,thicknessUm:d.thicknessUm,er:d.er},expected:{value:z,unit:"ohm"},
   tolerance:{absolute:.5,relative:.05}});
 }finally{e.tl_destroy(h)}
}
writeFileSync(outputPath,JSON.stringify({schema:"fieldwork.reference.kicad.v1",origin:"Generated externally by pinned KiCad-derived WASM, not authored KiCad GUI measurement",cases},null,2)+"\n");
console.log("Captured",cases.length,"external KiCad-derived numerical results from",revision,"over 0.1, 1 and 10 GHz");

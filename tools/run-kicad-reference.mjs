#!/usr/bin/env node
/** Produce machine-readable comparison diagnostics while preserving CLI exit status. */
import {spawnSync} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
const vectorPath=process.argv[2]??"reference-results/kicad-vectors.json";
const out="reference-results";
mkdirSync(out,{recursive:true});
const result=spawnSync(process.execPath,["tools/compare-kicad.mjs",vectorPath],{encoding:"utf8"});
const stdout=result.stdout??"",stderr=result.stderr??"";
process.stdout.write(stdout);process.stderr.write(stderr);
writeFileSync(out+"/comparison.log",stdout+"\nSTDERR:\n"+stderr);
let summary=null;
for(const line of stdout.trim().split("\n").reverse()){
 try{const obj=JSON.parse(line);if(Number.isInteger(obj.total)){summary=obj;break}}catch{}
}
const exit=result.status??2;
writeFileSync(out+"/summary.json",JSON.stringify({status:exit===0?"pass":exit===1?"difference-or-invalid":"infrastructure-error",
exitCode:exit,summary,source:"pinned external KiCad-derived WebAssembly comparison",note:"Agreement with KiCad is not physical accuracy certification"},null,2)+"\n");
process.exit(exit);

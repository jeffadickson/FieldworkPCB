#!/usr/bin/env node
/** Produce machine-readable comparison diagnostics while preserving CLI exit status. */
import {spawnSync} from "node:child_process";
import {mkdirSync,writeFileSync,appendFileSync} from "node:fs";
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
if(process.env.GITHUB_STEP_SUMMARY){
 const counts=summary??{};
 appendFileSync(process.env.GITHUB_STEP_SUMMARY,
  "## KiCad-derived numerical comparison\\n\\n"+
  "| Status | Passed | Differences or invalid | Skipped | Total |\\n"+
  "|---|---:|---:|---:|---:|\\n"+
  "| "+(exit===0?"PASS":exit===1?"DIFFERENT / INVALID":"INFRASTRUCTURE ERROR")+" | "+
  (counts.passed??"—")+" | "+(counts.different??"—")+" | "+(counts.skipped??"—")+" | "+(counts.total??"—")+" |\\n\\n"+
  "Reference engine: pinned third-party KiCad-derived WASM. This is not electromagnetic certification.\\n");
}
process.exit(exit);

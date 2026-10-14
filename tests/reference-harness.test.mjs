import assert from "node:assert/strict";
import {spawnSync} from "node:child_process";
import {writeFileSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {microstrip} from "../src/models/microstrip-synthesis.mjs";
const dir=mkdtempSync(join(tmpdir(),"fieldwork-kicad-"));
try {
 const input={widthMm:.2,heightMm:.18,thicknessUm:35,er:4.2};
 const expected=microstrip(input).impedanceOhms;
 const caseData=(value)=>({id:"MOCK_NOT_KICAD",source:{application:"KiCad",version:"synthetic-fixture",captureMethod:"synthetic-only",calculator:"microstrip",frequencyGHz:1},operation:"microstrip.analysis",inputs:input,expected:{value},tolerance:{absolute:0.01}});
 const path=join(dir,"mock.json");
 const run=(value)=>{writeFileSync(path,JSON.stringify({schema:"fieldwork.reference.kicad.v1",cases:[caseData(value)]}));return spawnSync(process.execPath,["tools/compare-kicad.mjs",path,"--allow-synthetic"],{encoding:"utf8"});};
 assert.equal(run(expected).status,0);
 assert.equal(run(expected+10).status,1);
 assert.match(run(expected+10).stdout,/DIFF/);
 const withoutPermission=spawnSync(process.execPath,["tools/compare-kicad.mjs",path],{encoding:"utf8"});
 assert.equal(withoutPermission.status,1);
 assert.match(withoutPermission.stdout,/Unverified synthetic reference prohibited/);
 const unsupported={...caseData(expected),operation:"unsupported.other"};
 writeFileSync(path,JSON.stringify({schema:"fieldwork.reference.kicad.v1",cases:[unsupported]}));
 const skipOnly=spawnSync(process.execPath,["tools/compare-kicad.mjs",path,"--allow-synthetic"],{encoding:"utf8"});
 assert.equal(skipOnly.status,2);
 assert.match(skipOnly.stderr,/No supported comparisons/);
 console.log("KiCad comparison runner synthetic self-tests passed (NOT KiCad validation)");
}finally{rmSync(dir,{recursive:true,force:true});}

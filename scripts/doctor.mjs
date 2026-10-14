#!/usr/bin/env node
import {spawnSync} from "node:child_process";
import {existsSync} from "node:fs";
import {platform,arch,release} from "node:os";
const args=new Set(process.argv.slice(2));
const requireNative=args.has("--native");
const [major]=process.versions.node.split(".").map(Number);
const cmds=[["node",["--version"]],["npm",["--version"]],["git",["--version"]]];
const result={platform:platform(),architecture:arch(),kernel:release(),node:process.version,
  expectedNodeMajor:22,packageManager:"npm",lockfile:existsSync("package-lock.json"),
  checks:[]};
let failed=false;
for(const [name,commandArgs] of cmds){
 const p=spawnSync(name,commandArgs,{encoding:"utf8",shell:process.platform==="win32"});
 const ok=p.status===0;
 result.checks.push({name,ok,version:(p.stdout||"").trim().split("\n")[0]||null});
 if(!ok && name!=="git")failed=true;
}
if(major!==22){failed=true;result.checks.push({name:"Node major version",ok:false,detail:"Use Node.js 22 LTS per .node-version"});}
else result.checks.push({name:"Node major version",ok:true});
const lockOk=result.lockfile;
result.checks.push({name:"Committed npm lockfile",ok:lockOk,detail:lockOk?"npm ci supported":"Generate package-lock.json with npm install and commit it before reproducible release"});
if(args.has("--release")&&!lockOk)failed=true;
if(requireNative){
 const sys=platform();
 if(sys==="darwin"){const x=spawnSync("xcodebuild",["-version"],{encoding:"utf8"});result.checks.push({name:"Xcode",ok:x.status===0,version:x.stdout?.trim()});if(x.status!==0)failed=true;}
 else {const x=spawnSync("java",["-version"],{encoding:"utf8"});result.checks.push({name:"Java JDK for Android",ok:x.status===0});if(x.status!==0)failed=true;}
}
console.log(JSON.stringify(result,null,2));
process.exitCode=failed?1:0;

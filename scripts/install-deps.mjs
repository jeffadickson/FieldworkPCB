#!/usr/bin/env node
import {existsSync} from "node:fs";
import {spawnSync} from "node:child_process";
const locked=existsSync("package-lock.json");
if(!locked) console.warn("WARNING: package-lock.json is missing; running npm install. Generated versions are not reproducible until the lockfile is committed.");
const cmd=process.platform==="win32"?"npm.cmd":"npm";
const r=spawnSync(cmd,[locked?"ci":"install","--no-fund"],{stdio:"inherit"});
if(r.error)throw r.error;
process.exitCode=r.status??1;

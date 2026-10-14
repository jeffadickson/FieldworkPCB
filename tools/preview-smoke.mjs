import {spawn} from "node:child_process";
import {mkdirSync} from "node:fs";
import {chromium} from "@playwright/test";
const port=4178;
const server=spawn("npm",["run","preview","--","--host","127.0.0.1","--port",String(port),"--strictPort"],{stdio:"pipe",shell:process.platform==="win32"});
let browser;
try{
 let healthy=false;
 for(let i=0;i<50;i++){
  if(server.exitCode!==null)throw new Error("Preview server exited before ready");
  try{const r=await fetch("http://127.0.0.1:"+port+"/FieldworkPCB/");if(r.ok){healthy=true;break}}catch{}
  await new Promise(r=>setTimeout(r,300));
 }
 if(!healthy)throw Error("Preview server unavailable at /FieldworkPCB/");
 mkdirSync("preview-evidence",{recursive:true});
 browser=await chromium.launch({headless:true});
 for(const [name,viewport] of [["desktop",{width:1440,height:900}],["iphone",{width:390,height:844}]]){
  const page=await browser.newPage({viewport,deviceScaleFactor:1});
  const errors=[];
  page.on("pageerror",error=>errors.push(error.message));
  await page.goto("http://127.0.0.1:"+port+"/FieldworkPCB/",{waitUntil:"networkidle"});
  await page.getByRole("heading",{name:"Four-layer example"}).waitFor({timeout:10000});
  if(errors.length)throw Error(name+" runtime errors: "+errors.join(" | "));
  await page.screenshot({path:"preview-evidence/"+name+".png",fullPage:true});
  console.log("PASS",name,"rendered with no page errors");
  await page.close();
 }
}finally{
 if(browser)await browser.close();
 server.kill("SIGTERM");
}

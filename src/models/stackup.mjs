/** Portable FIELDWORK stackup schema v1 (all thicknesses in mm). */
export const MATERIALS=Object.freeze({
 "FR4":{label:"Generic FR-4 (illustrative)",er:4.2},
 "RO4350B":{label:"RO4350B (design Dk approximation)",er:3.66},
 "PTFE":{label:"PTFE (nominal)",er:2.1},
 "custom":{label:"Custom",er:4.0}
});
export const starterStackup=()=>({format:"fieldwork.stackup",version:1,name:"Four-layer example",layers:[
 {id:"L1",type:"copper",role:"signal",thicknessMm:.035},
 {id:"D1",type:"dielectric",material:"FR4",er:4.2,thicknessMm:.18},
 {id:"L2",type:"copper",role:"ground",thicknessMm:.035},
 {id:"D2",type:"dielectric",material:"FR4",er:4.2,thicknessMm:1.10},
 {id:"L3",type:"copper",role:"power",thicknessMm:.035},
 {id:"D3",type:"dielectric",material:"FR4",er:4.2,thicknessMm:.18},
 {id:"L4",type:"copper",role:"signal",thicknessMm:.035}
]});
const plain=(v)=>v!==null&&typeof v==="object"&&!Array.isArray(v);
export function validateStackup(s){
 if(!plain(s)||s.format!=="fieldwork.stackup"||s.version!==1)throw new Error("Unsupported stackup format/version");
 if(typeof s.name!=="string"||s.name.length>120)throw new Error("Invalid board name");
 if(!Array.isArray(s.layers)||s.layers.length<3||s.layers.length>49||s.layers.length%2!==1)throw new Error("Invalid number of layers");
 const ids=new Set();let copper=0;
 s.layers.forEach((l,i)=>{
  const kind=i%2===0?"copper":"dielectric";
  if(!plain(l)||l.type!==kind||typeof l.id!=="string"||!/^[A-Za-z0-9_-]{1,24}$/.test(l.id)||ids.has(l.id))throw new Error("Invalid layer order or identifier");
  ids.add(l.id);
  if(!Number.isFinite(l.thicknessMm)||l.thicknessMm<=0||l.thicknessMm>10)throw new Error("Invalid layer thickness");
  if(kind==="copper"){copper++;if(!["signal","ground","power","mixed"].includes(l.role))throw new Error("Invalid copper role");}
  else if(!Number.isFinite(l.er)||l.er<1||l.er>30||typeof l.material!=="string"||l.material.length>80)throw new Error("Invalid dielectric");
 });
 if(copper<2)throw new Error("At least two copper layers required");
 const totalMm=s.layers.reduce((a,l)=>a+l.thicknessMm,0);
 if(totalMm>25)throw new Error("Stackup exceeds supported thickness");
 return {totalMm,copperLayers:copper,dielectricLayers:copper-1};
}
export function parseStackup(json){
 if(typeof json!=="string"||json.length>100000)throw new Error("Stackup file too large");
 const obj=JSON.parse(json);validateStackup(obj);
 // Whitelist schema fields to avoid extra properties carrying untrusted data.
 return {format:"fieldwork.stackup",version:1,name:obj.name,layers:obj.layers.map(l=>l.type==="copper"?
 {id:l.id,type:"copper",role:l.role,thicknessMm:l.thicknessMm}:
 {id:l.id,type:"dielectric",material:l.material,er:l.er,thicknessMm:l.thicknessMm})};
}
export function serializeStackup(s){validateStackup(s);return JSON.stringify(parseStackup(JSON.stringify(s)),null,2);}
export function addInnerPair(s){
 validateStackup(s);if(s.layers.length>45)throw new Error("Layer limit reached");
 const copy=parseStackup(JSON.stringify(s));
 const k=copy.layers.length;
 // add dielectric and copper before last outer copper, preserving alternating order
 copy.layers.splice(k-1,0,{id:"D"+Date.now().toString(36),type:"dielectric",material:"FR4",er:4.2,thicknessMm:.18},{id:"L"+Date.now().toString(36),type:"copper",role:"signal",thicknessMm:.035});
 validateStackup(copy);return copy;
}
export function surfaceMicrostripGeometry(s,side="top"){
 validateStackup(s);
 const seq=side==="bottom"?[...s.layers].reverse():s.layers;
 if(seq[0].role!=="signal")throw new Error("Outer conductor is not a signal layer");
 if(!["ground","power"].includes(seq[2].role))throw new Error("Adjacent copper must be reference plane");
 return {heightMm:seq[1].thicknessMm,er:seq[1].er,thicknessUm:seq[0].thicknessMm*1000};
}

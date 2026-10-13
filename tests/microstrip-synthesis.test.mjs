import assert from "node:assert/strict";
import {microstrip,synthesizeMicrostrip} from "../src/models/microstrip-synthesis.mjs";
for(const er of [2.2,3.5,4.2,9.8]){
 for(const heightMm of [0.1,0.18,0.4]){
  for(const thicknessUm of [0,18,35,70]){
   for(const w of [0.08,0.2,0.5,1]){
    const a=microstrip({widthMm:w,heightMm,thicknessUm,er});
    const b=synthesizeMicrostrip({targetOhms:a.impedanceOhms,heightMm,thicknessUm,er,minWidthMm:0.01,maxWidthMm:5});
    assert.ok(Math.abs(a.impedanceOhms-b.achievedOhms)<=0.001);
    assert.ok(Math.abs(w-b.widthMm)<0.0001,JSON.stringify({er,heightMm,thicknessUm,w,b}));
   }
  }
 }
}
const p={heightMm:0.18,er:4.2,thicknessUm:35};
assert.ok(microstrip({...p,widthMm:0.1}).impedanceOhms > microstrip({...p,widthMm:0.3}).impedanceOhms);
assert.throws(()=>synthesizeMicrostrip({...p,targetOhms:10000}),RangeError);
assert.throws(()=>synthesizeMicrostrip({...p,targetOhms:50,minWidthMm:2,maxWidthMm:1}),RangeError);
assert.throws(()=>microstrip({...p,widthMm:0}),RangeError);
console.log("Microstrip synthesis: 192 forward/inverse cases, boundaries passed");

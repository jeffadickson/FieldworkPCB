import assert from "node:assert/strict";
import {temperatureRise,currentForRise,widthForRise,fitIds} from "../src/models/brooks-adam-thermal.mjs";
const close=(a,b)=>assert.ok(Math.abs(a-b)<=1e-10*Math.max(1,Math.abs(b)),a+" != "+b);
const a={widthMm:2.54,thicknessUm:71.12,currentA:10};
const rise=temperatureRise(a);
assert.ok(rise>35&&rise<40,"Published 100-mil / 2-oz / 10-A example");
close(rise,215.3*100/(100**1.15*2.8));
for(const fitId of fitIds){
 const x={...a,fitId};
 const r=temperatureRise(x);
 close(currentForRise({...x,temperatureRiseC:r}),10);
 close(widthForRise({...x,temperatureRiseC:r}),2.54);
}
assert.throws(()=>temperatureRise({...a,fitId:"vacuum-1oz"}),RangeError);
assert.throws(()=>temperatureRise({...a,widthMm:0}),RangeError);
console.log("Brooks–Adam empirical models pass");
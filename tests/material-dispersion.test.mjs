import assert from "node:assert/strict";
import {validateDielectricCurve,interpolateDielectric} from "../src/models/material-dispersion.mjs";
const curve={source:"Synthetic fixture; not manufacturer data",points:[
 {frequencyGHz:1,er:4.2,df:.02},{frequencyGHz:10,er:3.8,df:.03}
]};
assert.equal(validateDielectricCurve(curve),true);
assert.equal(interpolateDielectric(curve,1).er,4.2);
assert.ok(Math.abs(interpolateDielectric(curve,Math.sqrt(10)).er-4)<1e-12);
assert.ok(Math.abs(interpolateDielectric(curve,Math.sqrt(10)).df-.025)<1e-12);
assert.throws(()=>interpolateDielectric(curve,.5),RangeError);
assert.throws(()=>interpolateDielectric(curve,20),RangeError);
assert.throws(()=>validateDielectricCurve({...curve,points:[curve.points[1],curve.points[0]]}),RangeError);
assert.throws(()=>validateDielectricCurve({...curve,source:""}),RangeError);
console.log("Dielectric source, interpolation, and bounds tests passed");
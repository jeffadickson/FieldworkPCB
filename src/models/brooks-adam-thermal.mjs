/** Brooks–Adam (2015), Eq. 3-2 / Table 3-1 / Appendix 6.
 * Width & finished copper thickness are internally expressed in mils.
 * Source: https://www.mathscinotes.com/wp-content/uploads/2016/06/pcbtempr.pdf
 * Published empirical fits, NOT an IPC-2152 certified board-level rating.
 */
export const BROOKS_ADAM_REFERENCE = Object.freeze({
  id:"REF-BROOKS-ADAM-2015",
  title:"Trace Currents and Temperatures Revisited",
  authors:"Douglas G. Brooks and Johannes Adam",
  year:2015,
  url:"https://www.mathscinotes.com/wp-content/uploads/2016/06/pcbtempr.pdf",
  locations:["Equation 3-2","Table 3-1","Appendix 6"]
});
const FITS=Object.freeze({
  "external-air":{k:215.3,a:2,b:-1.15,c:-1},
  "internal-air-1oz":{k:200,a:1.9,b:-1.10,c:-1.52},
  "internal-air-2oz":{k:300.3,a:2,b:-1.15,c:-1.52},
  "vacuum-2oz":{k:480,a:1.9,b:-1.10,c:-1.52},
  "vacuum-3oz":{k:460,a:1.95,b:-1.15,c:-1.52}
});
export const fitIds=Object.freeze(Object.keys(FITS));
function positive(x,name){if(typeof x!=="number"||!Number.isFinite(x)||x<=0)throw new RangeError(name+" must be positive and finite");}
function coeffs(fitId){const f=FITS[fitId];if(!f)throw new RangeError("Unsupported fit: "+fitId);return f;}
function dims(widthMm,thicknessUm){positive(widthMm,"widthMm");positive(thicknessUm,"thicknessUm");return {w:widthMm/0.0254,t:thicknessUm/25.4};}
export function temperatureRise({widthMm,thicknessUm,currentA,fitId="external-air"}){
 const f=coeffs(fitId),{w,t}=dims(widthMm,thicknessUm);
 if(typeof currentA!=="number"||!Number.isFinite(currentA)||currentA<0)throw new RangeError("currentA must be finite and nonnegative");
 return f.k*currentA**f.a*w**f.b*t**f.c;
}
export function currentForRise({widthMm,thicknessUm,temperatureRiseC,fitId="external-air"}){
 const f=coeffs(fitId),{w,t}=dims(widthMm,thicknessUm);
 if(typeof temperatureRiseC!=="number"||!Number.isFinite(temperatureRiseC)||temperatureRiseC<0)throw new RangeError("temperatureRiseC must be finite and nonnegative");
 return (temperatureRiseC/(f.k*w**f.b*t**f.c))**(1/f.a);
}
export function widthForRise({currentA,thicknessUm,temperatureRiseC,fitId="external-air"}){
 positive(currentA,"currentA");positive(thicknessUm,"thicknessUm");positive(temperatureRiseC,"temperatureRiseC");
 const f=coeffs(fitId),t=thicknessUm/25.4;
 return (temperatureRiseC/(f.k*currentA**f.a*t**f.c))**(1/f.b)*0.0254;
}
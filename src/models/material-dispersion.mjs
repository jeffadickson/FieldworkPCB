/** Frequency-dependent, source-attributed dielectric property samples.
 * Values must come from datasheets, lab measurements or user data.
 * No invented frequency curves or extrapolation. Interpolation is piecewise
 * linear in log10(frequency), not a causal broadband dispersion model.
 */
export function validateDielectricCurve(curve) {
 if(!curve || typeof curve!=="object" || Array.isArray(curve)) throw new RangeError("Invalid dielectric curve");
 if(typeof curve.source!=="string" || curve.source.trim().length<3 || curve.source.length>300) throw new RangeError("Source required");
 if(!Array.isArray(curve.points) || curve.points.length<2 || curve.points.length>100) throw new RangeError("2–100 frequency samples required");
 let last=0;
 for(const p of curve.points){
  if(!p || typeof p!=="object" || !Number.isFinite(p.frequencyGHz) || p.frequencyGHz<=last || p.frequencyGHz>1000
   || !Number.isFinite(p.er) || p.er<1 || p.er>30
   || !Number.isFinite(p.df) || p.df<0 || p.df>1) throw new RangeError("Invalid dielectric frequency sample");
  last=p.frequencyGHz;
 }
 return true;
}
export function interpolateDielectric(curve,frequencyGHz) {
 validateDielectricCurve(curve);
 if(!Number.isFinite(frequencyGHz)||frequencyGHz<=0) throw new RangeError("Frequency must be positive");
 const a=curve.points;
 if(frequencyGHz<a[0].frequencyGHz || frequencyGHz>a[a.length-1].frequencyGHz) throw new RangeError("Frequency outside characterized range");
 const exact=a.find(p=>p.frequencyGHz===frequencyGHz);
 if(exact) return {er:exact.er,df:exact.df,frequencyGHz,source:curve.source,method:"sample"};
 let i=1;while(a[i].frequencyGHz<frequencyGHz)i++;
 const low=a[i-1],high=a[i];
 const fraction=Math.log(frequencyGHz/low.frequencyGHz)/Math.log(high.frequencyGHz/low.frequencyGHz);
 return {er:low.er+(high.er-low.er)*fraction,df:low.df+(high.df-low.df)*fraction,frequencyGHz,source:curve.source,method:"log-frequency interpolation"};
}

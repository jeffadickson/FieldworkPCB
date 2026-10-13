/** Hammerstad–Jensen quasi-static microstrip model.
 * References: Hammerstad & Jensen, MTT-S International Microwave Symposium, 1980;
 * https://qucs.github.io/tech/node75.html
 * No loss, soldermask, roughness, dispersion or field solver.
 */
const ZVAC=376.730313668;
const c0=299792458;
function requirePos(x,name){if(typeof x!=="number"||!Number.isFinite(x)||x<=0)throw new RangeError(name+" must be > 0 and finite");}
export function microstrip({widthMm,heightMm,thicknessUm=0,er}){
 requirePos(widthMm,"widthMm");requirePos(heightMm,"heightMm");requirePos(er,"er");
 if(er<1)throw new RangeError("er must be >= 1");
 if(typeof thicknessUm!=="number"||!Number.isFinite(thicknessUm)||thicknessUm<0)throw new RangeError("thicknessUm must be >= 0");
 const u=widthMm/heightMm, q=thicknessUm/1000/heightMm;
 const du=q===0?0:q/Math.PI*Math.log1p(4*Math.E/q*Math.tanh(Math.sqrt(6.517*u))**2);
 const ur=u+du*(1+1/Math.cosh(Math.sqrt(er-1)))/2;
 const u1=u+du;
 const zAir=(v)=>{const f=6+(2*Math.PI-6)*Math.exp(-(30.666/v)**0.7528);return ZVAC/(2*Math.PI)*Math.log(f/v+Math.sqrt(1+(2/v)**2));};
 const a=1+Math.log((ur**4+(ur/52)**2)/(ur**4+0.432))/49+Math.log1p((ur/18.1)**3)/18.7;
 const b=0.564*((er-0.9)/(er+3))**0.053;
 const ep=(er+1)/2+(er-1)/2*(1+10/ur)**(-a*b);
 const z= zAir(ur)/Math.sqrt(ep);
 const epsilonEff=ep*(zAir(u1)/zAir(ur))**2;
 return {impedanceOhms:z,effectivePermittivity:epsilonEff,phaseVelocityMps:c0/Math.sqrt(epsilonEff),effectiveWidthMm:ur*heightMm};
}
/** Find the width for a target quasi-static Z0 with bracketed bisection.
 * The solver never extrapolates outside its caller-defined fabrication range.
 */
export function synthesizeMicrostrip({targetOhms,heightMm,thicknessUm=0,er,minWidthMm=0.025,maxWidthMm=10,toleranceOhms=0.001}){
 for(const [v,k] of [[targetOhms,"targetOhms"],[minWidthMm,"minWidthMm"],[maxWidthMm,"maxWidthMm"],[toleranceOhms,"toleranceOhms"]])requirePos(v,k);
 if(maxWidthMm<=minWidthMm)throw new RangeError("Width bounds must increase");
 const parameters={heightMm,thicknessUm,er};
 let lo=minWidthMm,hi=maxWidthMm;
 const zlo=microstrip({...parameters,widthMm:lo}).impedanceOhms;
 const zhi=microstrip({...parameters,widthMm:hi}).impedanceOhms;
 if(targetOhms>zlo || targetOhms<zhi)throw new RangeError("Target impedance outside width search bounds");
 for(let n=0;n<100;n++){
   const mid=(lo+hi)/2, z=microstrip({...parameters,widthMm:mid}).impedanceOhms;
   if(Math.abs(z-targetOhms)<=toleranceOhms || (hi-lo)<1e-11)return {widthMm:mid,achievedOhms:z,iterations:n+1,targetOhms};
   if(z>targetOhms)lo=mid;else hi=mid;
 }
 throw new Error("No convergence");
}

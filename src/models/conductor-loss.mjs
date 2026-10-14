/** First-order microstrip conductor loss, finite-width sheet-current model.
 * Rs = sqrt(pi*f*mu*rho), delta = sqrt(rho/(pi*f*mu)).
 * alpha_c (Np/m) ~= Rs/Z0 * (1/w + 1/(4h)) for thick conductors and a
 * uniform-current approximation (trace plus broad return plane).
 * References: Pozar, Microwave Engineering, conductor attenuation; skin-depth
 * equations. This expression is a rough design estimate, not a field solver.
 */
export function conductorLoss({frequencyGHz,widthMm,heightMm,impedanceOhms,lengthMm,rho=1.724e-8,muR=1,roughnessUm=0,thicknessUm=35}) {
 const inputs={frequencyGHz,widthMm,heightMm,impedanceOhms,lengthMm,rho,muR,roughnessUm,thicknessUm};
 for(const [k,v] of Object.entries(inputs))if(!Number.isFinite(v))throw new RangeError(k+" must be finite");
 if(frequencyGHz<=0||widthMm<=0||heightMm<=0||impedanceOhms<=0||lengthMm<0||rho<=0||muR<=0||roughnessUm<0||thicknessUm<=0)throw new RangeError("Invalid conductor geometry");
 const f=frequencyGHz*1e9,mu=4*Math.PI*1e-7*muR;
 const skinDepthM=Math.sqrt(rho/(Math.PI*f*mu));
 const sheetResistanceOhms=Math.sqrt(Math.PI*f*mu*rho);
 const widthM=widthMm/1000,heightM=heightMm/1000;
 // Finite thickness is not modeled accurately where thickness is small relative to skin depth.
 const thickEnough=thicknessUm*1e-6>=3*skinDepthM;
 const alphaNpM=sheetResistanceOhms/(2*impedanceOhms)*(1/widthM+1/(4*heightM));
 const dbPerMeter=alphaNpM*20/Math.log(10);
 return {skinDepthUm:skinDepthM*1e6,sheetResistanceOhms,dbPerMeter,totalDb:dbPerMeter*lengthMm/1000,thickEnough,model:"uniform-sheet-current-first-order"};
}

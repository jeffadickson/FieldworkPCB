/** First-order plated through-hole via model, SI copper resistance.
 * R = rho L / (pi*(D*t+t²)); cylindrical barrel, uniform plating.
 * Do not use as a high-frequency or qualified thermal model.
 */
export function viaDC({boardMm,holeMm,platingUm,currentA=0,temperatureC=20,rho20=1.724e-8,alpha=0.00393}){
 for(const [k,v] of Object.entries({boardMm,holeMm,platingUm,rho20})){
  if(!Number.isFinite(v)||v<=0)throw new RangeError(k+" must be positive");
 }
 if(!Number.isFinite(currentA)||!Number.isFinite(temperatureC)||temperatureC< -100||!Number.isFinite(alpha))throw new RangeError("Invalid operating conditions");
 const d=holeMm/1000,t=platingUm/1e6,L=boardMm/1000;
 const area=Math.PI*(d*t+t*t);
 const rho=rho20*(1+alpha*(temperatureC-20));
 if(rho<=0)throw new RangeError("Invalid resistivity");
 const resistanceOhms=rho*L/area;
 return {areaMm2:area*1e6,resistanceOhms,voltageDropV:currentA*resistanceOhms,powerW:currentA**2*resistanceOhms,currentDensityAmm2:Math.abs(currentA)/(area*1e6)};
}

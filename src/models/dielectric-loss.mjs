/** Quasi-TEM dielectric loss estimate for microstrip.
 * alpha_d = (k0/2)*[er/(er-1)]*[(eeff-1)/sqrt(eeff)]*tan(delta)
 * Sources: Pozar, Microwave Engineering, microstrip dielectric attenuation;
 * Qucs microstrip loss discussion: https://qucs.github.io/tech/node75.html
 * Valid only for weak-loss, homogeneous dielectric, approximate quasi-static fields.
 * Returns attenuation for matched transmission, no copper/soldermask/radiation loss.
 */
export function microstripDielectricLoss({frequencyGHz,er,effectiveEr,lossTangent,lengthMm}){
 for(const [name,value] of Object.entries({frequencyGHz,er,effectiveEr,lossTangent,lengthMm}))
   if(typeof value!=="number"||!Number.isFinite(value))throw new RangeError(name+" must be finite");
 if(frequencyGHz<=0||lengthMm<0||lossTangent<0||lossTangent>0.2||er<=1||effectiveEr<1||effectiveEr>er)
   throw new RangeError("Outside quasi-TEM dielectric-loss model domain");
 const k0=2*Math.PI*frequencyGHz*1e9/299792458;
 const alphaNpM=k0*er/(er-1)*(effectiveEr-1)/(2*Math.sqrt(effectiveEr))*lossTangent;
 return {alphaNpM,dbPerMeter:alphaNpM*20/Math.log(10),totalDb:alphaNpM*(lengthMm/1000)*20/Math.log(10),model:"quasi-tem-dielectric-loss",reference:"https://qucs.github.io/tech/node75.html"};
}

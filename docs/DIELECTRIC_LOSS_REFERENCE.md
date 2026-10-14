# Dielectric attenuation — quasi-TEM estimate (v0.21)

Reference: D. Pozar, *Microwave Engineering*, section on microstrip dielectric loss; [Qucs microstrip technical documentation](https://qucs.github.io/tech/node75.html).

This is a small-loss, homogeneous dielectric **quasi-TEM approximation**, using

```
alpha_d [Np/m] = (k0/2) * (er/(er-1)) *
                  ((er_effective - 1)/sqrt(er_effective)) * tan_delta
k0 = 2*pi*f/c
loss_dB = alpha_d * length_m * (20/ln(10))
```

Input constraints: f > 0, er > 1, 1 <= er_effective <= er, 0 <= tan_delta <= 0.2, and length >= 0. Units: GHz input, mm length, internally SI. No loss prediction is displayed for a stackup dielectric without a frequency-sampled Df; manually supplied Df is visibly a user assumption.

Loss tangent is interpolated only over characterized frequency points; no extrapolation. The underlying quasi-static field model assumes narrowband excitation and does not include causal broadband frequency dispersion.

**Not included:** conductor/skin-effect loss, roughness, soldermask loss, radiation, launch discontinuities, mismatch or geometry-dependent full-wave effects. Manufacturer sample reference, temperature, axis, calibration method and uncertainty should accompany future production material records.

Verification status: formula monotonicity and dimensional scaling tests implemented. Independent solver/measured S-parameter comparisons outstanding. Do not report the estimate as total insertion loss.

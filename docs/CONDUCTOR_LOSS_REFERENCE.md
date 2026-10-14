# Conductor loss: preliminary high-frequency sheet-current estimate

Based on classical skin effect: skin depth δ = sqrt(ρ/(π f μ)), surface resistance Rs = sqrt(π f μ ρ). References: D. M. Pozar, *Microwave Engineering*, conductor attenuation of transmission lines; https://www.microwaves101.com/encyclopedias/skin-depth.

The FIELDWORK estimate uses αc ≈ Rs/(2 Z0) [1/w + 1/(4h)] Np/m, representing a rough uniform-current strip and return plane approximation. Its bracketed geometric factor is a **heuristic approximation**, not a qualified Hammerstad/Jensen, Wheeler, or full-wave model. The result is NOT validated against measured insertion loss and should be used for sensitivity estimation only.

Frequency in GHz; width and height in mm; resistivity in Ω·m; copper thickness in μm; output in dB/m and total dB. Thick-conductor warning if thickness < 3 skin depths. This calculation omits edge crowding, finite ground planes, plating, current redistribution, finite-thickness corrections, surface roughness, soldermask and radiation. Roughness input is retained for a future model but presently **not used** in results; no claim of roughness correction.

Acceptance before qualification: compare against independent field solver and measured S-parameters across geometry/frequency, select a published geometry-specific attenuation model, and test loss budget consistency.

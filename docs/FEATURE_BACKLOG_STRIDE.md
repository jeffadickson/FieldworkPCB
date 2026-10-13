# FIELDWORK PCB — feature backlog and STRIDE threat model
Status: 2026-10-13. Source comparison: ShinePCB/calculation (GPL-3.0-or-later), and KiCad PCB Calculator. Implement independently; do **not** copy GPL code or WASM into FIELDWORK without a documented licensing decision.

## Feature requirements (tracked)
| ID | Priority | Feature | Acceptance / engineering requirement | State |
|---|---|---|---|---|
| FW-SI-001 | P0 | Single microstrip impedance synthesis | Solve width for target Z0, bounded search, invertibility tests; show assumptions & reference | **Implemented** |
| FW-SI-002 | P0 | Coupled microstrip analysis and synthesis | Even/odd, Zdiff, common mode, gap and width solve; independently verified model | Planned |
| FW-SI-003 | P0 | Coupled stripline | Asymmetric/symmetric, inverse gap/width target, layer stackup linkage | Planned |
| FW-SI-004 | P1 | Coplanar waveguide and grounded CPW | Geometry models, reference plane and gap, loss estimates | Planned |
| FW-SI-005 | P1 | Coaxial and twisted pair | Characteristic impedance, propagation, loss | Planned |
| FW-SI-006 | P2 | Rectangular waveguide | TE/TM cutoff, modes and propagation domain validation | Planned |
| FW-SI-007 | P0 | Frequency-aware loss and dispersion | Dk(f), Df(f), conductor skin effect, roughness, dielectric losses | Planned |
| FW-SI-008 | P1 | Soldermask impedance correction | Mask thickness/Dk/loss, applied only on supported geometries | Planned |
| FW-SI-009 | P0 | Target-driven analysis/synthesis | Bidirectional geometry solve, safe brackets, error budgets | Partial (single microstrip) |
| FW-THERM-001 | P0 | Published thermal models | Brooks–Adam fits with provenance, applicability, baseline comparisons | Partial |
| FW-THERM-002 | P0 | IPC-2152 chart validation | Data only when rights permit; holdout tests and construction corrections | Waiting for standard |
| FW-FAB-001 | P1 | IEC 60664 clearance/creepage | Standard-specific selection, pollution/OV/altitude, licensing review | Planned |
| FW-FAB-002 | P1 | Track fusing (short-time) | Onset, time, width/current inversion and conservative warnings | Planned |
| FW-RF-001 | P2 | Attenuator networks | Pi/T/bridged-T plus infeasible design warnings | Planned |
| FW-RF-002 | P2 | RF wavelength & phase length | Dielectric frequency and units | Planned |
| FW-MOB-001 | P0 | iPhone-first responsive layout | 390px viewport, forms usable with keyboard, diagrams scale | In progress |
| FW-MOB-002 | P0 | Capacitor iOS & Android packaging | Same tested web engine and offline assets | Planned |
| FW-DATA-001 | P0 | Local project save/load | Versioned validated JSON, import/export, zero network needed | Legacy implementation; React migration pending |
| FW-QA-001 | P0 | Test provenance | Equation ID, paper URL/page/equation, accuracy limits and fixture origins | In progress |
| FW-QA-002 | P0 | Playwright E2E and CI | Browser full flows, mobile viewport, tests and build gates | Planned |

## STRIDE security requirements
Applies to project JSON imports, offline storage, native wrappers, update pipeline, and reference metadata.

| Threat | Risk | Required mitigation |
|---|---|---|
| Spoofing | Fake material/standard identity in imported project | Show source/version/vendor; never badge user data as certified |
| Tampering | Altered geometry or coefficients in JSON | Strict schema, units, ranges, size caps, reject unknown versions |
| Repudiation | Calculation settings not reproducible | Record model ID, formula version, material version, input units and timestamp with reports |
| Information disclosure | Proprietary PCB stackups leak to third parties | Local-only by default; no telemetry/sync; explicit sharing |
| Denial of service | Large/malicious import or nonconvergent solver | File size/depth caps, bounded iterations, input checks, runtime limits |
| Elevation of privilege | WebView/native bridge abuse, scripts in imported content | No eval/HTML injection, minimal Capacitor permissions, CSP and dependency audits |

## Validation policy
No claim that simple IPC-2221 equations meet IPC-2152; no automated physical compliance claim from an approximate fit. Use independent reference models and measured/field-solver cases. Preserve KiCad/ShinePCB strictly as a comparison source unless a deliberate GPL adoption is made.

References:
- Hammerstad & Jensen (1980): https://qucs.github.io/tech/node75.html
- KiCad: https://gitlab.com/kicad/code/kicad
- ShinePCB: https://github.com/ShinePCB/calculation
- Brooks & Adam (2015): https://www.mathscinotes.com/wp-content/uploads/2016/06/pcbtempr.pdf

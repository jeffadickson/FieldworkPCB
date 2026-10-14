# KiCad independent numerical reference verification

## Why

KiCad PCB Calculator implements independent C++ models of microstrip and other transmission lines. It is a useful **comparison oracle**, not a source of physical truth or certification. Published KiCad documentation notes that transmission-line models can be frequency-dependent. FIELDWORK's current Hammerstad–Jensen implementation is quasi-static: expect some justified disagreements, especially at high frequency.

Official references:
- https://docs.kicad.org/master/en/pcb_calculator/pcb_calculator.html
- https://gitlab.com/kicad/code/kicad/-/tree/master/pcb_calculator/transline
- https://docs.kicad.org/doxygen/classTRANSLINE__CALCULATION__BASE.html
- KiCad port for web reference inspection: https://github.com/ShinePCB/calculation (GPL-3.0-or-later)

## Capturing vectors

Open the official KiCad PCB Calculator (or a pinned-source KiCad WASM port as a secondary reference). Select Microstrip, specify geometry and materials, calculate at a **documented frequency**, and record displayed values plus all parameters and KiCad version. Pay attention to the differences between DC resistivity and conductivity, copper thickness, relative magnetic permeability, soldermask and dispersion settings.

Capture at least three widths around the design target, two copper thicknesses, multiple Dk values, and at least two frequencies. Results should be captured at full available precision; record displayed rounding uncertainty. Ensure source/captureMethod/calculator/version are nonempty.

Do not automatically label the example file as measured KiCad data. Place genuine captures in a new JSON file using the schema described by the example in `fixtures/kicad-reference-template.json`.

```bash
node tools/compare-kicad.mjs fixtures/kicad-verified-vectors.json
```

The tool compares supported operations only; unsupported types are counted as SKIP. Difference thresholds are explicitly per-case:
- absolute: allowable absolute discrepancy in the result's units
- relative: allowable fractional discrepancy
- comparison passes when |FIELDWORK - KiCad| <= max(absolute, relative*|KiCad|)

**A difference is a diagnostic, not automatically a FIELDWORK defect.** Check model assumptions, dispersion and losses first.

## Licensing boundary

The comparison runner uses FIELDWORK's independent formulas and external numeric observations. It does **not** embed KiCad's GPL code, the ShinePCB WebAssembly binary, or a redistribution of KiCad source. If KiCad code is ever integrated into the distributed application, conduct a deliberate GPL compatibility review.

## Verification limits and CI

The comparison runner requires verified numerical captures. CI should not report a KiCad agreement rate until such cases exist. Ordinary numerical unit tests remain mandatory and separate; KiCad-derived vector CI becomes a distinct, optionally gated job once reference observations are documented and licensed appropriately.

## Validation guardrails (v0.25)

The comparison program **rejects synthetic, mock, placeholder, or `REPLACE_WITH` IDs and source metadata** by default. It requires a recorded reference frequency, KiCad version, calculator, capture method, and distinct case IDs. Numerical tolerances must be finite and nonnegative. A suite with zero supported comparisons fails with exit code 2 instead of reporting a misleading success.

Only the comparator's **self-tests** use `--allow-synthetic`, which disables the synthetic-data provenance rejection and labels the final report `verified:false`; it must not be used for engineering acceptance or publication.

```sh
node tests/reference-harness.test.mjs
node tools/compare-kicad.mjs fixtures/kicad-verified-vectors.json
```

The committed template is not a genuine KiCad capture and is expected to fail validation. Do not infer agreement from test harness self-tests.

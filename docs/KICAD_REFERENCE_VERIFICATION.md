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

## Automated external C++ reference capture (v0.26)

Run [KiCad reference comparison](https://github.com/jeffadickson/FieldworkPCB/actions/workflows/kicad-reference.yml) manually from GitHub Actions.

This job checks out **ShinePCB/calculation** at pinned revision `79aab13534fd7f3dfecccbbbf8e33a04868bfc76` into `external-kicad/`. That repository contains a GPL-3.0-or-later KiCad-derived calculator compiled to WebAssembly. It is only used during the independent comparison job and is **not shipped in the FIELDWORK web/mobile application**.

`tools/capture-kicad-wasm.mjs` calls the bridge's published numeric ABI: loads and configures microstrip models, executes `Analyse()`, and saves actual computed impedance results. The output records the pinned source revision, input geometry, frequency and secondary KiCad settings; `tools/compare-kicad.mjs` compares these values against the independent FIELDWORK model. Four geometric test cases are defined initially.

Important qualifications:
- This uses a **third-party port of KiCad's C++ calculator**, not an independently installed official KiCad GUI build. Treat provenance accordingly.
- The job only uses the existing committed port WASM. It does not rebuild the C++ compiler source from scratch.
- A 5% relative / 0.5-ohm absolute preliminary comparison threshold is a regression screening parameter, **not** an accuracy guarantee.
- High-frequency dispersion, conductor conductivity, dielectric loss, and other setup differences can legitimately produce disagreement.
- The job is **manual and unverified until its first GitHub Actions execution**.
- Actual captures are written to GitHub Actions artifacts, not committed as fabricated source data.

## v0.27 diagnostic artifacts

The manual workflow now hashes the exact external WASM binary and stores that SHA-256 beside the source revision in `reference-results/`. After capture, `tools/run-kicad-reference.mjs` writes `comparison.log` and `summary.json` showing the comparator exit code, counts and differences. Files are uploaded even if the comparison fails. Exit 0 means the current numeric tolerances passed; exit 1 means at least one mismatch or invalid case, and exit 2 means no supported comparisons or input/infrastructure failure. These categories must be reviewed, not interpreted automatically as physical model quality.

The workflow does not run on every push to avoid unnecessary dependence on a third-party GPL test engine; use the Actions manual trigger. Its first green run remains **unconfirmed**.

## v0.28: frequency sweep

The external calculator capture now uses **four geometries × three frequencies (0.1, 1, 10 GHz) = 12 cases**. Each observation stores its *actual* reference frequency rather than a fixed value, and the geometry inputs passed to FIELDWORK remain limited to the required dimensions.

This is a valuable diagnostic: FIELDWORK uses a quasi-static impedance model, while KiCad's reference engine may include dispersion. Differences that grow with frequency must be investigated rather than loosening tolerances. A failed CI comparison may be the correct engineering result.

The workflow is still manually triggered; no successful run or quantitative agreement should be claimed without the uploaded vector artifact.

## v0.29: automatic integration validation

The pinned KiCad comparison workflow now also runs on pushes that modify the reference capture/comparison scripts or the workflow itself. This enables GitHub's hosted runner to exercise the *actual external binary* without needing a separate manual dispatch. It does **not** run for unrelated app changes. Manual runs remain available.

The capture script checks for required WebAssembly ABI functions and includes the frequency in analysis-error messages. Diagnostics and captured vectors are retained as workflow artifacts on failure.

**Caution:** The code and trigger have been committed, but the CI result must be read from GitHub Actions before marking the comparison as passing. The 10 GHz cases may legitimately disagree with FIELDWORK's quasi-static model.

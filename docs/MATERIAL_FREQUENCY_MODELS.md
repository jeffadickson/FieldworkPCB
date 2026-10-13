# Frequency-dependent dielectric data — v0.19

Source-of-truth: `src/models/material-dispersion.mjs`. Optional per-layer `dielectricCurve` is stored in stackup schema v1, with **no version change**; older JSON continues to parse. The scalar `er` remains the default for layers without frequency data.

Example **synthetic test data, not a real material datasheet**:

```json
{
  "source": "Synthetic test data (not production)",
  "points": [
    {"frequencyGHz": 1, "er": 4.2, "df": 0.02},
    {"frequencyGHz": 10, "er": 3.8, "df": 0.03}
  ]
}
```

A dielectric layer may carry this as its `dielectricCurve` property. At a requested frequency between supplied points, values are linearly interpolated in log-frequency. Frequencies outside the tabulated interval are rejected; no extrapolation or inferred values. Results indicate original source metadata when the material model is directly requested.

The microstrip UI allows a frequency entry and reads sampled Dk from a linked top or bottom signal-layer dielectric. It still uses the **quasi-static Hammerstad–Jensen model at that sampled Dk**: this is **not** a causal broadband dispersion model. Df is preserved but not yet applied to dielectric-loss calculations.

## Remaining issue #4 acceptance criteria

- Document independently sourced frequency- and axis-specific Dk/Df manufacturer curves with revision and test method.
- Build an editor for entering, editing and charting custom source-attributed data (not yet exposed).
- Add loss and causally consistent frequency dispersion calculations and field-solver benchmarks.
- Store unit, temperature, anisotropy, uncertainty and sample measurement conditions in a forward-compatible schema revision.
- Run GitHub numerical and browser tests before declaring complete.

Reference background: Hammerstad & Jensen microstrip theory https://qucs.github.io/tech/node75.html. Empirical material curves need manufacturer datasheets for each material; the present interpolator contains none.

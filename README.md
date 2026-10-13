# FIELDWORK PCB

A modern, reference-backed PCB engineering workbench. **v0.14 development branch on main:** React + Mantine scaffold and the published Brooks–Adam empirical conductor-heating model.

## Run the new web application

```sh
npm install
npm run dev
npm test
npm run build
```

React requires downloading the dependencies. Node-only numerical tests have been executed locally; the new Vite production build has **not** yet been verified in the execution environment because its dependencies are not installed there.

## Available in GitHub now

- `src/main.jsx`: responsive React + Mantine conductor-heating workspace.
- `src/models/brooks-adam-thermal.mjs`: published fits with finite-input validation and inverse sizing.
- `tests/brooks-adam.test.mjs`: arithmetic, inverse, and invalid-input checks.
- `docs/BROOKS_ADAM_REFERENCES.md`: published coefficient provenance, units, and limitations.

The rest of the previous standalone calculators, JSON stackup designer, and related numerical modules are preserved in the downloadable v0.14 project archive, but are **not yet fully migrated into this GitHub repository**. They must be integrated and parity-tested before claiming feature completeness. Capacitor/iOS packaging is planned but **not implemented**.

## Source and qualification

Douglas G. Brooks and Johannes Adam (2015), *Trace Currents and Temperatures Revisited*, Eq. 3-2, Table 3-1, Appendix 6: https://www.mathscinotes.com/wp-content/uploads/2016/06/pcbtempr.pdf

The conductor-heating fits are **not** an IPC-2152 compliance claim or a board-level thermal simulation. Nearby copper, material anisotropy, environment, fabrication, and boundary conditions matter. Numerical input/forward/inverse tests are available. Real Saturn, IPC chart, independent thermal-solver and measured-board validation are outstanding.

The proprietary Saturn binary and Saturn reference tester belong in a separate repository.

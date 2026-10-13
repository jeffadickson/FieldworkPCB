# FIELDWORK PCB

A modern, reference-backed PCB engineering workbench. **v0.15 development snapshot on main:** React + Mantine, Brooks–Adam conductor heating, and Hammerstad–Jensen microstrip impedance synthesis.

## Run the new web application

```sh
npm install
npm run dev
npm test
npm run build
npm run test:e2e  # after npx playwright install chromium
```

React requires downloading the dependencies. Node-only numerical tests have been executed locally; the new Vite production build has **not** yet been verified in the execution environment because its dependencies are not installed there.

## Available in GitHub now

- `src/main.jsx`: responsive React + Mantine conductor-heating and microstrip-synthesis workspaces.
- `src/models/microstrip-synthesis.mjs`: reference-backed microstrip analysis and target-impedance width synthesis.
- `tests/microstrip-synthesis.test.mjs`: forward/inverse regression cases.
- `docs/FEATURE_BACKLOG_STRIDE.md`: missing-feature inventory and STRIDE security requirements.
- `docs/CI_MOBILE_BUILDS.md`: web, Android and iOS preview build instructions.
- `src/models/brooks-adam-thermal.mjs`: published fits with finite-input validation and inverse sizing.
- `tests/brooks-adam.test.mjs`: arithmetic, inverse, and invalid-input checks.
- `docs/BROOKS_ADAM_REFERENCES.md`: published coefficient provenance, units, and limitations.

The rest of the previous standalone calculators, JSON stackup designer, and related numerical modules are preserved in the downloadable v0.14 project archive, but are **not yet fully migrated into this GitHub repository**. They must be integrated and parity-tested before claiming feature completeness. Capacitor scaffolding and manually triggered native CI workflows have been added, but **native builds have not yet been verified**. Signed App Store distribution is not configured.

## Source and qualification

Douglas G. Brooks and Johannes Adam (2015), *Trace Currents and Temperatures Revisited*, Eq. 3-2, Table 3-1, Appendix 6: https://www.mathscinotes.com/wp-content/uploads/2016/06/pcbtempr.pdf

The conductor-heating fits are **not** an IPC-2152 compliance claim or a board-level thermal simulation. Nearby copper, material anisotropy, environment, fabrication, and boundary conditions matter. Numerical input/forward/inverse tests are available. Real Saturn, IPC chart, independent thermal-solver and measured-board validation are outstanding.

The proprietary Saturn binary and Saturn reference tester belong in a separate repository.

## GitHub Actions

- [Web CI](../../actions/workflows/web-build.yml): installs dependencies, runs numerical and Playwright browser tests, builds web assets and publishes a downloadable artifact.
- [Native preview builds](../../actions/workflows/native-builds.yml): manually builds Android debug APK or unsigned iOS Simulator app (not a signed iPhone IPA).
- [Pages preview](../../actions/workflows/pages-preview.yml): optional manual deployment for phone-browser testing. Enable GitHub Pages with Actions as the source first.

The first successful run is **not yet confirmed**. See `docs/CI_MOBILE_BUILDS.md` for details. A generated npm lockfile is not yet committed.

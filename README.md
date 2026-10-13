# FIELDWORK PCB

A browser-based PCB engineering design workbench with transparent calculation models, interactive diagrams, stackup editing, and traceable engineering references.

## Project status

The current development snapshot is **v0.13 (Signal Propagation)**. The source has been developed locally and is **not yet committed to this GitHub repository**.

Features in the local snapshot include:

- PCB stackup editor with versioned JSON save/load
- Via geometry and first-order electrical models
- Hammerstad–Jensen microstrip impedance
- Preliminary differential-pair and symmetric stripline models
- Conductor resistance and thermal scenario calculations
- Plane capacitance, PDN, reactance, and signal propagation
- Material presets, documented assumptions, and numerical tests

## Engineering qualification

This is an evolving engineering prototype. Model provenance, validity limits, and verification levels must be clearly presented to users. Some calculations are approximations and are not substitutes for measured data or EM/thermal simulations.

**IPC-2152 fitting and Saturn thermal coefficient extraction are currently on hold** pending access to a legitimately obtained standard and suitable validation data.

## Source organization (planned)

- `docs/` — requirements, coverage and reference registers
- `fixtures/` — non-proprietary numerical test vectors
- `*.mjs` — calculation modules and automated tests
- `index.html` / `app.mjs` — browser interface

The proprietary Saturn PCB Toolkit application and the separate Saturn reference-test harness are **not** to be included in this repository.

## Development principles

1. Favor independent published engineering equations and preserve citations.
2. Test numerical behavior, units, edge cases, and applicability constraints.
3. Keep calculation code separate from presentation.
4. Maintain an original, modern interface rather than copying Saturn's UI.
5. Keep reference-test automation in its own repository.

# Build and release infrastructure audit — v0.33

## Existing repository

- Main stack: React 18, Mantine 7, Vite 6, plain JavaScript / ES modules, separate pure numeric models.
- Deployment: static browser/PWA candidate, GitHub Pages preview, Capacitor 8 for Android/iOS.
- Verification: Node's built-in assert scripts, Playwright/Chromium smoke tests, separate KiCad reference workflow.
- Native builds: macOS/Xcode unsigned iOS Simulator target, Android/JDK debug build.
- Original Makefile contained host-specific bootstrap logic, but npm is the **canonical** JS build frontend. GNU Make remains an optional convenience wrapper.

## Decisions

1. **Keep npm** rather than migrate to pnpm during the incomplete React migration. pnpm would introduce package-manager churn without material benefit for this small single-package repository.
2. Pin **Node.js 22** using `.node-version` and enforce Node/npm versions through `package.json`, `.npmrc`, and `npm run doctor`.
3. **Lockfile is mandatory before release.** This environment cannot resolve registry.npmjs.org and therefore cannot safely generate a genuine `package-lock.json`. Never invent dependency integrity hashes.
4. `node scripts/install-deps.mjs` uses `npm ci` when the lockfile is available; until then it runs `npm install` with an explicit reproducibility warning.
5. GitHub [Generate dependency lockfile](../.github/workflows/lockfile.yml) can produce and test an authentic lockfile on a networked runner. Download `fieldwork-package-lock`, commit `package-lock.json`, and use `npm run doctor:release` to confirm release readiness. Do not treat the workflow artifact itself as a committed lockfile.
6. Keep numerical unit tests **dependency-free** where possible; they can run independently of frontend installation.
7. Keep GPL KiCad-derived reference tools in separate CI checkout. No external GPL binary is shipped to FIELDWORK production.
8. iOS requires Apple signing for TestFlight and device builds; the configured native workflow generates an unsigned simulator app only.

## New computer — minimal commands

On macOS/Linux:

```sh
sh scripts/bootstrap.sh
npm run doctor
npm test
npm run build
npm run dev
```

On Windows PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
npm.cmd run doctor
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

`make setup` and `make build` are optional wrappers. Node 22 installation on Linux depends on your distro's package availability; bootstrap fails clearly rather than adding unapproved third-party apt repositories. See `docs/DEVELOPER_SETUP.md`.

## Verification and release gates

| Gate | State |
|---|---|
| Host runtime declaration | Implemented |
| Canonical npm scripts | Implemented |
| Dependency lockfile | **BLOCKED: missing, must generate and commit** |
| Web numerical tests | Configured; no verified green run |
| Playwright desktop/mobile tests | Configured; no verified green run |
| GitHub Pages preview | Configured; live deployment not verified |
| Native Android debug | Configured; build unverified |
| Native iOS simulator | Configured; build unverified |
| Signed TestFlight/App Store release | Not implemented |
| KiCad independent results | Workflow configured; numerical agreement unverified |

Before tagging 1.0: commit lockfile, use `npm ci`, inspect Actions logs, enforce green required checks, verify web preview/screenshots and real iOS Safari, review dependency vulnerabilities and licenses, and conduct model-specific numerical qualification. No release success is claimed here.

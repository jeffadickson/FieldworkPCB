# CI/CD and mobile preview builds

FIELDWORK uses a **single React/Vite web application**. GitHub Actions can compile it on Linux and package it for Android and iOS on hosted runners. The original engineering engine and source references remain platform-independent.

## Web CI (automatic)

File: `.github/workflows/web-build.yml`. Runs on pushes to `main`, pull requests, and manual dispatch. It:

1. Installs npm dependencies on Node 22.
2. Runs numerical unit tests (`npm test`).
3. Builds the production website (`npm run build`).
4. Runs Playwright Chromium smoke tests on desktop and iPhone-size viewports.
5. Uploads `dist/`, the generated `package-lock.json`, and browser reports as a downloadable **fieldwork-web-build** artifact.

The generated lockfile is an artifact only. **Commit a verified `package-lock.json` and change CI to `npm ci`** once the first successful install is available. No successful GitHub run has been verified at the time of writing.

## Native preview builds (manual)

File: `.github/workflows/native-builds.yml`. From **Actions → Native preview builds → Run workflow**, select `android`, `ios`, or `both`.

- Android: Ubuntu + JDK 21, `cap add android`, `cap sync android`, Gradle `assembleDebug`. Output is an **unsigned/debug APK** for testing.
- iOS: macOS 26 + Xcode, `cap add ios`, `cap sync ios`, `xcodebuild` for **iOS Simulator without signing**. This is **not** an installable signed IPA for a physical iPhone.

The workflows scaffold native projects from Capacitor configuration during CI; native source folders are not yet committed. These builds remain **unverified until GitHub runners execute them**.

For TestFlight/App Store builds we will need an Apple Developer account, bundle identifier ownership, provisioning profiles, distribution certificate and App Store Connect API credentials stored as GitHub Actions secrets. Do not commit secrets.

## Local development

```bash
npm install
npm test
npm run build
npm run test:e2e
npm run dev
```

First install the browser locally with `npx playwright install chromium` before running Playwright tests.

## Current product scope

The GitHub React application currently exposes the conductor thermal and microstrip design workspaces. Legacy via, stackup and other calculators still need parity-tested migration. CI success verifies that the **currently committed** application builds; it does not certify physical accuracy or completeness of the full FIELDWORK roadmap.

## Security and provenance

- Imported project files must be validated and must not execute code.
- Native apps should operate offline by default with minimal permissions.
- Never upload confidential PCB project data as CI test fixtures.
- The separate Saturn regression repository remains separate.

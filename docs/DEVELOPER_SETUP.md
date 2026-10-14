# Cross-platform developer bootstrap

A `Makefile` and host-specific bootstrap scripts install/check the required development environment. The project requires **Node.js 22+**, npm and (for browser tests) Playwright Chromium.

## Windows

Install GNU Make if desired (e.g. `winget install GnuWin32.Make`, or `scoop install make`). If Make isn't installed, run the PowerShell bootstrap directly from the repository root:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
```

The script attempts Node.js LTS installation through `winget` if Node 22+ is missing; it then installs npm dependencies and Playwright Chromium. Installing software may trigger Windows elevation/winget prompts. Restart PowerShell if Node was just installed and PATH has not refreshed.

## macOS

Install Homebrew if Node is missing; `make setup` will then install `node@22` with Homebrew. For iOS packaging install Xcode separately from Apple and accept its license; automation cannot substitute for Apple's signing credentials.

```sh
make setup
make test
make build
```

## Linux

```sh
make setup
make test
make build
```

Node is installed using existing `apt-get`, `dnf` or `pacman` repositories when absent. Distro repositories may not contain Node 22+: in that case setup stops with a clear error and requires installing a supported current Node version from the official source. It does **not** silently execute a third-party network installer script. Package installation may require sudo and access to network package mirrors.

## Common commands

| Command | Effect |
|---|---|
| `make doctor` | Display installed tool versions |
| `make setup` | Ensure Node/npm; install dependencies and Playwright browser |
| `make install` | npm ci if lockfile exists, otherwise npm install |
| `make browsers` | Install Playwright Chromium |
| `make dev` | Run local Vite server |
| `make build` | Build web deployment |
| `make test` | Run numeric tests |
| `make test-e2e` | Run Playwright tests |
| `make preview` | Preview generated production website |
| `make android` | Build web and synchronize Capacitor Android project |
| `make ios` | Build web and synchronize Capacitor iOS project (requires macOS for native builds) |

**Important:** Android/iOS targets sync existing Capacitor projects; the actual Android Gradle/SDK and iOS Xcode setup is separate. Do not infer that a native build succeeded from a successful `make setup`. Browser setup installs Chromium only, not Apple's Simulator. No successful end-to-end setup has been verified yet.

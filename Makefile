.DEFAULT_GOAL := help
.PHONY: help doctor setup install browsers dev build test test-e2e preview clean android ios

# Windows: GNU Make (winget install GnuWin32.Make or scoop install make).
# All platforms can run the bootstrap script directly without make.
ifeq ($(OS),Windows_NT)
BOOTSTRAP = powershell -NoProfile -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
NPM = npm.cmd
NPX = npx.cmd
CLEAN = powershell -NoProfile -Command "Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue"
else
BOOTSTRAP = sh scripts/bootstrap.sh
NPM = npm
NPX = npx
CLEAN = rm -rf dist
endif

help:
	@echo FIELDWORK PCB developer targets
	@echo "make setup      Install/check Node 22, npm dependencies and Playwright Chromium"
	@echo "make doctor     Check platform development prerequisites"
	@echo "make install    Install npm dependencies (requires Node/npm)"
	@echo "make browsers   Install Playwright Chromium"
	@echo "make dev        Run Vite development server"
	@echo "make build      Build the production web app"
	@echo "make test       Run numerical regression tests"
	@echo "make test-e2e   Run Playwright browser tests"
	@echo "make preview    Serve the production build locally"
	@echo "make android    Build and synchronize Capacitor Android assets"
	@echo "make ios        Build and synchronize Capacitor iOS assets (macOS/Xcode)"
	@echo "make clean      Remove generated web build"

doctor:
	$(BOOTSTRAP) --doctor

setup:
	$(BOOTSTRAP)

install:
	$(BOOTSTRAP) --deps-only

browsers:
	$(BOOTSTRAP) --browsers-only

dev:
	$(NPM) run dev

build:
	$(NPM) run build

test:
	$(NPM) test

test-e2e:
	$(NPM) run test:e2e

preview:
	$(NPM) run preview

android:
	$(NPM) run build
	$(NPX) cap sync android

ios:
	$(NPM) run build
	$(NPX) cap sync ios

clean:
	$(CLEAN)

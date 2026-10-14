#!/bin/sh
set -eu
mode="${1:-setup}"
command -v uname >/dev/null 2>&1 || { echo "Unix shell required"; exit 1; }
os="$(uname -s)"
install_node() {
  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
    major="$(node -p 'process.versions.node.split(".")[0]')"
    if [ "$major" -ge 22 ]; then return; fi
  fi
  echo "Node.js 22+ not found. Installing using platform package manager."
  if [ "$os" = Darwin ]; then
    command -v brew >/dev/null 2>&1 || { echo "Install Homebrew from https://brew.sh or Node 22 manually, then rerun."; exit 1; }
    brew install node@22
    export PATH="$(brew --prefix node@22)/bin:$PATH"
  elif command -v apt-get >/dev/null 2>&1; then
    echo "Attempting Debian/Ubuntu system packages (may not provide Node 22+)."
    if command -v sudo >/dev/null 2>&1; then sudo apt-get update && sudo apt-get install -y nodejs npm
    elif [ "$(id -u)" -eq 0 ]; then apt-get update && apt-get install -y nodejs npm
    else echo "sudo or root is required for apt installation"; exit 1; fi
  elif command -v dnf >/dev/null 2>&1; then
    if command -v sudo >/dev/null 2>&1; then sudo dnf install -y nodejs npm
    elif [ "$(id -u)" -eq 0 ]; then dnf install -y nodejs npm
    else echo "sudo or root is required for dnf installation"; exit 1; fi
  elif command -v pacman >/dev/null 2>&1; then
    if command -v sudo >/dev/null 2>&1; then sudo pacman -S --needed --noconfirm nodejs npm
    elif [ "$(id -u)" -eq 0 ]; then pacman -S --needed --noconfirm nodejs npm
    else echo "sudo or root is required for pacman installation"; exit 1; fi
  else
    echo "Install Node 22+ from https://nodejs.org/en/download and rerun."
    exit 1
  fi
  if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
    echo "System packages did not provide Node 22+. Install a current Node LTS via https://nodejs.org/en/download (or an approved version manager), then rerun."
    exit 1
  fi
}
doctor() {
  echo "Platform: $os"
  if command -v node >/dev/null 2>&1; then node --version; else echo "Node missing"; fi
  if command -v npm >/dev/null 2>&1; then npm --version; else echo "npm missing"; fi
  if command -v git >/dev/null 2>&1; then git --version; else echo "Git missing (optional for local downloaded sources)"; fi
  if command -v make >/dev/null 2>&1; then make --version | head -n 1; else echo "GNU Make missing (optional: run this script directly)"; fi
}
install_deps() {
  if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi
}
install_browser() {
  npx playwright install chromium
}
case "$mode" in
  --doctor) doctor ;;
  --deps-only) install_node; install_deps ;;
  --browsers-only) install_node; install_deps; install_browser ;;
  setup|"") install_node; install_deps; install_browser; doctor ;;
  *) echo "Unknown option $mode"; exit 2 ;;
esac

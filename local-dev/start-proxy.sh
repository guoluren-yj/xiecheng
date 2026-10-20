#!/usr/bin/env bash
# macOS / Linux: start local nginx reverse proxy on port 80
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
NODE_BIN="$(command -v node)"

if ! command -v nginx >/dev/null 2>&1; then
  echo "nginx not found. Install with: brew install nginx"
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  echo "Port 80 requires root. Re-running with sudo..."
  exec sudo "$NODE_BIN" "$ROOT/local-dev/proxy.js" start
fi

"$NODE_BIN" "$ROOT/local-dev/proxy.js" start

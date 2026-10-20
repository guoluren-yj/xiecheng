#!/usr/bin/env bash
# macOS / Linux: stop local nginx reverse proxy
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
NODE_BIN="$(command -v node)"

if [ "$(id -u)" -ne 0 ]; then
  exec sudo "$NODE_BIN" "$ROOT/local-dev/proxy.js" stop
fi

"$NODE_BIN" "$ROOT/local-dev/proxy.js" stop

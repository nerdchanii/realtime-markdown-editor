#!/usr/bin/env bash
set -euo pipefail

if command -v fnm >/dev/null 2>&1; then
  export XDG_STATE_HOME="${XDG_STATE_HOME:-/tmp/rme-fnm-state}"
  eval "$(fnm env --shell bash --log-level quiet)"
  fnm use >/dev/null
elif command -v node >/dev/null 2>&1; then
  echo "with-node: fnm not found; using $(node --version) from PATH (.nvmrc wants $(cat "$(dirname "$0")/../.nvmrc"))." >&2
else
  echo "with-node: neither fnm nor node is available." >&2
  exit 1
fi

exec "$@"

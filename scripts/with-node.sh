#!/usr/bin/env bash
set -euo pipefail

if ! command -v fnm >/dev/null 2>&1; then
  echo "fnm is required to select the repository Node.js version." >&2
  exit 1
fi

export XDG_STATE_HOME="${XDG_STATE_HOME:-/tmp/rme-fnm-state}"

eval "$(fnm env --shell bash --log-level quiet)"
fnm use >/dev/null

exec "$@"

#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"
_SETTINGS_FILE="${SCRIPT_DIR}/settings.${_WORKTREE}.txt"
[[ -f "${_SETTINGS_FILE}" ]] || { echo "ERROR: settings file not found: ${_SETTINGS_FILE}" >&2; exit 1; }
source "${_SETTINGS_FILE}"

FRONTEND_PATH="${PROJECT_ROOT}/${FRONTEND_DIR}"

if [[ ! -d "${FRONTEND_PATH}/node_modules" ]]; then
    echo "node_modules not found — running npm install..."
    (cd "${FRONTEND_PATH}" && npm install)
fi

# Write Vite env file
"${SCRIPT_DIR}/generate-env.sh"

# Clear any process already holding the frontend port
_clear_port() {
    local port="$1"
    local pids
    pids=$(ss -tlnp "sport = :${port}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u)
    [[ -z "$pids" ]] && return
    echo "⚠️  Port ${port} in use — killing existing process(es): ${pids}" >&2
    kill -TERM $pids 2>/dev/null || true
    sleep 1
    pids=$(ss -tlnp "sport = :${port}" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | sort -u)
    [[ -n "$pids" ]] && { kill -KILL $pids 2>/dev/null || true; sleep 0.5; }
}
_clear_port "${FRONTEND_PORT}"

echo "Starting Vite dev server — port ${FRONTEND_PORT} (ENV=${ENV})"

cd "${FRONTEND_PATH}"
exec npm run dev -- --host --port "${FRONTEND_PORT}"

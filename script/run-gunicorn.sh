#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"
_SETTINGS_FILE="${SCRIPT_DIR}/settings.${_WORKTREE}.txt"
[[ -f "${_SETTINGS_FILE}" ]] || { echo "ERROR: settings file not found: ${_SETTINGS_FILE}" >&2; exit 1; }
source "${_SETTINGS_FILE}"

BACKEND_PATH="${PROJECT_ROOT}/${BACKEND_DIR}"

if [[ -x "${BACKEND_PATH}/.venv/bin/python3" ]]; then
    PYTHON_BIN="${BACKEND_PATH}/.venv/bin/python3"
fi

export BACKEND_HOST BACKEND_PORT ALLOWED_CORS_DOMAINS ENV DEBUG
export VERSION_MAJOR VERSION_MINOR VERSION_BUILD_NUMBER

echo "Starting Gunicorn — ${BACKEND_HOST}:${BACKEND_PORT}, workers=${WORKERS} (ENV=${ENV})"

cd "${BACKEND_PATH}"
exec ${PYTHON_BIN} -m gunicorn \
    -k eventlet \
    -w "${WORKERS}" \
    -b "${BACKEND_HOST}:${BACKEND_PORT}" \
    "${BACKEND_APP_SCRIPT}:app"

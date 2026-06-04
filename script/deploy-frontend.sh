#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"
_SETTINGS_FILE="${SCRIPT_DIR}/settings.${_WORKTREE}.txt"
[[ -f "${_SETTINGS_FILE}" ]] || { echo "ERROR: settings file not found: ${_SETTINGS_FILE}" >&2; exit 1; }
source "${_SETTINGS_FILE}"

FRONTEND_PATH="${PROJECT_ROOT}/${FRONTEND_DIR}"
BUILD_DIR="${FRONTEND_PATH}/build"

echo "=== Frontend Deploy ==="
echo "Source: ${FRONTEND_PATH}"
echo "Build:  ${BUILD_DIR}"
echo ""

if [[ ! -d "${FRONTEND_PATH}/node_modules" ]]; then
    echo "Installing dependencies..."
    (cd "${FRONTEND_PATH}" && npm ci --production=false)
fi

echo "Regenerating frontend/.env from settings..."
"${SCRIPT_DIR}/generate-env.sh"

echo "Building..."
(cd "${FRONTEND_PATH}" && npm run build)

[[ -d "${BUILD_DIR}" ]] || { echo "ERROR: Build failed — ${BUILD_DIR} not found" >&2; exit 1; }

# Reset ownership of build output to the running user:group so subsequent runs
# by any authorized user (e.g. dxb) can overwrite files created by a prior root run.
chown -R "$(id -u):$(id -g)" "${BUILD_DIR}" 2>/dev/null || true

echo "Frontend built at ${BUILD_DIR}"

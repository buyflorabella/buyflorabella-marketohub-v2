#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"
_SETTINGS_FILE="${SCRIPT_DIR}/settings.${_WORKTREE}.txt"
[[ -f "${_SETTINGS_FILE}" ]] || { echo "ERROR: settings file not found: ${_SETTINGS_FILE}" >&2; exit 1; }
source "${_SETTINGS_FILE}"

BACKEND_PATH="${PROJECT_ROOT}/${BACKEND_DIR}"

# Use project venv if present, otherwise fall back to system python3
if [[ -x "${BACKEND_PATH}/.venv/bin/python3" ]]; then
    PYTHON_BIN="${BACKEND_PATH}/.venv/bin/python3"
fi

export BACKEND_HOST BACKEND_PORT ALLOWED_CORS_DOMAINS ENV DEBUG
export FLASK_HOST="${BACKEND_HOST}"
export FLASK_PORT="${BACKEND_PORT}"
export FLASK_SECRET_KEY SESSION_COOKIE_DOMAIN
export GA_MEASUREMENT_ID CLARITY_PROJECT_ID
export OTP_DEV_MODE SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS NOTIFICATION_EMAIL
export ADMIN_EMAIL ADMIN_PASSWORD
export SITE_ACCESS_MODE SITE_PASSWORD MAINTENANCE_TARGET_UTC
export SMAC_DATA_ROOT SWIZZLES_PATH INPUT_FILES_PATH CODE_TO_INTEGRATE_PATH
export CRON_SECRET
export MONGO_URI
export VERSION_MAJOR VERSION_MINOR VERSION_BUILD_NUMBER
export LOG_LEVEL PYMONGO_DEBUG

# Clear any process already holding the backend port (Flask reloader leaves orphans on Ctrl+C)
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
_clear_port "${BACKEND_PORT}"

echo "Starting Flask backend — ${BACKEND_HOST}:${BACKEND_PORT} (ENV=${ENV}) using database at: ${MONGO_URI}"

cd "${BACKEND_PATH}"
exec ${PYTHON_BIN} "${BACKEND_APP_SCRIPT}.py"

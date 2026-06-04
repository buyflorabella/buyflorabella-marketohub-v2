#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"
_SETTINGS_FILE="${SCRIPT_DIR}/settings.${_WORKTREE}.txt"
[[ -f "${_SETTINGS_FILE}" ]] || { echo "ERROR: settings file not found: ${_SETTINGS_FILE}" >&2; exit 1; }
source "${_SETTINGS_FILE}"

WEBROOT="${PROJECT_ROOT}"
TEMPLATE_DIR="${PROJECT_ROOT}/backend/systemd"
SERVICE_TEMPLATE="${TEMPLATE_DIR}/app.service"
ENV_TEMPLATE="${TEMPLATE_DIR}/app.env"
SERVICE_DEST="/etc/systemd/system/${SITE_NAME}.service"
ENV_DEST="/etc/systemd/system/${SITE_NAME}.env"

echo "=== Backend Deploy ==="
echo "Site:    ${SITE_NAME}"
echo "Webroot: ${WEBROOT}"
echo "Service: ${SERVICE_DEST}"
echo ""

[[ -f "${SERVICE_TEMPLATE}" ]] || { echo "ERROR: Missing ${SERVICE_TEMPLATE}" >&2; exit 1; }
[[ -f "${ENV_TEMPLATE}" ]]     || { echo "ERROR: Missing ${ENV_TEMPLATE}" >&2; exit 1; }

# Production deploy always runs with ENV=prod unless caller explicitly overrides
ENV="${ENV_OVERRIDE:-prod}"
DEBUG="false"

# FLASK_SECRET_KEY resolution (in priority order):
#   1. Caller-provided environment variable  (explicit override)
#   2. Already deployed env file             (re-deploy: preserve existing key so sessions survive)
#   3. Generate a new one                    (first deploy)
if [[ -z "${FLASK_SECRET_KEY:-}" || "${FLASK_SECRET_KEY}" == "change-me-generate-a-real-secret" ]]; then
    if [[ -f "${ENV_DEST}" ]]; then
        FLASK_SECRET_KEY=$(grep '^FLASK_SECRET_KEY=' "${ENV_DEST}" | cut -d= -f2-)
        echo "Reusing existing FLASK_SECRET_KEY from ${ENV_DEST}"
    fi
fi
if [[ -z "${FLASK_SECRET_KEY:-}" || "${FLASK_SECRET_KEY}" == "change-me-generate-a-real-secret" ]]; then
    FLASK_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))")
    echo "Generated new FLASK_SECRET_KEY (first deploy)"
fi

export SITE_NAME WEBROOT WORKERS BACKEND_PORT BACKEND_HOST BACKEND_APP_SCRIPT
export GUNICORN_USER GUNICORN_GROUP PYTHON_BIN
export ENV DEBUG FRONTEND_PORT ALLOWED_CORS_DOMAINS SESSION_COOKIE_DOMAIN FLASK_SECRET_KEY
export VERSION_MAJOR VERSION_MINOR VERSION_BUILD_NUMBER
export MONGO_URI
export GA_MEASUREMENT_ID CLARITY_PROJECT_ID
export OTP_DEV_MODE OTP_RATE_LIMIT_ENABLED SMTP_HOST SMTP_PORT SMTP_USER SMTP_PASS NOTIFICATION_EMAIL
export ADMIN_EMAIL ADMIN_PASSWORD RESET_ADMIN_CREDENTIALS
export ARCADESTORE_ENDPOINT ARCADESTORE_SITE_TOKEN
export SITE_ACCESS_MODE SITE_PASSWORD MAINTENANCE_TARGET_UTC
export SMAC_DATA_ROOT SWIZZLES_PATH INPUT_FILES_PATH SOUNDFONT_PATH AUDIO_OUTPUT_DIR CODE_TO_INTEGRATE_PATH
export ADMIN_URL FRONTEND_URL
export CRON_SECRET STRIPE_SECRET_KEY STRIPE_PUBLISHABLE_KEY STRIPE_WEBHOOK_SECRET
export STRIPE_PRICE_BASIC STRIPE_PRICE_ADVANCED STRIPE_PRICE_PREMIUM STRIPE_PRICE_ULTIMATE

if [[ $EUID -ne 0 ]]; then
    echo "ERROR: Writing to /etc/systemd/system/ requires root. Run with: sudo ./script/deploy-backend.sh" >&2
    exit 1
fi

envsubst < "${SERVICE_TEMPLATE}" > "/tmp/${SITE_NAME}.service"
envsubst < "${ENV_TEMPLATE}"     > "/tmp/${SITE_NAME}.env"

cp "/tmp/${SITE_NAME}.service" "${SERVICE_DEST}" && chmod 644 "${SERVICE_DEST}"
cp "/tmp/${SITE_NAME}.env"     "${ENV_DEST}"     && chown root:apache "${ENV_DEST}" && chmod 640 "${ENV_DEST}"
rm -f "/tmp/${SITE_NAME}.service" "/tmp/${SITE_NAME}.env"

systemctl daemon-reload
systemctl enable "${SITE_NAME}"
systemctl restart "${SITE_NAME}"

echo "Backend deployed. Check: systemctl status ${SITE_NAME}"

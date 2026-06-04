#!/usr/bin/env bash
set -e

# Load shared settings
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo "BASE_DIR:${BASE_DIR}"
source "${BASE_DIR}/settings"

usage() {
    echo "Usage: $0 [--help]"
    echo
    echo "Runs the primary Python application defined in settings."
    echo
    echo "Settings loaded from: script/settings"
    echo "Python script: ${APP_SCRIPT}"
    echo
    exit 0
}

# Handle command-line flags
if [[ "$1" == "--help" ]]; then
    usage
fi

export FLASK_HOST="${HOST}"
export FLASK_PORT="${PORT}"

echo "FLASK_HOST=${FLASK_HOST}  FLASK_PORT=${FLASK_PORT}"
echo "Running ${APP_DIR}${APP_SCRIPT} using ${PYTHON_BIN}"
${PYTHON_BIN} "${APP_DIR}${APP_SCRIPT}"

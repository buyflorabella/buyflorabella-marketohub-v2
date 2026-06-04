#!/usr/bin/env bash
set -e

# Load shared settings
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${BASE_DIR}/script/settings"

usage() {
    echo "Usage: $0 [--help]"
    echo
    echo "Starts Gunicorn using settings from script/settings."
    echo
    echo "App:        ${GUNICORN_APP_NAME}:app"
    echo "Workers:    ${WORKERS}"
    echo "Host:       ${HOST}"
    echo "Port:       ${PORT}"
    echo
    echo "Example:"
    echo "    ./gunicorn.sh"
    echo
    exit 0
}

# Check for --help
if [[ "$1" == "--help" ]]; then
    usage
fi

echo "Starting Gunicorn for ${GUNICORN_APP_NAME}:app"
echo "Workers: ${WORKERS}, Host: ${HOST}, Port: ${PORT}"

gunicorn \
    --reload \
    -k gevent \
    -w "${WORKERS}" \
    -b "${HOST}:${PORT}" \
    "${GUNICORN_APP_NAME}:app"

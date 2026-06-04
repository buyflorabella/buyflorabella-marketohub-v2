#!/usr/bin/env bash
set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${BASE_DIR}/settings"

usage() {
    echo "Usage: $0 [--help]"
    echo
    echo "Runs the React frontend (npm run dev)"
    echo
    echo "Frontend directory: ${FRONTEND_DIR}"
    echo "Host: ${FRONTEND_HOST}"
    echo "Port: ${FRONTEND_PORT}"
    exit 0
}

[[ "$1" == "--help" ]] && usage

echo "Starting React frontend"
echo "Directory: ${FRONTEND_DIR}"
echo "Host: ${FRONTEND_HOST}"
echo "Port: ${FRONTEND_PORT}"

cd "${BASE_DIR}/../${FRONTEND_DIR}"

export HOST="${FRONTEND_HOST}"
export PORT="${FRONTEND_PORT}"

set -x
#npm run dev -- --port ${FRONTEND_PORT}
shopify hydrogen dev --host --port ${FRONTEND_PORT}

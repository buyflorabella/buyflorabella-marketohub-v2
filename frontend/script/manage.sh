#!/usr/bin/env bash
set -e

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "${BASE_DIR}/settings"

usage() {
    echo "Usage: $0 [option]"
    echo
    echo "Options:"
    echo "  --backend      Run Flask backend (dev mode)"
    echo "  --gunicorn     Run production backend (Gunicorn)"
    echo "  --frontend     Run React frontend dev server"
    echo "  --help         Show this help"
    echo
    exit 0
}

case "$1" in
    --backend)
        "${BASE_DIR}/run.sh"
        ;;

    --gunicorn)
        "${BASE_DIR}/run_under_gunicorn.sh"
        ;;

    --frontend)
        "${BASE_DIR}/run_frontend.sh"
        ;;

    --help|"")
        usage
        ;;

    *)
        echo "Unknown option: $1"
        usage
        ;;
esac

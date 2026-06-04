#!/usr/bin/env bash
#
# Unified deploy entrypoint
#
# Usage:
#   script/deploy.sh --frontend   Deploy frontend only (build + rsync)
#   script/deploy.sh --backend    Deploy backend only (systemd install)
#   script/deploy.sh --all        Deploy both frontend and backend
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

case "${1:-}" in
    --frontend)
        "$SCRIPT_DIR/deploy-frontend.sh"
        ;;
    --backend)
        "$SCRIPT_DIR/deploy-backend.sh"
        ;;
    --all)
        "$SCRIPT_DIR/deploy-frontend.sh"
        echo ""
        echo "────────────────────────────────────────"
        echo ""
        "$SCRIPT_DIR/deploy-backend.sh"
        ;;
    *)
        echo "Usage:"
        echo "  script/deploy.sh --frontend   Build and deploy React frontend"
        echo "  script/deploy.sh --backend    Install systemd service and restart"
        echo "  script/deploy.sh --all        Deploy both frontend and backend"
        exit 1
        ;;
esac

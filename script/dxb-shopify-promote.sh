#!/usr/bin/env bash
set -e

# Shopify Oxygen Promote
# Copies frontend/ from master branch into the main/ worktree (flat Hydrogen-at-root structure),
# commits, and pushes origin/main — triggering the Oxygen deployment workflow.
#
# Must be run from the prod/ worktree (master branch).
# The main/ worktree at /var/www/html/buyflorabella/main must already exist.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
_WORKTREE="$(basename "${PROJECT_ROOT}")"

MAIN_WORKTREE="/var/www/html/buyflorabella/main"
FRONTEND_SRC="${PROJECT_ROOT}/frontend"

# ── Sync frontend → worktree ─────────────────────────────
#rsync -a --delete \
rsync -a \
  --exclude='.git/' \
  --exclude='node_modules/' \
  --exclude='.env.*' \
  --exclude='*.log' \
  --exclude='.env*' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='.cache/' \
  --exclude='/.react-router/' \
  --exclude='.shopify/' \
  --exclude='script/' \
  "${FRONTEND_SRC%/}/" "${MAIN_WORKTREE%/}/"
#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_SRC="${PROJECT_ROOT}/frontend"
MAIN_WORKTREE="/var/www/html/buyflorabella/main"

cd "${PROJECT_ROOT}"

SOURCE_SHA="$(git rev-parse --short HEAD)"

echo "[INFO] Deploying Shopify Oxygen build from master@${SOURCE_SHA}"

# ── Safety checks ─────────────────────────────
[[ -d "$FRONTEND_SRC" ]] || { echo "[ERROR] frontend/ not found"; exit 1; }
[[ -d "$MAIN_WORKTREE" ]] || { echo "[ERROR] main worktree not found"; exit 1; }

# ── Sync frontend → worktree ─────────────────────────────
rsync -a --delete \
  --exclude='.git/' \
  --exclude='.github/' \
  --exclude='node_modules/' \
  --exclude='.env*' \
  --exclude='dist/' \
  --exclude='build/' \
  --exclude='.cache/' \
  --exclude='.shopify/' \
  --exclude='script/' \
  "${FRONTEND_SRC%/}/" "${MAIN_WORKTREE%/}/"

cd "${MAIN_WORKTREE}"

# ── Ensure correct branch context ────────────────────────
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD || true)"

if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "[ERROR] main worktree is not on branch 'main' (current: $CURRENT_BRANCH)"
  exit 1
fi

# ── Commit ────────────────────────────────────────────────
git add -A

if git diff --cached --quiet; then
  git commit --allow-empty -m "shopify-redeploy: master@${SOURCE_SHA}"
else
  git commit -m "shopify-update: master@${SOURCE_SHA}"
fi

# ── Ensure deploy remote exists and is correct ────────────
DEPLOY_REMOTE="git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git"

if git remote get-url deploy >/dev/null 2>&1; then
  git remote set-url deploy "$DEPLOY_REMOTE"
else
  git remote add deploy "$DEPLOY_REMOTE"
fi

# ── Push (force safety optional) ──────────────────────────
git push deploy main

echo "[SUCCESS] Shopify deployment triggered"
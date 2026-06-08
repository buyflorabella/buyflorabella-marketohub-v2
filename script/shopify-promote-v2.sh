#!/usr/bin/env bash
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_SRC="${PROJECT_ROOT}/frontend"
MAIN_WORKTREE="/var/www/html/buyflorabella/main"

cd "${PROJECT_ROOT}"

SOURCE_SHA=$(git rev-parse --short HEAD)

echo "[INFO] Deploying Shopify Oxygen build from master@${SOURCE_SHA}"

# ── Sync frontend → worktree ─────────────────────────────
rsync -a --delete \
  --exclude='.git' \ 
  --exclude='.github' \ 
  --exclude='node_modules' \
  --exclude='.env*' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='.cache' \
  --exclude='.shopify' \
  "${FRONTEND_SRC}/" "${MAIN_WORKTREE}/"

cd "${MAIN_WORKTREE}"

# ── Ensure repo state ─────────────────────────────────────
git add -A

if git diff --cached --quiet; then
  git commit --allow-empty -m "shopify-redeploy: master@${SOURCE_SHA}"
else
  git commit -m "shopify-update: master@${SOURCE_SHA}"
fi

# ── Ensure deploy remote exists ──────────────────────────
DEPLOY_REMOTE="git@github.com:boardmansgameremotedeveloper/buyflorabella-marketohub-v2.git"

git remote | grep -q deploy || git remote add deploy "$DEPLOY_REMOTE"

# ── Push to Shopify Oxygen ───────────────────────────────
git push deploy main

echo "[SUCCESS] Shopify deployment triggered"